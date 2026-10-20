"""Consultas de lectura sobre entrevistas.

Separadas de `services.py` para que quede explícito qué toca la base de datos
sin modificarla. Todas reciben el usuario y filtran por él: la pertenencia se
resuelve en la consulta, no después de haber leído la fila.
"""

from __future__ import annotations

from statistics import fmean

from django.db.models import Avg, Count
from django.shortcuts import get_object_or_404

from apps.evaluaciones.rubricas import CRITERIOS, NOMBRES_DE_CRITERIOS, banda_de
from integrations.ia.prompts.schemas import TemaEvaluado

from .models import Entrevista


def entrevista_del_usuario(usuario, pk: int) -> Entrevista:
    """Devuelve la entrevista solo si es de este usuario, si no 404.

    Filtrar por usuario dentro de la consulta es lo que hace que pedir la
    entrevista de otro devuelva 404 y no 403: un 403 confirmaría que existe.
    """
    return get_object_or_404(_con_conteo(Entrevista.objects.all()), pk=pk, usuario=usuario)


def entrevistas_de(usuario):
    return _con_conteo(Entrevista.objects.filter(usuario=usuario))


def _con_conteo(consulta):
    """Anota cuántas preguntas tienen nota, en la misma consulta.

    Lo usa el serializer para marcar como parcial la nota de una entrevista
    abandonada ("sobre 2 de 5"); anotarlo evita una consulta por fila en el
    historial.
    """
    return consulta.select_related("puesto", "nivel", "tecnologia", "segunda_tecnologia").annotate(
        preguntas_calificadas=Count("intercambios__evaluacion")
    )


def intercambio_pendiente(entrevista):
    """Primer intercambio sin evaluar, que es la pregunta que espera respuesta."""
    return entrevista.intercambios.filter(evaluacion__isnull=True).order_by("numero").first()


def primer_intercambio(entrevista):
    """La pregunta con la que arranca la entrevista."""
    return entrevista.intercambios.order_by("numero").first()


def promedio_de_evaluaciones(entrevista):
    """Media de las respuestas ya calificadas, o `None` si no hay ninguna."""
    return entrevista.intercambios.filter(evaluacion__isnull=False).aggregate(
        promedio=Avg("evaluacion__puntuacion")
    )["promedio"]


def intercambios_de(entrevista):
    """Todos los intercambios de la entrevista, en orden, con su evaluación.

    Incluye el que esté pendiente de responder: en una entrevista abandonada
    la pantalla de resultados sí muestra la pregunta que quedó sin contestar.
    Se llamaba `intercambios_con_evaluacion`, nombre que prometía un filtro
    que nunca existió — y por creerlo el chat pintaba dos veces la pregunta
    en curso.
    """
    return entrevista.intercambios.select_related("evaluacion", "area").order_by("numero")


def temas_evaluados(entrevista) -> list[TemaEvaluado]:
    """Resumen comprimido (tema + puntuación) de los turnos ya calificados.

    Se reconstruye desde la base de datos en cada llamada, nunca desde memoria:
    el backend en Render free se duerme por inactividad y puede reiniciarse a
    mitad de entrevista, así que cualquier estado en un diccionario de Python
    se perdería. Es además lo que mantiene acotado el prompt del entrevistador,
    que recibe esto en lugar del historial completo.
    """
    calificados = (
        entrevista.intercambios.filter(evaluacion__isnull=False)
        .select_related("evaluacion")
        .order_by("numero")
    )
    return [
        TemaEvaluado(pregunta=i.pregunta, puntuacion=i.evaluacion.puntuacion) for i in calificados
    ]


def anterior_comparable(entrevista) -> Entrevista | None:
    """La entrevista finalizada inmediatamente anterior con el mismo puesto y nivel.

    Solo es comparable lo que se rindió en las mismas condiciones: otro nivel
    pide otra exigencia, y una abandonada no tiene nota completa. Se compara
    contra `fecha_inicio` de la actual y no contra su `fecha_fin`, que una
    abandonada no tiene, para no compararla nunca consigo misma ni con una
    posterior.
    """
    return (
        Entrevista.objects.filter(
            usuario_id=entrevista.usuario_id,
            puesto_id=entrevista.puesto_id,
            nivel_id=entrevista.nivel_id,
            estado=Entrevista.Estado.FINALIZADA,
            fecha_fin__lt=entrevista.fecha_inicio,
            puntuacion_promedio__isnull=False,
        )
        .exclude(pk=entrevista.pk)
        .order_by("-fecha_fin")
        .first()
    )


def resumen_de(entrevista, intercambios) -> dict | None:
    """El reporte consolidado de una entrevista terminada, sin llamar a la IA.

    Todo sale de las evaluaciones ya guardadas: la banda y el promedio, el
    nivel medio de cada criterio, el criterio más débil, la prioridad para la
    próxima (el área de la respuesta con peor nota y su sugerencia) y la
    diferencia con la entrevista anterior comparable. Es lo que el perfil llama
    consolidar la retroalimentación "en un reporte final".

    `None` si no hay ninguna respuesta calificada: no hay nada que resumir.
    """
    calificados = [i for i in intercambios if getattr(i, "evaluacion", None) is not None]
    if not calificados:
        return None

    notas = [i.evaluacion.puntuacion for i in calificados]
    # Una finalizada tiene su promedio guardado; una abandonada no, y se
    # calcula con la misma media simple sobre lo que sí se respondió.
    promedio = (
        float(entrevista.puntuacion_promedio)
        if entrevista.puntuacion_promedio is not None
        else fmean(notas)
    )
    banda = banda_de(round(promedio))

    con_niveles = [i.evaluacion.niveles for i in calificados if i.evaluacion.niveles is not None]
    criterios = (
        {c: round(fmean(n[c] for n in con_niveles), 2) for c in CRITERIOS} if con_niveles else None
    )
    # Con empate gana el primero en el orden de la rúbrica: determinista.
    mas_debil = min(CRITERIOS, key=lambda c: criterios[c]) if criterios else None

    # Con empate, la pregunta de menor número: el orden en que se vivió.
    peor = min(calificados, key=lambda i: (i.evaluacion.puntuacion, i.numero))

    return {
        "promedio": round(promedio, 2),
        "banda": banda.codigo,
        "banda_display": banda.etiqueta,
        "criterios": criterios,
        "criterios_sobre": len(con_niveles),
        "criterio_mas_debil": (
            {"codigo": mas_debil, "nombre": NOMBRES_DE_CRITERIOS[mas_debil]} if mas_debil else None
        ),
        "prioridad": {
            "numero": peor.numero,
            "area": peor.area.codigo,
            "area_display": peor.area.nombre,
            "puntuacion": peor.evaluacion.puntuacion,
            "sugerencia": peor.evaluacion.sugerencias,
        },
        "comparacion": _comparacion(entrevista, promedio),
    }


def _comparacion(entrevista, promedio: float) -> dict | None:
    # Una nota parcial no se compara con una completa: diría "bajaste 30
    # puntos" cuando lo que pasó es que no terminaste.
    if entrevista.estado != Entrevista.Estado.FINALIZADA:
        return None
    anterior = anterior_comparable(entrevista)
    if anterior is None:
        return None
    return {
        "entrevista_id": anterior.pk,
        "diferencia": round(promedio - float(anterior.puntuacion_promedio), 1),
    }


def ultima_configuracion(usuario) -> Entrevista | None:
    """La entrevista más reciente del usuario, para "Repetir configuración"."""
    return (
        Entrevista.objects.filter(usuario=usuario)
        .select_related("puesto", "nivel", "tecnologia", "segunda_tecnologia")
        .order_by("-fecha_inicio", "-pk")
        .first()
    )

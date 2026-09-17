"""Orquestador del flujo de entrevista.

Es la única pieza del sistema que conoce tanto el proveedor de IA como los
modelos de base de datos. Las vistas del Incremento 3 llamarán exclusivamente
a estas funciones — nunca construirán una consulta de negocio ni tocarán un
adaptador de IA directamente.

Nada de esto guarda estado en memoria: cada llamada reconstruye el contexto
que necesita a partir de PostgreSQL. Es necesario porque el backend en Render
free se duerme por inactividad y puede reiniciarse en cualquier momento —
cualquier estado en un diccionario de Python se perdería a mitad de entrevista.
"""

from __future__ import annotations

from datetime import timedelta

from django.db import transaction
from django.db.models import Avg, Max
from django.utils import timezone

from entrevistas.models import Entrevista, Evaluacion, Intercambio

from .ia.base import ProveedorIA
from .ia.factory import get_proveedor
from .ia.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica, Nivel, TemaEvaluado

MINUTOS_PARA_ABANDONO = 30


def iniciar(usuario, area: AreaTecnica, nivel: Nivel, proveedor: ProveedorIA | None = None):
    """Crea la entrevista y su primera pregunta."""
    proveedor = proveedor or get_proveedor()

    with transaction.atomic():
        entrevista = Entrevista.objects.create(usuario=usuario, area=area.value, nivel=nivel.value)
        pregunta = proveedor.generar_pregunta(area, nivel, numero=1, previas=[])
        Intercambio.objects.create(entrevista=entrevista, numero=pregunta.numero, pregunta=pregunta.texto)

    return entrevista


def _previas(entrevista) -> list[TemaEvaluado]:
    """Reconstruye el resumen comprimido (tema + puntuación) desde la base de
    datos — nunca desde memoria. Es lo que recibe el entrevistador para no
    repetir temas, sin que el prompt crezca con el historial completo.
    """
    calificados = (
        entrevista.intercambios.filter(evaluacion__isnull=False)
        .select_related("evaluacion")
        .order_by("numero")
    )
    return [TemaEvaluado(pregunta=i.pregunta, puntuacion=i.evaluacion.puntuacion) for i in calificados]


def responder(entrevista, texto: str, proveedor: ProveedorIA | None = None):
    """Registra la respuesta al intercambio pendiente, la evalúa, y genera la
    siguiente pregunta o finaliza la entrevista.

    Orden de operaciones, pensado para que un reintento tras un fallo sea
    idempotente: guardar la respuesta -> llamar a la IA -> guardar la
    evaluación -> generar la siguiente pregunta. Si el intercambio ya tiene
    una respuesta guardada (por un intento anterior que falló después de ese
    paso), no se vuelve a escribir — solo se reintenta la evaluación.
    """
    proveedor = proveedor or get_proveedor()
    area = entrevista.area_enum
    nivel = entrevista.nivel_enum

    intercambio = (
        entrevista.intercambios.filter(evaluacion__isnull=True).order_by("numero").first()
    )
    if intercambio is None:
        raise ValueError(f"La entrevista {entrevista.pk} no tiene un intercambio pendiente de respuesta")

    if not intercambio.respuesta:
        intercambio.respuesta = texto
        intercambio.respondido_en = timezone.now()
        intercambio.tiempo_respuesta = int(
            (intercambio.respondido_en - intercambio.creado_en).total_seconds()
        )
        intercambio.save(update_fields=["respuesta", "respondido_en", "tiempo_respuesta"])

    resultado = proveedor.evaluar_respuesta(area, nivel, intercambio.pregunta, intercambio.respuesta)

    with transaction.atomic():
        evaluacion = Evaluacion.objects.create(
            intercambio=intercambio,
            puntuacion=resultado.puntuacion,
            fortalezas=resultado.fortalezas,
            debilidades=resultado.debilidades,
            sugerencias=resultado.sugerencias,
            evaluacion_json={
                "puntuacion": resultado.puntuacion,
                "fortalezas": resultado.fortalezas,
                "debilidades": resultado.debilidades,
                "sugerencias": resultado.sugerencias,
            },
            proveedor_ia=proveedor.nombre,
            modelo_ia=proveedor.modelo,
        )

        siguiente_numero = intercambio.numero + 1
        if siguiente_numero <= PREGUNTAS_POR_ENTREVISTA:
            previas = _previas(entrevista)
            pregunta = proveedor.generar_pregunta(area, nivel, siguiente_numero, previas)
            Intercambio.objects.create(
                entrevista=entrevista, numero=pregunta.numero, pregunta=pregunta.texto
            )
        else:
            _finalizar(entrevista)

    return evaluacion


def _finalizar(entrevista) -> None:
    promedio = entrevista.intercambios.filter(evaluacion__isnull=False).aggregate(
        promedio=Avg("evaluacion__puntuacion")
    )["promedio"]

    entrevista.puntuacion_promedio = promedio
    entrevista.fecha_fin = timezone.now()
    entrevista.estado = Entrevista.Estado.FINALIZADA
    entrevista.save(update_fields=["puntuacion_promedio", "fecha_fin", "estado"])


def marcar_abandonadas(usuario) -> int:
    """Transición perezosa: toda entrevista `EN_PROGRESO` de este usuario con
    más de `MINUTOS_PARA_ABANDONO` sin actividad pasa a `ABANDONADA`.

    Se invoca al consultar el historial, no con un planificador — el plan
    gratuito no ofrece tareas programadas fiables.
    """
    limite = timezone.now() - timedelta(minutes=MINUTOS_PARA_ABANDONO)
    en_progreso = Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.EN_PROGRESO)

    ids_abandonadas = []
    for entrevista in en_progreso:
        ultima_respuesta = entrevista.intercambios.aggregate(m=Max("respondido_en"))["m"]
        ultima_actividad = ultima_respuesta or entrevista.fecha_inicio
        if ultima_actividad < limite:
            ids_abandonadas.append(entrevista.pk)

    if ids_abandonadas:
        Entrevista.objects.filter(pk__in=ids_abandonadas).update(estado=Entrevista.Estado.ABANDONADA)

    return len(ids_abandonadas)

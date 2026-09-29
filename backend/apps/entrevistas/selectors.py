"""Consultas de lectura sobre entrevistas.

Separadas de `services.py` para que quede explícito qué toca la base de datos
sin modificarla. Todas reciben el usuario y filtran por él: la pertenencia se
resuelve en la consulta, no después de haber leído la fila.
"""

from __future__ import annotations

from django.db.models import Avg
from django.shortcuts import get_object_or_404

from integrations.ia.prompts.schemas import TemaEvaluado

from .models import Entrevista


def entrevista_del_usuario(usuario, pk: int) -> Entrevista:
    """Devuelve la entrevista solo si es de este usuario, si no 404.

    Filtrar por usuario dentro de la consulta es lo que hace que pedir la
    entrevista de otro devuelva 404 y no 403: un 403 confirmaría que existe.
    """
    return get_object_or_404(
        Entrevista.objects.select_related("area", "nivel"), pk=pk, usuario=usuario
    )


def entrevistas_de(usuario):
    return Entrevista.objects.filter(usuario=usuario).select_related("area", "nivel")


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
    return entrevista.intercambios.select_related("evaluacion").order_by("numero")


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

"""El cierre por tiempo: las entrevistas en curso cuyo límite ya pasó.

Perezoso, en cada puerta (historial, detalle, resultados, responder), porque el
plan gratuito no tiene tareas programadas fiables. `services.py` lo reexporta.
"""

from __future__ import annotations

from datetime import timedelta

from django.db.models import Count, F, Q
from django.utils import timezone

from .models import MINUTOS_DE_ENTREVISTA, Entrevista


def _cerrar_por_tiempo(vencidas) -> int:
    """Cierra un queryset de entrevistas `EN_PROGRESO` ya vencidas.

    Sin ninguna respuesta queda `ABANDONADA`; con alguna, `TIEMPO_AGOTADO`. Se
    cuentan respuestas y no evaluaciones: una respuesta llegada a tiempo cuya
    evaluación falló sigue siendo una respuesta. `fecha_fin` es el límite, no
    el momento en que alguien lo notó.

    `update()` no admite un queryset con agregación, así que cada grupo se
    resuelve como subconsulta de claves: dos sentencias, sea cual sea el
    número de entrevistas.
    """
    con_respuestas = vencidas.annotate(
        respondidas=Count("intercambios", filter=~Q(intercambios__respuesta=""))
    )
    fin = F("fecha_inicio") + timedelta(minutes=MINUTOS_DE_ENTREVISTA)
    cerradas = 0
    for estado, condicion in (
        (Entrevista.Estado.ABANDONADA, Q(respondidas=0)),
        (Entrevista.Estado.TIEMPO_AGOTADO, Q(respondidas__gt=0)),
    ):
        claves = con_respuestas.filter(condicion).values("pk")
        # Se repite `estado=EN_PROGRESO` en el update: no pisa una FINALIZADA
        # que otra petición haya cerrado entre la subconsulta y la escritura.
        cerradas += Entrevista.objects.filter(
            pk__in=claves, estado=Entrevista.Estado.EN_PROGRESO
        ).update(estado=estado, fecha_fin=fin)
    return cerradas


def _vencidas():
    limite = timezone.now() - timedelta(minutes=MINUTOS_DE_ENTREVISTA)
    return Entrevista.objects.filter(estado=Entrevista.Estado.EN_PROGRESO, fecha_inicio__lte=limite)


def cerrar_vencidas(usuario) -> int:
    """Transición perezosa: cierra toda entrevista `EN_PROGRESO` de este
    usuario cuyo límite (`MINUTOS_DE_ENTREVISTA` desde el inicio) ya pasó.

    Se invoca al consultar el historial, no con un planificador — el plan
    gratuito no ofrece tareas programadas fiables. Las demás puertas (detalle,
    responder, resultados) usan `cerrar_si_vencio`, así que un enlace directo
    tampoco se salta el límite.
    """
    return _cerrar_por_tiempo(_vencidas().filter(usuario=usuario))


def cerrar_si_vencio(entrevista) -> bool:
    """La misma regla que `cerrar_vencidas`, para una sola entrevista.

    Devuelve si quedó cerrada por tiempo. Una que no está en curso, o cuyo
    límite no llegó, no cambia.
    """
    if entrevista.estado != Entrevista.Estado.EN_PROGRESO or timezone.now() < entrevista.fecha_limite:
        return False
    cerrada = bool(_cerrar_por_tiempo(_vencidas().filter(pk=entrevista.pk)))
    entrevista.refresh_from_db()
    return cerrada

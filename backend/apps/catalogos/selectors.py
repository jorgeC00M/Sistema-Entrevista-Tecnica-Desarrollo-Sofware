"""Lecturas del catálogo.

Qué se ofrece al usuario —solo lo activo— es una regla de negocio, así que
vive aquí y no dentro de la vista.
"""

from __future__ import annotations

from django.db.models import Prefetch, QuerySet

from .models import Area, Nivel, Puesto, Tecnologia


def puestos_activos() -> QuerySet[Puesto]:
    """Puestos a los que se puede postular hoy."""
    return Puesto.objects.filter(activo=True)


def niveles_activos() -> QuerySet[Nivel]:
    return Nivel.objects.filter(activo=True)


def areas_activas() -> QuerySet[Area]:
    """Áreas vigentes. Ya no se eligen al iniciar una entrevista —eso lo decide
    el puesto— pero se siguen publicando: la pantalla de selección muestra qué
    áreas cubre cada puesto, y las estadísticas se agrupan por ellas."""
    return Area.objects.filter(activo=True)


def areas_por_codigo(codigos) -> dict[str, Area]:
    """Las áreas pedidas, indexadas por `codigo`, en una sola consulta.

    La usa el orquestador para traducir del enum de la capa de IA a la fila del
    catálogo que se guarda en cada intercambio. Devuelve un diccionario, y no un
    queryset, porque quien llama resuelve varios códigos de golpe y no quiere
    una consulta por pregunta.
    """
    return {area.codigo: area for area in Area.objects.filter(codigo__in=list(codigos))}


def puestos_con_tecnologias() -> QuerySet[Puesto]:
    """Puestos activos con sus tecnologías activas ya ordenadas, en dos consultas
    en total (no una por puesto)."""
    return puestos_activos().prefetch_related(
        Prefetch(
            "tecnologias",
            queryset=Tecnologia.objects.filter(activo=True).order_by("orden", "nombre"),
            to_attr="tecnologias_activas",
        )
    )


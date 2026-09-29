"""Lecturas del catálogo.

Qué se ofrece al usuario —solo lo activo— es una regla de negocio, así que
vive aquí y no dentro de la vista.
"""

from __future__ import annotations

from django.db.models import QuerySet

from .models import Area, Nivel


def areas_activas() -> QuerySet[Area]:
    """Áreas que se pueden elegir hoy. Un área dada de baja en el admin deja
    de ofrecerse sin necesidad de desplegar."""
    return Area.objects.filter(activo=True)


def niveles_activos() -> QuerySet[Nivel]:
    return Nivel.objects.filter(activo=True)

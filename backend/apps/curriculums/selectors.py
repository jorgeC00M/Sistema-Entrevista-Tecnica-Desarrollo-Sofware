"""Lecturas sobre currículums.

Todas reciben el usuario y filtran por él dentro de la consulta: pedir el
currículum de otra persona devuelve 404, no 403, porque un 403 confirmaría que
existe.
"""

from __future__ import annotations

from django.shortcuts import get_object_or_404

from .models import Curriculum


def curriculums_del_usuario(usuario):
    """Historial de análisis, para que el usuario vea si su CV mejoró."""
    return (
        Curriculum.objects.filter(usuario=usuario)
        .select_related("analisis")
        .order_by("-fecha")
    )


def curriculum_del_usuario(usuario, pk: int) -> Curriculum:
    return get_object_or_404(
        Curriculum.objects.select_related("analisis"),
        pk=pk,
        usuario=usuario,
    )

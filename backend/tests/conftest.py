"""Ayudas compartidas por la suite.

Las áreas y niveles los siembra la migración `catalogos.0002_datos_iniciales`,
que el runner aplica al crear la base de pruebas. Los tests los buscan por
código en lugar de crearlos, para que ejercitar el catálogo real sea el camino
fácil y una fila que falte se note aquí y no en producción.
"""

from __future__ import annotations

from apps.catalogos.models import Area, Nivel


def area_de(codigo) -> Area:
    """Acepta el enum `AreaTecnica` o el código en texto: el enum hereda de str."""
    return Area.objects.get(codigo=codigo)


def nivel_de(codigo) -> Nivel:
    return Nivel.objects.get(codigo=codigo)

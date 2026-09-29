"""Selección del proveedor de IA por configuración.

El resto del sistema pide el proveedor aquí y nunca importa un adaptador concreto:
cambiar de motor es cambiar IA_PROVEEDOR, no tocar código.
"""

from __future__ import annotations

import os
from importlib import import_module

from .base import ProveedorIA
from .exceptions import ProveedorNoConfigurado

# nombre -> (módulo, clase). El import es diferido para no exigir el SDK de
# proveedores que no se estén usando.
_REGISTRO: dict[str, tuple[str, str]] = {
    "fake": (".fake", "FakeProveedorIA"),
    "gemini": (".gemini", "GeminiProveedorIA"),
    "anthropic": (".claude", "AnthropicProveedorIA"),
}

# 'fake' por defecto: nunca gasta cuota por accidente si IA_PROVEEDOR no está configurado.
PROVEEDOR_POR_DEFECTO = "fake"


class ProveedorNoDisponible(ProveedorNoConfigurado):
    """Se pidió un proveedor que no existe en el registro o cuyo SDK falta.

    Hereda de la taxonomía de IA (y no de `RuntimeError`) para que el
    manejador central lo traduzca a 503 en vez de dejarlo escapar como un 500
    con traza.
    """


def get_proveedor(nombre: str | None = None) -> ProveedorIA:
    nombre = (nombre or os.environ.get("IA_PROVEEDOR") or PROVEEDOR_POR_DEFECTO).strip().lower()

    if nombre not in _REGISTRO:
        disponibles = ", ".join(sorted(_REGISTRO))
        raise ProveedorNoDisponible(
            f"Proveedor de IA '{nombre}' no registrado. Disponibles: {disponibles}"
        )

    ruta_modulo, nombre_clase = _REGISTRO[nombre]
    try:
        modulo = import_module(ruta_modulo, package=__package__)
    except ImportError as exc:
        raise ProveedorNoDisponible(
            f"Falta el SDK del proveedor '{nombre}'. Instálalo con: pip install -r requirements/local.txt"
        ) from exc

    return getattr(modulo, nombre_clase)()

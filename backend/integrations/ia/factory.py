"""Selección del proveedor de IA por configuración.

El resto del sistema pide el proveedor aquí y nunca importa un adaptador concreto:
cambiar de motor es cambiar IA_PROVEEDOR, no tocar código.
"""

from __future__ import annotations

import os
from importlib import import_module

from .base import ProveedorIA, RevisorDeCV
from .exceptions import ProveedorNoConfigurado

# nombre -> (módulo, clase). El import es diferido para no exigir el SDK de
# proveedores que no se estén usando.
_REGISTRO: dict[str, tuple[str, str]] = {
    "fake": (".fake", "FakeProveedorIA"),
    "gemini": (".gemini", "GeminiProveedorIA"),
    "anthropic": (".claude", "AnthropicProveedorIA"),
    "deepseek": (".compatible_openai", "DeepSeekProveedorIA"),
    "openrouter": (".compatible_openai", "OpenRouterProveedorIA"),
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
    """El proveedor configurado en `IA_PROVEEDOR`, o una cadena de respaldo.

    Con un solo nombre devuelve ese adaptador, como siempre. Con varios
    separados por coma (`gemini,deepseek`) devuelve una `ProveedorEnCadena`
    que pasa al siguiente si uno falla. Un nombre desconocido o un eslabón
    sin clave abortan antes de cualquier llamada: es un error de
    configuración que conviene ver al desplegar, no un respaldo silencioso.
    """
    nombres = _nombres(nombre)
    clases = [_clase(n) for n in nombres]
    if len(clases) == 1:
        return clases[0]()

    from .cadena import ProveedorEnCadena

    return ProveedorEnCadena([clase() for clase in clases])


def get_revisor_de_cv(nombre: str | None = None) -> RevisorDeCV:
    """El proveedor configurado, filtrado a los aptos para revisar un CV.

    Mismo registro y misma configuración que `get_proveedor()`: no hay un
    `IA_PROVEEDOR` aparte para currículums. De la lista se conservan solo los
    proveedores que saben revisar CV **y** son aptos para datos personales:
    DeepSeek y OpenRouter nunca reciben texto de un currículum, aunque estén
    configurados. El filtro mira la clase antes de instanciarla, así que ni
    siquiera se les exige la clave. Si no queda ninguno, `ProveedorNoDisponible`
    — que `apps/curriculums/revision.py` ya convierte en `no_disponible`.
    """
    nombres = _nombres(nombre)
    clases = [_clase(n) for n in nombres]
    aptas = [c for c in clases if c.apto_para_datos_personales and callable(getattr(c, "revisar_cv", None))]
    if not aptas:
        raise ProveedorNoDisponible(
            f"Ningún proveedor de '{','.join(nombres)}' es apto para revisar currículums "
            "(DeepSeek y OpenRouter no reciben datos personales)."
        )
    if len(aptas) == 1:
        return aptas[0]()

    from .cadena import ProveedorEnCadena

    return ProveedorEnCadena([clase() for clase in aptas])


def _nombres(nombre: str | None) -> list[str]:
    crudo = nombre or os.environ.get("IA_PROVEEDOR") or PROVEEDOR_POR_DEFECTO
    nombres = [n.strip().lower() for n in crudo.split(",") if n.strip()]
    return nombres or [PROVEEDOR_POR_DEFECTO]


def _clase(nombre: str) -> type[ProveedorIA]:
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

    return getattr(modulo, nombre_clase)

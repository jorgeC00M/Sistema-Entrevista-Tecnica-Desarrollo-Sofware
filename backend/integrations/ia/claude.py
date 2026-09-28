"""Adaptador de Claude (Anthropic) — proveedor principal del sistema.

La salida estructurada se fuerza con JSON outputs nativo (`output_config`), que
aplica decodificación restringida: la respuesta no puede salirse del esquema
declarado. Es preferible a forzar una herramienta con `tool_choice`, que era el
rodeo usado antes de que existiera esta función y que, semánticamente, pide una
acción en lugar de pedir formato.

No se usa prompt caching: Haiku 4.5 exige 4.096 tokens mínimos por bloque
cacheable y el prompt de sistema de este proyecto ronda los 300, así que no
tendría efecto — la API no avisa, simplemente no cachea.
"""

from __future__ import annotations

import os
from typing import Any

import anthropic

from .base import ProveedorIAporJSON
from .exceptions import (
    ErrorPermanente,
    ErrorTransitorio,
    ProveedorNoConfigurado,
    RespuestaIAInvalida,
)

MODELO_POR_DEFECTO = "claude-haiku-4-5-20251001"
MAX_TOKENS = 1024
TIMEOUT_SEGUNDOS = 30.0

# Códigos de estado que vale la pena reintentar (red, límite de tasa, servicio
# caído o sobrecargado). El resto (400, 401, 403...) no se arregla reintentando.
_CODIGOS_TRANSITORIOS = {429, 500, 502, 503, 504, 529}


class AnthropicProveedorIA(ProveedorIAporJSON):
    nombre = "anthropic"

    def __init__(self, api_key: str | None = None, modelo: str | None = None):
        api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise ProveedorNoConfigurado(
                "Falta ANTHROPIC_API_KEY para usar el proveedor 'anthropic'"
            )

        self.modelo = modelo or os.environ.get("ANTHROPIC_MODEL", MODELO_POR_DEFECTO)
        self._cliente = anthropic.Anthropic(
            api_key=api_key,
            timeout=TIMEOUT_SEGUNDOS,
            max_retries=2,
        )

    def _pedir_json(self, sistema: str, entrada: str, esquema: dict[str, Any]) -> dict[str, Any]:
        try:
            respuesta = self._cliente.messages.create(
                model=self.modelo,
                max_tokens=MAX_TOKENS,
                system=sistema,
                messages=[{"role": "user", "content": entrada}],
                output_config={"format": {"type": "json_schema", "schema": esquema}},
            )
        except anthropic.APIStatusError as exc:
            if exc.status_code in _CODIGOS_TRANSITORIOS:
                raise ErrorTransitorio(
                    f"Claude ({self.modelo}) respondió {exc.status_code}: {exc.message}"
                ) from exc
            raise ErrorPermanente(
                f"Claude ({self.modelo}) respondió {exc.status_code}: {exc.message}"
            ) from exc
        except anthropic.APIConnectionError as exc:
            # Cubre también APITimeoutError, que hereda de esta.
            raise ErrorTransitorio(f"Fallo de conexión con Claude ({self.modelo}): {exc}") from exc

        return self._decodificar(self._extraer_texto(respuesta))

    def _extraer_texto(self, respuesta: anthropic.types.Message) -> str:
        for bloque in respuesta.content:
            if bloque.type == "text":
                return bloque.text
        raise RespuestaIAInvalida(
            f"Claude ({self.modelo}) no devolvió un bloque de texto; "
            f"motivo de finalización: {respuesta.stop_reason}"
        )

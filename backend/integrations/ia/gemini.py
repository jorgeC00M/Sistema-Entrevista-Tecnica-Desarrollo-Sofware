"""Adaptador de Gemini (Google AI Studio) — respaldo interno, no documentado."""

from __future__ import annotations

import os
from typing import Any

import httpx
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from .base import ProveedorIAporJSON
from .exceptions import (
    ErrorPermanente,
    ErrorTransitorio,
    ProveedorNoConfigurado,
    RespuestaIAInvalida,
)

MODELO_POR_DEFECTO = "gemini-2.5-flash"

# Mismo tope que el adaptador de Claude: sin timeout, una llamada colgada
# retiene el worker que la atiende, y en el plan gratuito de Render un worker
# retenido es el servicio caído.
TIMEOUT_SEGUNDOS = 30.0


class GeminiProveedorIA(ProveedorIAporJSON):
    nombre = "gemini"

    def __init__(self, api_key: str | None = None, modelo: str | None = None):
        api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ProveedorNoConfigurado("Falta GEMINI_API_KEY para usar el proveedor 'gemini'")

        self.modelo = modelo or os.environ.get("GEMINI_MODEL", MODELO_POR_DEFECTO)
        self._cliente = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(timeout=int(TIMEOUT_SEGUNDOS * 1000)),
        )

    def _pedir_json(self, sistema: str, entrada: str, esquema: dict[str, Any]) -> dict[str, Any]:
        try:
            respuesta = self._cliente.models.generate_content(
                model=self.modelo,
                contents=entrada,
                config=types.GenerateContentConfig(
                    system_instruction=sistema,
                    response_mime_type="application/json",
                    response_json_schema=esquema,
                ),
            )
        except genai_errors.ServerError as exc:
            raise ErrorTransitorio(f"Gemini ({self.modelo}) no disponible: {exc}") from exc
        except genai_errors.ClientError as exc:
            codigo = getattr(exc, "code", None)
            if codigo == 429:
                raise ErrorTransitorio(f"Gemini ({self.modelo}) límite de tasa: {exc}") from exc
            raise ErrorPermanente(f"Gemini ({self.modelo}) rechazó la petición: {exc}") from exc
        except httpx.TimeoutException as exc:
            raise ErrorTransitorio(
                f"Gemini ({self.modelo}) agotó el tiempo de espera de {TIMEOUT_SEGUNDOS}s: {exc}"
            ) from exc
        except httpx.TransportError as exc:
            # Fallo de red antes de recibir respuesta. Sin esto la excepción
            # cruda del SDK llegaba hasta DRF y se convertía en un 500.
            raise ErrorTransitorio(f"Fallo de conexión con Gemini ({self.modelo}): {exc}") from exc

        texto = respuesta.text
        if not texto:
            raise RespuestaIAInvalida(
                f"Gemini ({self.modelo}) devolvió una respuesta vacía; "
                "puede deberse a filtros de seguridad o a un corte de generación"
            )

        return self._decodificar(texto)

"""Adaptador de Gemini (Google AI Studio) — respaldo interno, no documentado."""

from __future__ import annotations

import os
from typing import Any

import httpx
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from .base import MAX_REINTENTOS, TIMEOUT_SEGUNDOS, ProveedorIAporJSON
from .exceptions import (
    ErrorPermanente,
    ErrorTransitorio,
    ProveedorNoConfigurado,
    RespuestaIAInvalida,
)

# Google recomienda flash-lite para baja latencia y alto volumen, que es lo
# que pide este proyecto: una pregunta corta o cuatro campos de texto, no
# razonamiento de horizonte largo. Los modelos "frontera" recién lanzados
# (3.8-flash y compañía) están además mucho más saturados: su pico de 503 por
# alta demanda dura semanas tras cada lanzamiento.
MODELO_POR_DEFECTO = "gemini-3.5-flash-lite"

# `TIMEOUT_SEGUNDOS` y `MAX_REINTENTOS` vienen de `base.py`, iguales para todos
# los adaptadores.
#
# El SDK NO reintenta si no se le configura: con `retry_options=None` aplica
# la estrategia "un solo intento". Eso dejaba que un 503 puntual de Google
# ("este modelo tiene mucha demanda, reintenta más tarde") llegara tal cual al
# usuario. Los códigos que cubre de fábrica —408, 429, 500, 502, 503, 504— son
# justo los transitorios, y el retroceso exponencial con jitter es lo que
# Google mismo recomienda para no formar una estampida de reintentos.
#
# `attempts` cuenta el primer intento: 1 + `MAX_REINTENTOS`, lo mismo que los
# demás adaptadores.
REINTENTOS = types.HttpRetryOptions(attempts=1 + MAX_REINTENTOS, initial_delay=1.0, max_delay=8.0)

# Los modelos recientes razonan antes de responder, y ese paso domina el
# tiempo de respuesta: en pruebas, pedir `{"ok": true}` tardaba ~17 s. Aquí no
# hace falta deliberar —la pregunta sale del prompt y la nota, de la rúbrica—
# así que se baja al mínimo útil. MINIMAL existe, pero LOW deja margen para
# que el evaluador razone lo justo al calificar.
NIVEL_DE_RAZONAMIENTO = types.ThinkingLevel.LOW


class GeminiProveedorIA(ProveedorIAporJSON):
    nombre = "gemini"
    # Apto con reservas: en la capa gratuita Google puede usar el contenido
    # para mejorar sus productos. Se acepta porque el CV llega minimizado y
    # enmascarado (`anonimizar.py`); es un compromiso conocido, no una garantía.
    apto_para_datos_personales = True

    def __init__(self, api_key: str | None = None, modelo: str | None = None):
        api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ProveedorNoConfigurado("Falta GEMINI_API_KEY para usar el proveedor 'gemini'")

        # `os.environ.get(clave, por_defecto)` solo aplica el valor por
        # defecto cuando la variable no existe — no cuando existe pero está
        # vacía (`GEMINI_MODEL=` en el .env cuenta como "existe"). Encadenar
        # el `or` trata ambos casos igual, que es lo que el .env.example
        # documenta ("opcional, por defecto...").
        self.modelo = modelo or os.environ.get("GEMINI_MODEL") or MODELO_POR_DEFECTO
        self._cliente = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=int(TIMEOUT_SEGUNDOS * 1000),
                retry_options=REINTENTOS,
            ),
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
                    thinking_config=types.ThinkingConfig(
                        thinking_level=NIVEL_DE_RAZONAMIENTO
                    ),
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

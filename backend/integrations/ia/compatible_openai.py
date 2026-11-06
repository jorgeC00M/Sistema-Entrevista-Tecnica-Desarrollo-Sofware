"""Adaptador para endpoints compatibles con la API de OpenAI (DeepSeek, OpenRouter).

Ambos servicios exponen Chat Completions con el mismo formato que OpenAI, así
que un único adaptador los cubre cambiando `base_url`, la clave y el modelo.
Se usa el SDK oficial de `openai` por lo mismo que `claude.py` usa el de
Anthropic: trae timeout, reintentos con retroceso y errores tipados, y la
traducción a la taxonomía de `exceptions.py` queda casi idéntica.

Estos endpoints no garantizan JSON con esquema estricto (DeepSeek no lo
soporta). Se pide `json_object` y el esquema va escrito en el prompt; la
garantía real la dan los parsers de `prompts/`, que validan cada campo.

No son aptos para datos personales: DeepSeek procesa y guarda los datos en
China y entrena con ellos por defecto, sin opción de excluirse fuera de la
UE, el Reino Unido o Suiza. Por eso nunca reciben texto de un currículum
(`factory.get_revisor_de_cv`), aunque estén configurados.
"""

from __future__ import annotations

import json
import os
from typing import Any

import openai

from .base import MAX_REINTENTOS, TIMEOUT_SEGUNDOS, ProveedorIAporJSON
from .exceptions import (
    ErrorPermanente,
    ErrorTransitorio,
    ProveedorNoConfigurado,
    RespuestaIAInvalida,
)

MAX_TOKENS = 2048

# 408 y 409 los reintenta el propio SDK; 429 es la cuota gratuita agotada, que
# en una cadena de respaldo es justo el caso de pasar al siguiente.
_CODIGOS_TRANSITORIOS = {408, 409, 429}


class ProveedorCompatibleOpenAI(ProveedorIAporJSON):
    """Base: las subclases solo fijan de dónde salen la clave, el modelo y la URL."""

    apto_para_datos_personales = False

    variable_de_clave: str
    variable_de_modelo: str
    modelo_por_defecto: str
    url_base: str

    def __init__(self, api_key: str | None = None, modelo: str | None = None):
        api_key = api_key or os.environ.get(self.variable_de_clave)
        if not api_key:
            raise ProveedorNoConfigurado(
                f"Falta {self.variable_de_clave} para usar el proveedor '{self.nombre}'"
            )
        # `or` encadenado: una variable presente pero vacía también cae al
        # valor por defecto (mismo criterio que gemini.py).
        self.modelo = modelo or os.environ.get(self.variable_de_modelo) or self.modelo_por_defecto
        if not self.modelo:
            raise ProveedorNoConfigurado(
                f"Falta {self.variable_de_modelo} para usar el proveedor '{self.nombre}'"
            )
        self._cliente = openai.OpenAI(
            api_key=api_key,
            base_url=self.url_base,
            timeout=TIMEOUT_SEGUNDOS,
            max_retries=MAX_REINTENTOS,
        )

    def _pedir_json(self, sistema: str, entrada: str, esquema: dict[str, Any]) -> dict[str, Any]:
        try:
            respuesta = self._cliente.chat.completions.create(
                model=self.modelo,
                max_tokens=MAX_TOKENS,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": sistema + _instruccion_de_formato(esquema)},
                    {"role": "user", "content": entrada},
                ],
            )
        except openai.APIStatusError as exc:
            if exc.status_code in _CODIGOS_TRANSITORIOS or exc.status_code >= 500:
                raise ErrorTransitorio(
                    f"{self.nombre} ({self.modelo}) respondió {exc.status_code}: {exc.message}"
                ) from exc
            raise ErrorPermanente(
                f"{self.nombre} ({self.modelo}) respondió {exc.status_code}: {exc.message}"
            ) from exc
        except openai.APIConnectionError as exc:
            # Cubre también APITimeoutError, que hereda de esta.
            raise ErrorTransitorio(f"Fallo de conexión con {self.nombre} ({self.modelo}): {exc}") from exc

        return self._decodificar(self._extraer_texto(respuesta))

    def _extraer_texto(self, respuesta) -> str:
        if not respuesta.choices:
            raise RespuestaIAInvalida(f"{self.nombre} ({self.modelo}) no devolvió ninguna opción")
        opcion = respuesta.choices[0]
        # Un JSON cortado por longitud nunca se parsea a medias.
        if opcion.finish_reason == "length":
            raise RespuestaIAInvalida(
                f"{self.nombre} ({self.modelo}) cortó la respuesta por longitud"
            )
        texto = (opcion.message.content or "").strip()
        if not texto:
            raise RespuestaIAInvalida(f"{self.nombre} ({self.modelo}) devolvió una respuesta vacía")
        return texto


def _instruccion_de_formato(esquema: dict[str, Any]) -> str:
    # DeepSeek exige que la palabra "json" aparezca en el prompt para activar
    # el modo JSON; sin esquema estricto, se lo describe aquí.
    return (
        "\n\nResponde solo con un objeto json válido que cumpla este esquema JSON, "
        "sin texto antes ni después:\n" + json.dumps(esquema, ensure_ascii=False)
    )


class DeepSeekProveedorIA(ProveedorCompatibleOpenAI):
    """API oficial de DeepSeek: créditos gratis por unos 30 días; después, de pago."""

    nombre = "deepseek"
    variable_de_clave = "DEEPSEEK_API_KEY"
    variable_de_modelo = "DEEPSEEK_MODEL"
    modelo_por_defecto = "deepseek-chat"
    url_base = "https://api.deepseek.com"


class OpenRouterProveedorIA(ProveedorCompatibleOpenAI):
    """OpenRouter: un único punto de acceso a modelos de varios fabricantes."""

    nombre = "openrouter"
    variable_de_clave = "OPENROUTER_API_KEY"
    variable_de_modelo = "OPENROUTER_MODEL"
    # Sin valor por defecto a propósito: el catálogo gratuito (":free") cambia
    # cada pocos meses y en octubre de 2026 no incluye ningún DeepSeek. Fijar
    # uno aquí sería un 404 diferido; OPENROUTER_MODEL es obligatorio.
    modelo_por_defecto = ""
    url_base = "https://openrouter.ai/api/v1"

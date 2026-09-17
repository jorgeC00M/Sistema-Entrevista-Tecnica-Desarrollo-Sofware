"""Adaptador de Gemini (Google AI Studio) — respaldo interno, no documentado."""

from __future__ import annotations

import json
import os
from typing import Any

from google import genai
from google.genai import types

from .base import ProveedorIA
from .exceptions import ErrorPermanente, ErrorTransitorio, RespuestaIAInvalida
from .prompts import entrevistador, evaluador
from .prompts.schemas import (
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    Evaluacion,
    Nivel,
    Pregunta,
    TemaEvaluado,
    parsear_evaluacion,
    parsear_pregunta,
)

MODELO_POR_DEFECTO = "gemini-2.5-flash"


class GeminiProveedorIA(ProveedorIA):
    nombre = "gemini"

    def __init__(self, api_key: str | None = None, modelo: str | None = None):
        api_key = api_key or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("Falta GEMINI_API_KEY para usar el proveedor 'gemini'")

        self.modelo = modelo or os.environ.get("GEMINI_MODEL", MODELO_POR_DEFECTO)
        self._cliente = genai.Client(api_key=api_key)

    def generar_pregunta(
        self, area: AreaTecnica, nivel: Nivel, numero: int, previas: list[TemaEvaluado]
    ) -> Pregunta:
        datos = self._pedir_json(
            sistema=entrevistador.sistema(area, nivel, PREGUNTAS_POR_ENTREVISTA),
            entrada=entrevistador.usuario(numero, previas),
            esquema=entrevistador.ESQUEMA_PREGUNTA,
        )
        return parsear_pregunta(datos, numero=numero)

    def evaluar_respuesta(
        self, area: AreaTecnica, nivel: Nivel, pregunta: str, respuesta: str
    ) -> Evaluacion:
        datos = self._pedir_json(
            sistema=evaluador.sistema(area, nivel),
            entrada=evaluador.usuario(pregunta, respuesta),
            esquema=evaluador.ESQUEMA_EVALUACION,
        )
        return parsear_evaluacion(datos)

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
        except genai.errors.ServerError as exc:
            raise ErrorTransitorio(f"Gemini ({self.modelo}) no disponible: {exc}") from exc
        except genai.errors.ClientError as exc:
            codigo = getattr(exc, "code", None)
            if codigo == 429:
                raise ErrorTransitorio(f"Gemini ({self.modelo}) límite de tasa: {exc}") from exc
            raise ErrorPermanente(f"Gemini ({self.modelo}) rechazó la petición: {exc}") from exc

        texto = respuesta.text
        if not texto:
            raise RespuestaIAInvalida(
                f"Gemini ({self.modelo}) devolvió una respuesta vacía; "
                "puede deberse a filtros de seguridad o a un corte de generación"
            )

        try:
            datos = json.loads(texto)
        except json.JSONDecodeError as exc:
            raise RespuestaIAInvalida(f"Gemini no devolvió JSON válido: {texto[:200]}") from exc

        if not isinstance(datos, dict):
            raise RespuestaIAInvalida(f"Se esperaba un objeto JSON, se recibió {type(datos).__name__}")
        return datos

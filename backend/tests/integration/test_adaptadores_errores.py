"""Traducción de los fallos de cada SDK a la taxonomía del proyecto.

Es lo que decide si el usuario ve un 503 ("vuelve a intentarlo") o un 502
("la petición fue rechazada"), y hasta ahora estaba sin cubrir: los tests de
`tests/integration/` solo ejercitaban el proveedor falso.

No hay red: se sustituye el cliente del SDK por un doble que lanza la
excepción que interesa.
"""

from __future__ import annotations

import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import anthropic
import httpx
import httpx2
import openai
from google.genai import errors as genai_errors

from integrations.ia import claude, gemini
from integrations.ia.claude import AnthropicProveedorIA
from integrations.ia.compatible_openai import DeepSeekProveedorIA, OpenRouterProveedorIA
from integrations.ia.exceptions import (
    ErrorPermanente,
    ErrorTransitorio,
    ProveedorNoConfigurado,
    RespuestaIAInvalida,
)
from integrations.ia.gemini import GeminiProveedorIA
from integrations.ia.prompts.schemas import (
    AreaTecnica,
    ContextoDeEntrevista,
    Nivel,
    Puesto,
)

# Para estos tests el encuadre es irrelevante —lo que se prueba es cómo se
# traduce el fallo del SDK— así que se fija uno cualquiera y no se repite en
# cada llamada.
CONTEXTO = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.BASICO)


def _error_de_anthropic(codigo: int) -> anthropic.APIStatusError:
    """Construye un APIStatusError con el código deseado sin tocar la red."""
    respuesta = httpx.Response(
        status_code=codigo, request=httpx.Request("POST", "https://api.anthropic.com")
    )
    return anthropic.APIStatusError("fallo simulado", response=respuesta, body=None)


class ClaudeErroresTest(unittest.TestCase):
    def _proveedor(self) -> AnthropicProveedorIA:
        with patch("anthropic.Anthropic"):
            return AnthropicProveedorIA(api_key="clave-de-prueba")

    def test_sin_credencial_no_se_construye(self):
        with patch.dict("os.environ", {"ANTHROPIC_API_KEY": ""}, clear=False):
            with self.assertRaises(ProveedorNoConfigurado):
                AnthropicProveedorIA(api_key=None)

    def test_modelo_vacio_en_el_entorno_usa_el_valor_por_defecto(self):
        """`ANTHROPIC_MODEL=` en el .env (variable presente, valor vacío) debe
        comportarse igual que no definirla — no mandarle un modelo vacío a la
        API. Candado del bug real: `.get(clave, por_defecto)` solo aplica el
        valor por defecto cuando la variable no existe en absoluto."""
        with patch.dict("os.environ", {"ANTHROPIC_MODEL": ""}, clear=False):
            with patch("anthropic.Anthropic"):
                proveedor = AnthropicProveedorIA(api_key="clave-de-prueba")
        self.assertEqual(proveedor.modelo, claude.MODELO_POR_DEFECTO)

    def test_codigos_transitorios(self):
        for codigo in (429, 500, 502, 503, 504, 529):
            with self.subTest(codigo=codigo):
                proveedor = self._proveedor()
                proveedor._cliente.messages.create.side_effect = _error_de_anthropic(codigo)
                with self.assertRaises(ErrorTransitorio):
                    proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])

    def test_codigos_permanentes(self):
        for codigo in (400, 401, 403, 404, 422):
            with self.subTest(codigo=codigo):
                proveedor = self._proveedor()
                proveedor._cliente.messages.create.side_effect = _error_de_anthropic(codigo)
                with self.assertRaises(ErrorPermanente):
                    proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])

    def test_fallo_de_conexion_es_transitorio(self):
        proveedor = self._proveedor()
        proveedor._cliente.messages.create.side_effect = anthropic.APIConnectionError(
            request=httpx.Request("POST", "https://api.anthropic.com")
        )
        with self.assertRaises(ErrorTransitorio):
            proveedor.evaluar_respuesta(CONTEXTO, AreaTecnica.PROGRAMACION, "p", "r")

    def test_json_invalido_rompe_el_contrato(self):
        proveedor = self._proveedor()
        bloque = MagicMock()
        bloque.type = "text"
        bloque.text = "esto no es json"
        proveedor._cliente.messages.create.return_value = MagicMock(content=[bloque])

        with self.assertRaises(RespuestaIAInvalida):
            proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])


class GeminiErroresTest(unittest.TestCase):
    def _proveedor(self) -> GeminiProveedorIA:
        with patch("google.genai.Client"):
            return GeminiProveedorIA(api_key="clave-de-prueba")

    def test_sin_credencial_no_se_construye(self):
        with patch.dict("os.environ", {"GEMINI_API_KEY": ""}, clear=False):
            with self.assertRaises(ProveedorNoConfigurado):
                GeminiProveedorIA(api_key=None)

    def test_modelo_vacio_en_el_entorno_usa_el_valor_por_defecto(self):
        """Mismo candado que en Claude, para `GEMINI_MODEL=`: es el bug real
        que produjo un 500 (`ValueError: model is required.`) en vez del 503
        que debería salir cuando falta configuración."""
        with patch.dict("os.environ", {"GEMINI_MODEL": ""}, clear=False):
            with patch("google.genai.Client"):
                proveedor = GeminiProveedorIA(api_key="clave-de-prueba")
        self.assertEqual(proveedor.modelo, gemini.MODELO_POR_DEFECTO)

    def test_error_de_servidor_es_transitorio(self):
        proveedor = self._proveedor()
        proveedor._cliente.models.generate_content.side_effect = genai_errors.ServerError(
            503, {"error": {"message": "no disponible"}}
        )
        with self.assertRaises(ErrorTransitorio):
            proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])

    def test_limite_de_tasa_es_transitorio(self):
        proveedor = self._proveedor()
        proveedor._cliente.models.generate_content.side_effect = genai_errors.ClientError(
            429, {"error": {"message": "demasiadas peticiones"}}
        )
        with self.assertRaises(ErrorTransitorio):
            proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])

    def test_peticion_rechazada_es_permanente(self):
        proveedor = self._proveedor()
        proveedor._cliente.models.generate_content.side_effect = genai_errors.ClientError(
            400, {"error": {"message": "petición inválida"}}
        )
        with self.assertRaises(ErrorPermanente):
            proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])

    def test_timeout_es_transitorio(self):
        """Antes de este cambio, un timeout escapaba crudo del adaptador y
        acababa como 500 en vez de 503."""
        proveedor = self._proveedor()
        proveedor._cliente.models.generate_content.side_effect = httpx.ReadTimeout(
            "se agotó el tiempo"
        )
        with self.assertRaises(ErrorTransitorio):
            proveedor.evaluar_respuesta(CONTEXTO, AreaTecnica.PROGRAMACION, "p", "r")

    def test_fallo_de_red_es_transitorio(self):
        proveedor = self._proveedor()
        proveedor._cliente.models.generate_content.side_effect = httpx.ConnectError(
            "sin conexión"
        )
        with self.assertRaises(ErrorTransitorio):
            proveedor.evaluar_respuesta(CONTEXTO, AreaTecnica.PROGRAMACION, "p", "r")

    def test_respuesta_vacia_rompe_el_contrato(self):
        proveedor = self._proveedor()
        proveedor._cliente.models.generate_content.return_value = MagicMock(text="")
        with self.assertRaises(RespuestaIAInvalida):
            proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 1, [])


def _error_de_openai(codigo: int) -> openai.APIStatusError:
    respuesta = httpx2.Response(status_code=codigo, request=httpx2.Request("POST", "https://api.deepseek.com"))
    return openai.APIStatusError("fallo simulado", response=respuesta, body=None)


def _completado(contenido, finish_reason="stop"):
    """Una respuesta de Chat Completions con la forma mínima que lee el adaptador."""
    mensaje = SimpleNamespace(content=contenido)
    return SimpleNamespace(choices=[SimpleNamespace(message=mensaje, finish_reason=finish_reason)])


class CompatibleOpenAIErroresTest(unittest.TestCase):
    """DeepSeek y OpenRouter comparten adaptador: se prueba con DeepSeek."""

    def _proveedor(self, **devuelve) -> DeepSeekProveedorIA:
        with patch("openai.OpenAI"):
            proveedor = DeepSeekProveedorIA(api_key="clave-de-prueba")
        proveedor._cliente = MagicMock()
        if "efecto" in devuelve:
            proveedor._cliente.chat.completions.create.side_effect = devuelve["efecto"]
        else:
            proveedor._cliente.chat.completions.create.return_value = devuelve["respuesta"]
        return proveedor

    def _pregunta(self, proveedor):
        return proveedor.generar_pregunta(CONTEXTO, AreaTecnica.PROGRAMACION, 3, [])

    def test_sin_credencial_no_se_construye(self):
        with patch.dict("os.environ", {"DEEPSEEK_API_KEY": ""}, clear=False):
            with self.assertRaises(ProveedorNoConfigurado):
                DeepSeekProveedorIA(api_key=None)

    def test_modelo_vacio_en_el_entorno_usa_el_valor_por_defecto(self):
        with patch.dict("os.environ", {"DEEPSEEK_MODEL": ""}, clear=False), patch("openai.OpenAI"):
            self.assertEqual(DeepSeekProveedorIA(api_key="x").modelo, "deepseek-chat")

    def test_cuota_agotada_y_caidas_son_transitorias(self):
        for codigo in (429, 500, 503):
            with self.subTest(codigo=codigo):
                with self.assertRaises(ErrorTransitorio):
                    self._pregunta(self._proveedor(efecto=_error_de_openai(codigo)))

    def test_clave_invalida_y_modelo_inexistente_son_permanentes(self):
        for codigo in (401, 404):
            with self.subTest(codigo=codigo):
                with self.assertRaises(ErrorPermanente):
                    self._pregunta(self._proveedor(efecto=_error_de_openai(codigo)))

    def test_fallo_de_conexion_es_transitorio(self):
        error = openai.APIConnectionError(request=httpx2.Request("POST", "https://api.deepseek.com"))
        with self.assertRaises(ErrorTransitorio):
            self._pregunta(self._proveedor(efecto=error))

    def test_respuesta_cortada_por_longitud_es_invalida(self):
        with self.assertRaises(RespuestaIAInvalida):
            self._pregunta(self._proveedor(respuesta=_completado('{"pregunta": "¿Qué', "length")))

    def test_respuesta_vacia_o_no_json_es_invalida(self):
        for contenido in ("", None, "no es json"):
            with self.subTest(contenido=contenido):
                with self.assertRaises(RespuestaIAInvalida):
                    self._pregunta(self._proveedor(respuesta=_completado(contenido)))

    def test_respuesta_valida_se_parsea(self):
        proveedor = self._proveedor(respuesta=_completado('{"pregunta": "¿Qué es una clausura?"}'))
        self.assertEqual(self._pregunta(proveedor).texto, "¿Qué es una clausura?")

    def test_pide_modo_json_y_describe_el_esquema_en_el_prompt(self):
        proveedor = self._proveedor(respuesta=_completado('{"pregunta": "¿Qué es una clausura?"}'))
        self._pregunta(proveedor)

        argumentos = proveedor._cliente.chat.completions.create.call_args.kwargs
        self.assertEqual(argumentos["response_format"], {"type": "json_object"})
        sistema = argumentos["messages"][0]["content"]
        self.assertIn("json", sistema)
        self.assertIn('"pregunta"', sistema)

    def test_no_es_apto_para_datos_personales(self):
        self.assertFalse(DeepSeekProveedorIA.apto_para_datos_personales)
        self.assertFalse(OpenRouterProveedorIA.apto_para_datos_personales)

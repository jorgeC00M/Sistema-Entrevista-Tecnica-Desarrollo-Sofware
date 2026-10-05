"""Traducción de los fallos de cada SDK a la taxonomía del proyecto.

Es lo que decide si el usuario ve un 503 ("vuelve a intentarlo") o un 502
("la petición fue rechazada"), y hasta ahora estaba sin cubrir: los tests de
`tests/integration/` solo ejercitaban el proveedor falso.

No hay red: se sustituye el cliente del SDK por un doble que lanza la
excepción que interesa.
"""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

import anthropic
import httpx
from google.genai import errors as genai_errors

from integrations.ia import claude, gemini
from integrations.ia.claude import AnthropicProveedorIA
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

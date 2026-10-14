import os
import unittest
from unittest import mock

from integrations.ia.base import ProveedorIA
from integrations.ia.cadena import ProveedorEnCadena
from integrations.ia.compatible_openai import DeepSeekProveedorIA, OpenRouterProveedorIA
from integrations.ia.exceptions import ProveedorNoConfigurado
from integrations.ia.factory import (
    _REGISTRO,
    ProveedorNoDisponible,
    _clase,
    get_proveedor,
    get_revisor_de_cv,
)
from integrations.ia.fake import FakeProveedorIA


class FactoryTest(unittest.TestCase):
    def test_devuelve_proveedor_indicado_por_entorno(self):
        with mock.patch.dict(os.environ, {"IA_PROVEEDOR": "fake"}):
            proveedor = get_proveedor()
        self.assertIsInstance(proveedor, ProveedorIA)
        self.assertEqual(proveedor.nombre, "fake")

    def test_argumento_explicito_tiene_prioridad_sobre_entorno(self):
        with mock.patch.dict(os.environ, {"IA_PROVEEDOR": "gemini"}):
            self.assertEqual(get_proveedor("fake").nombre, "fake")

    def test_proveedor_desconocido_falla_con_mensaje_util(self):
        with self.assertRaises(ProveedorNoDisponible) as ctx:
            get_proveedor("inexistente")
        self.assertIn("Disponibles", str(ctx.exception))


class NuevosProveedoresTest(unittest.TestCase):
    def test_deepseek_y_openrouter_estan_registrados(self):
        entorno = {
            "DEEPSEEK_API_KEY": "clave-de-prueba",
            "OPENROUTER_API_KEY": "clave-de-prueba",
            "OPENROUTER_MODEL": "algun/modelo:free",
        }
        with mock.patch.dict(os.environ, entorno), mock.patch("openai.OpenAI"):
            self.assertIsInstance(get_proveedor("deepseek"), DeepSeekProveedorIA)
            self.assertIsInstance(get_proveedor("openrouter"), OpenRouterProveedorIA)

    def test_openrouter_sin_modelo_no_esta_configurado(self):
        """No hay modelo por defecto: el catálogo gratuito de OpenRouter cambia."""
        entorno = {"OPENROUTER_API_KEY": "clave-de-prueba", "OPENROUTER_MODEL": ""}
        with mock.patch.dict(os.environ, entorno), mock.patch("openai.OpenAI"):
            with self.assertRaises(ProveedorNoConfigurado):
                get_proveedor("openrouter")

    def test_deepseek_sin_clave_no_esta_configurado(self):
        with mock.patch.dict(os.environ, {"DEEPSEEK_API_KEY": ""}):
            with self.assertRaises(ProveedorNoConfigurado):
                get_proveedor("deepseek")

    def test_cada_proveedor_declara_si_es_apto_para_datos_personales(self):
        """Tabla explícita: cambiar uno de estos valores debe ser una decisión
        visible en un test, no un efecto colateral."""
        esperado = {
            "fake": True,
            "gemini": True,
            "anthropic": True,
            "deepseek": False,
            "openrouter": False,
        }
        self.assertEqual(set(esperado), set(_REGISTRO))
        for nombre, apto in esperado.items():
            with self.subTest(proveedor=nombre):
                self.assertIs(_clase(nombre).apto_para_datos_personales, apto)


class CadenaDesdeConfiguracionTest(unittest.TestCase):
    def test_un_solo_nombre_devuelve_el_adaptador_directo(self):
        self.assertIsInstance(get_proveedor("fake"), FakeProveedorIA)

    def test_varios_nombres_arman_una_cadena_en_orden(self):
        with mock.patch.dict(os.environ, {"DEEPSEEK_API_KEY": "clave-de-prueba"}), mock.patch("openai.OpenAI"):
            proveedor = get_proveedor(" fake , deepseek ")
        self.assertIsInstance(proveedor, ProveedorEnCadena)
        self.assertEqual([e.nombre for e in proveedor.eslabones], ["fake", "deepseek"])

    def test_la_cadena_viene_tambien_del_entorno(self):
        with mock.patch.dict(os.environ, {"IA_PROVEEDOR": "fake,fake"}):
            self.assertIsInstance(get_proveedor(), ProveedorEnCadena)

    def test_un_nombre_desconocido_en_la_cadena_aborta_sin_llamar(self):
        with mock.patch.object(FakeProveedorIA, "__init__", side_effect=AssertionError("no debía instanciarse")):
            with self.assertRaises(ProveedorNoDisponible):
                get_proveedor("fake,inexistente")

    def test_un_eslabon_sin_clave_aborta(self):
        with mock.patch.dict(os.environ, {"DEEPSEEK_API_KEY": ""}):
            with self.assertRaises(ProveedorNoConfigurado):
                get_proveedor("fake,deepseek")


class RevisorDeCVFiltradoTest(unittest.TestCase):
    """La frontera de privacidad del CV: los no aptos nunca entran."""

    def test_cadena_mixta_conserva_solo_los_aptos(self):
        with mock.patch.dict(os.environ, {"DEEPSEEK_API_KEY": ""}):
            # Ni siquiera exige la clave de DeepSeek: se filtra antes de instanciar.
            revisor = get_revisor_de_cv("fake,deepseek")
        self.assertIsInstance(revisor, FakeProveedorIA)

    def test_solo_proveedores_no_aptos_no_deja_revisor(self):
        with self.assertRaises(ProveedorNoDisponible):
            get_revisor_de_cv("deepseek")
        with self.assertRaises(ProveedorNoDisponible):
            get_revisor_de_cv("openrouter,deepseek")

    def test_varios_aptos_arman_una_cadena(self):
        revisor = get_revisor_de_cv("fake,deepseek,fake")
        self.assertIsInstance(revisor, ProveedorEnCadena)
        self.assertEqual([e.nombre for e in revisor.eslabones], ["fake", "fake"])
        self.assertTrue(revisor.apto_para_datos_personales)


if __name__ == "__main__":
    unittest.main()

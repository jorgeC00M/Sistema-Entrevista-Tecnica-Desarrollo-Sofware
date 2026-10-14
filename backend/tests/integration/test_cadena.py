"""La cadena de respaldo: si un proveedor gratuito se agota, responde el siguiente."""

import unittest

from integrations.ia.cadena import ProveedorEnCadena
from integrations.ia.exceptions import ErrorPermanente, ErrorTransitorio, RespuestaIAInvalida
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import AreaTecnica, ContextoDeEntrevista, Nivel, Puesto

CONTEXTO = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.BASICO)


class Falla(FakeProveedorIA):
    """Un eslabón que siempre falla con el error indicado y cuenta sus llamadas."""

    def __init__(self, nombre, error):
        super().__init__()
        self.nombre = nombre
        self.modelo = f"{nombre}-modelo"
        self._error = error
        self.llamadas = 0

    def evaluar_respuesta(self, *args):
        self.llamadas += 1
        raise self._error


class Responde(FakeProveedorIA):
    def __init__(self, nombre):
        super().__init__()
        self.nombre = nombre
        self.modelo = f"{nombre}-modelo"
        self.llamadas = 0

    def evaluar_respuesta(self, *args):
        self.llamadas += 1
        return super().evaluar_respuesta(*args)


def _evaluar(proveedor):
    return proveedor.evaluar_respuesta(CONTEXTO, AreaTecnica.PROGRAMACION, "¿Qué es SQL?", "Un lenguaje")


class ProveedorEnCadenaTest(unittest.TestCase):
    def test_si_el_primero_responde_el_segundo_no_recibe_llamadas(self):
        primero, segundo = Responde("gemini"), Responde("deepseek")
        cadena = ProveedorEnCadena([primero, segundo])

        _evaluar(cadena)

        self.assertEqual((primero.llamadas, segundo.llamadas), (1, 0))
        self.assertEqual(cadena.nombre, "gemini")

    def test_cuota_agotada_pasa_al_siguiente_y_registra_quien_respondio(self):
        primero = Falla("gemini", ErrorTransitorio("429"))
        segundo = Responde("deepseek")
        cadena = ProveedorEnCadena([primero, segundo])

        evaluacion = _evaluar(cadena)

        self.assertIsNotNone(evaluacion)
        self.assertEqual((cadena.nombre, cadena.modelo), ("deepseek", "deepseek-modelo"))

    def test_respuesta_invalida_y_error_permanente_tambien_pasan_al_siguiente(self):
        for error in (RespuestaIAInvalida("json roto"), ErrorPermanente("401")):
            with self.subTest(error=type(error).__name__):
                segundo = Responde("deepseek")
                cadena = ProveedorEnCadena([Falla("gemini", error), segundo])
                _evaluar(cadena)
                self.assertEqual(segundo.llamadas, 1)

    def test_si_todos_fallan_se_relanza_el_error_del_ultimo(self):
        cadena = ProveedorEnCadena(
            [Falla("gemini", ErrorTransitorio("429")), Falla("deepseek", ErrorPermanente("401"))]
        )
        with self.assertRaises(ErrorPermanente):
            _evaluar(cadena)

    def test_la_cadena_es_apta_solo_si_todos_sus_eslabones_lo_son(self):
        no_apto = Responde("deepseek")
        no_apto.apto_para_datos_personales = False
        self.assertTrue(ProveedorEnCadena([Responde("a"), Responde("b")]).apto_para_datos_personales)
        self.assertFalse(ProveedorEnCadena([Responde("a"), no_apto]).apto_para_datos_personales)

    def test_una_cadena_vacia_no_existe(self):
        with self.assertRaises(ValueError):
            ProveedorEnCadena([])


if __name__ == "__main__":
    unittest.main()

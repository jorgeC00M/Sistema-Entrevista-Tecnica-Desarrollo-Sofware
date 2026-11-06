"""Un JSON inutilizable se vuelve a pedir una vez al mismo proveedor.

Va en `ProveedorIAporJSON._pedir_y_parsear`, el único paso común de todas las
operaciones; aquí se ejercita con un adaptador falso que devuelve respuestas
guionadas, sin red.
"""

import unittest
from typing import Any

from integrations.ia.base import ProveedorIAporJSON
from integrations.ia.exceptions import RespuestaIAInvalida
from integrations.ia.prompts.schemas import AreaTecnica, ContextoDeEntrevista, Nivel, Puesto

EVALUACION_VALIDA = {
    "niveles": {"correccion": 3, "completitud": 3, "claridad": 3},
    "fortalezas": "Bien.",
    "debilidades": "Poco.",
    "sugerencias": "Más.",
    "puntos_clave": ["Uno", "Dos"],
}


class Guionado(ProveedorIAporJSON):
    nombre = "guionado"
    modelo = "guionado-1"

    def __init__(self, respuestas: list[Any]):
        self._respuestas = list(respuestas)
        self.llamadas = 0

    def _pedir_json(self, sistema: str, entrada: str, esquema: dict[str, Any]) -> dict[str, Any]:
        self.llamadas += 1
        siguiente = self._respuestas.pop(0)
        if isinstance(siguiente, Exception):
            raise siguiente
        return siguiente


CONTEXTO = ContextoDeEntrevista(puesto=Puesto("backend"), nivel=Nivel("junior"), tecnologia="Django")


class ReintentoAnteRespuestaInvalidaTest(unittest.TestCase):
    def _evaluar(self, proveedor):
        return proveedor.evaluar_respuesta(CONTEXTO, AreaTecnica.APIS, "¿Qué es un ORM?", "Un mapeo.")

    def test_un_json_roto_y_luego_uno_valido_da_exito(self):
        proveedor = Guionado([RespuestaIAInvalida("no es JSON"), EVALUACION_VALIDA])

        evaluacion = self._evaluar(proveedor)

        self.assertEqual(evaluacion.niveles.correccion, 3)
        self.assertEqual(proveedor.llamadas, 2)

    def test_fuera_del_esquema_tambien_se_reintenta(self):
        proveedor = Guionado([{"niveles": {}}, EVALUACION_VALIDA])

        self._evaluar(proveedor)

        self.assertEqual(proveedor.llamadas, 2)

    def test_dos_invalidas_seguidas_suben_el_error(self):
        proveedor = Guionado([RespuestaIAInvalida("uno"), RespuestaIAInvalida("dos")])

        with self.assertRaises(RespuestaIAInvalida):
            self._evaluar(proveedor)
        self.assertEqual(proveedor.llamadas, 2)

    def test_una_respuesta_valida_no_se_pide_dos_veces(self):
        proveedor = Guionado([EVALUACION_VALIDA])

        self._evaluar(proveedor)

        self.assertEqual(proveedor.llamadas, 1)


if __name__ == "__main__":
    unittest.main()

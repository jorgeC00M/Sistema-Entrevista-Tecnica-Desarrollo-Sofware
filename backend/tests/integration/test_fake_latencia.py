"""La latencia del proveedor falso existe solo para la prueba de carga: sin la
variable es 0, así que los tests siguen siendo instantáneos."""

import os
import unittest
from unittest import mock

from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import AreaTecnica, ContextoDeEntrevista, Nivel, Puesto

CONTEXTO = ContextoDeEntrevista(puesto=Puesto("backend"), nivel=Nivel("junior"), tecnologia="Django")


class LatenciaDelFakeTest(unittest.TestCase):
    def _evaluar(self, proveedor):
        proveedor.evaluar_respuesta(CONTEXTO, AreaTecnica.APIS, "¿Qué es un ORM?", "Un mapeo.")

    def test_sin_la_variable_no_duerme(self):
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("IA_FAKE_LATENCIA_MS", None)
            with mock.patch("integrations.ia.fake.time.sleep") as dormir:
                self._evaluar(FakeProveedorIA())
        dormir.assert_not_called()

    def test_con_la_variable_duerme_en_cada_llamada(self):
        with mock.patch.dict(os.environ, {"IA_FAKE_LATENCIA_MS": "1500"}):
            proveedor = FakeProveedorIA()
        with mock.patch("integrations.ia.fake.time.sleep") as dormir:
            self._evaluar(proveedor)
        dormir.assert_called_once_with(1.5)


if __name__ == "__main__":
    unittest.main()

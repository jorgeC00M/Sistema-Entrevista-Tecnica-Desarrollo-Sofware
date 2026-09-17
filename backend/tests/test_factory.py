import os
import unittest
from unittest import mock

from entrevistas.services.ia.base import ProveedorIA
from entrevistas.services.ia.factory import ProveedorNoDisponible, get_proveedor


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


if __name__ == "__main__":
    unittest.main()

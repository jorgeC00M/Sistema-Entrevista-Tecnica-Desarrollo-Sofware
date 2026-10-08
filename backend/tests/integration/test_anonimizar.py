"""Enmascarado de datos personales antes de enviar texto a la IA, sin Django."""

import unittest

from integrations.documentos.anonimizar import enmascarar

TEXTO = """Desarrollador Backend, Jalasoft
Ene 2020 - Mar 2023
- Reduje la latencia 40% migrando a Python 3.11
- Portafolio: https://github.com/jcondori/pagos y linkedin.com/in/jorge-condori
- Contacto de referencia: jorge.condori@example.com, +591 71234567
- Proyecto de Condori premiado en 2022
"""


class EnmascararTest(unittest.TestCase):
    def setUp(self):
        self.resultado = enmascarar(TEXTO, nombre="Jorge Condori Maita")

    def test_tapa_correo_telefono_y_enlaces(self):
        self.assertNotIn("example.com", self.resultado)
        self.assertNotIn("71234567", self.resultado)
        self.assertNotIn("github.com", self.resultado)
        self.assertNotIn("linkedin.com", self.resultado)
        self.assertIn("[CORREO]", self.resultado)
        self.assertIn("[TELÉFONO]", self.resultado)
        self.assertIn("[ENLACE]", self.resultado)

    def test_tapa_el_nombre_aunque_aparezca_suelto(self):
        self.assertNotIn("Condori", self.resultado)
        self.assertIn("Proyecto de [NOMBRE]", self.resultado)

    def test_conserva_lo_que_la_ia_necesita(self):
        """Cifras de logros, versiones y fechas no son datos personales."""
        self.assertIn("40%", self.resultado)
        self.assertIn("Python 3.11", self.resultado)
        self.assertIn("Ene 2020 - Mar 2023", self.resultado)
        self.assertIn("2022", self.resultado)

    def test_sin_nombre_detectado_no_falla(self):
        self.assertIn("Condori", enmascarar("Proyecto de Condori"))

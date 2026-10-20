"""La medición de consistencia es evidencia para la defensa: tiene que medir
lo que dice y no dejar rastro en la base de datos."""

from io import StringIO

from django.core.management import CommandError, call_command
from django.test import TestCase

from apps.entrevistas.models import Entrevista
from apps.evaluaciones.consistencia import cargar_casos, medir
from apps.evaluaciones.models import Evaluacion
from apps.evaluaciones.rubricas import BANDAS
from integrations.ia.fake import FakeProveedorIA


class CasosDeEjemploTest(TestCase):
    def test_los_casos_cargan_y_cubren_bandas_y_areas(self):
        casos = cargar_casos()

        self.assertEqual(len(casos), 8)
        self.assertEqual({c.banda_esperada for c in casos}, {b.codigo for b in BANDAS})
        self.assertGreaterEqual(len({c.area for c in casos}), 4)
        self.assertEqual({c.contexto.nivel.value for c in casos}, {"junior", "semi_senior"})
        for caso in casos:
            with self.subTest(caso=caso.id):
                self.assertTrue(caso.pregunta.strip())
                self.assertTrue(caso.respuesta.strip())


class MedirConsistenciaTest(TestCase):
    def test_con_el_proveedor_simulado_no_hay_variacion(self):
        resultados = medir(FakeProveedorIA(), repeticiones=3)

        for r in resultados:
            with self.subTest(caso=r.caso.id):
                self.assertEqual(len(r.notas), 3)
                self.assertEqual(r.desviacion, 0)
                self.assertEqual(r.coincidencia_de_banda, 1.0)

    def test_no_escribe_en_la_base_de_datos(self):
        call_command("medir_consistencia", "--repeticiones", "3", "--proveedor", "fake", stdout=StringIO())

        self.assertEqual(Evaluacion.objects.count(), 0)
        self.assertEqual(Entrevista.objects.count(), 0)

    def test_el_comando_informa_el_resumen(self):
        salida = StringIO()
        call_command("medir_consistencia", "--repeticiones", "2", "--proveedor", "fake", stdout=salida)

        self.assertIn("desviación estándar media=0.00", salida.getvalue())
        self.assertIn("misma banda en el 100%", salida.getvalue())

    def test_una_sola_repeticion_es_un_error(self):
        with self.assertRaises(CommandError):
            call_command("medir_consistencia", "--repeticiones", "1", "--proveedor", "fake", stdout=StringIO())
        with self.assertRaises(ValueError):
            medir(FakeProveedorIA(), repeticiones=1)

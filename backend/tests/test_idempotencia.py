from django.contrib.auth import get_user_model
from django.test import TestCase

from entrevistas.services import entrevista as servicio
from entrevistas.services.ia.errores import ErrorTransitorio
from entrevistas.services.ia.fake import FakeProveedorIA
from entrevistas.services.ia.schemas import AreaTecnica, Nivel

Usuario = get_user_model()


class IdempotenciaTest(TestCase):
    """Un fallo de la API a mitad de `responder()` no debe duplicar el
    intercambio ni perder la respuesta ya guardada. El orden de operaciones
    (guardar respuesta -> llamar a la IA -> guardar evaluación) es lo que
    hace que el reintento sea seguro.
    """

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )

    def test_reintento_tras_fallo_no_duplica_intercambio_ni_evaluacion(self):
        # Llamada 1 = generar_pregunta dentro de iniciar(). Fallar en la 2 =
        # la evaluación del primer responder().
        proveedor_que_falla = FakeProveedorIA(fallar_en=2)
        entrevista = servicio.iniciar(
            self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, proveedor=proveedor_que_falla
        )

        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_que_falla)

        intercambio = entrevista.intercambios.get(numero=1)
        self.assertEqual(intercambio.respuesta, "Mi respuesta")
        self.assertIsNotNone(intercambio.respondido_en)
        self.assertFalse(hasattr(intercambio, "evaluacion"))

        # Reintento con un proveedor sano: no debe duplicar el intercambio ni
        # reescribir la respuesta ya guardada.
        proveedor_sano = FakeProveedorIA()
        servicio.responder(entrevista, "Un texto distinto que no debería guardarse", proveedor=proveedor_sano)

        self.assertEqual(entrevista.intercambios.filter(numero=1).count(), 1)
        intercambio.refresh_from_db()
        self.assertEqual(intercambio.respuesta, "Mi respuesta")  # se conserva la original
        self.assertTrue(hasattr(intercambio, "evaluacion"))
        self.assertEqual(entrevista.intercambios.count(), 2)  # la 1 evaluada + la pregunta 2 generada

    def test_reintento_exitoso_deja_exactamente_una_evaluacion(self):
        proveedor_que_falla = FakeProveedorIA(fallar_en=2)
        entrevista = servicio.iniciar(
            self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, proveedor=proveedor_que_falla
        )
        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_que_falla)

        proveedor_sano = FakeProveedorIA()
        servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_sano)

        intercambio = entrevista.intercambios.get(numero=1)
        from entrevistas.models import Evaluacion

        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 1)


if __name__ == "__main__":
    import unittest

    unittest.main()

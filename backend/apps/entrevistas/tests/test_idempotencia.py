from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.entrevistas import services as servicio
from tests.conftest import area_de, nivel_de
from integrations.ia.exceptions import ErrorTransitorio
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import AreaTecnica, Nivel

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
            self.usuario, area_de(AreaTecnica.PROGRAMACION), nivel_de(Nivel.BASICO), proveedor=proveedor_que_falla
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
            self.usuario, area_de(AreaTecnica.PROGRAMACION), nivel_de(Nivel.BASICO), proveedor=proveedor_que_falla
        )
        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_que_falla)

        proveedor_sano = FakeProveedorIA()
        servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_sano)

        intercambio = entrevista.intercambios.get(numero=1)
        from apps.evaluaciones.models import Evaluacion

        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 1)

    def test_fallo_al_generar_la_siguiente_pregunta_deshace_la_evaluacion(self):
        """El rollback más delicado del sistema.

        `responder()` guarda la evaluación y genera la pregunta siguiente
        dentro de la misma transacción a propósito: si la generación falla,
        la evaluación tiene que deshacerse también. Si no, la entrevista
        quedaría sin pregunta pendiente y sin estado final —atascada— y el
        reintento encontraría el intercambio ya evaluado.

        Llamadas: 1 = pregunta inicial, 2 = evaluación, 3 = pregunta nº2.
        """
        proveedor_que_falla = FakeProveedorIA(fallar_en=3)
        entrevista = servicio.iniciar(
            self.usuario,
            area_de(AreaTecnica.PROGRAMACION),
            nivel_de(Nivel.BASICO),
            proveedor=proveedor_que_falla,
        )

        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_que_falla)

        from apps.evaluaciones.models import Evaluacion

        intercambio = entrevista.intercambios.get(numero=1)
        # La respuesta sobrevive (se guarda fuera de la transacción), pero la
        # evaluación se deshizo junto con la pregunta que no llegó a crearse.
        self.assertEqual(intercambio.respuesta, "Mi respuesta")
        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 0)
        self.assertEqual(entrevista.intercambios.count(), 1)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, entrevista.Estado.EN_PROGRESO)

        # Y el reintento con un proveedor sano continúa la entrevista.
        servicio.responder(entrevista, "Mi respuesta", proveedor=FakeProveedorIA())

        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 1)
        self.assertEqual(entrevista.intercambios.count(), 2)

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.entrevistas import services as servicio
from tests.conftest import nivel_de, puesto_de
from integrations.ia.exceptions import ErrorTransitorio
from integrations.ia.fake import FakeProveedorIA

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
        # Llamada 1 = el calentamiento dentro de iniciar() (las dos primeras
        # preguntas de una vez). Fallar en la 2 = la evaluación del primer
        # responder().
        proveedor_que_falla = FakeProveedorIA(fallar_en=2)
        entrevista = servicio.iniciar(
            self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=proveedor_que_falla
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
        # Siguen siendo las dos del calentamiento: responder la primera no
        # genera nada, porque la segunda ya existía.
        self.assertEqual(entrevista.intercambios.count(), 2)

    def test_reintento_exitoso_deja_exactamente_una_evaluacion(self):
        proveedor_que_falla = FakeProveedorIA(fallar_en=2)
        entrevista = servicio.iniciar(
            self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=proveedor_que_falla
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

        Se falla al generar la pregunta 3, no la 2: las dos primeras son el
        calentamiento y se crean juntas en `iniciar()`, así que responder la
        primera no genera nada. Llamadas: 1 = calentamiento (las dos preguntas
        de una vez), 2 = evaluar la respuesta 1, 3 = evaluar la respuesta 2,
        4 = generar la pregunta 3.
        """
        proveedor_que_falla = FakeProveedorIA(fallar_en=4)
        entrevista = servicio.iniciar(
            self.usuario,
            puesto_de("backend"),
            nivel_de("junior"),
            proveedor=proveedor_que_falla,
        )

        # La primera respuesta pasa sin incidentes: no hay pregunta que generar.
        servicio.responder(entrevista, "Mi primera respuesta", proveedor=proveedor_que_falla)

        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor_que_falla)

        from apps.evaluaciones.models import Evaluacion

        intercambio = entrevista.intercambios.get(numero=2)
        # La respuesta sobrevive (se guarda fuera de la transacción), pero la
        # evaluación se deshizo junto con la pregunta que no llegó a crearse.
        self.assertEqual(intercambio.respuesta, "Mi respuesta")
        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 0)
        # Siguen siendo solo las dos del calentamiento: la tercera no se creó.
        self.assertEqual(entrevista.intercambios.count(), 2)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, entrevista.Estado.EN_PROGRESO)

        # Y el reintento con un proveedor sano continúa la entrevista.
        servicio.responder(entrevista, "Mi respuesta", proveedor=FakeProveedorIA())

        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 1)
        # Ahora sí aparece la tercera: el reintento completó lo que el fallo dejó
        # a medias, sin duplicar nada de lo anterior.
        self.assertEqual(entrevista.intercambios.count(), 3)

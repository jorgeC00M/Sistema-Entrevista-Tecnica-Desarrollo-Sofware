from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.entrevistas.models import Entrevista, Intercambio
from apps.entrevistas import services as servicio
from tests.conftest import area_de, nivel_de
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica, Nivel

Usuario = get_user_model()


class FlujoDeEntrevistaTest(TestCase):
    """Recorre una entrevista completa a través del orquestador, contra una
    base de datos real (la que Django crea y destruye para las pruebas).
    """

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )

    def _completar_entrevista(self, proveedor):
        entrevista = servicio.iniciar(self.usuario, area_de(AreaTecnica.PROGRAMACION), nivel_de(Nivel.BASICO), proveedor=proveedor)
        for _ in range(PREGUNTAS_POR_ENTREVISTA):
            pendiente = entrevista.intercambios.filter(evaluacion__isnull=True).order_by("numero").first()
            servicio.responder(entrevista, f"Respuesta a la pregunta {pendiente.numero}", proveedor=proveedor)
        entrevista.refresh_from_db()
        return entrevista

    def test_iniciar_crea_la_entrevista_y_la_primera_pregunta(self):
        proveedor = FakeProveedorIA()
        entrevista = servicio.iniciar(self.usuario, area_de(AreaTecnica.PROGRAMACION), nivel_de(Nivel.BASICO), proveedor=proveedor)

        self.assertEqual(entrevista.usuario, self.usuario)
        self.assertEqual(entrevista.estado, Entrevista.Estado.EN_PROGRESO)
        self.assertEqual(entrevista.intercambios.count(), 1)
        self.assertEqual(entrevista.intercambios.first().numero, 1)

    def test_entrevista_completa_queda_persistida_y_finalizada(self):
        proveedor = FakeProveedorIA()
        entrevista = self._completar_entrevista(proveedor)

        self.assertEqual(entrevista.estado, Entrevista.Estado.FINALIZADA)
        self.assertEqual(entrevista.intercambios.count(), PREGUNTAS_POR_ENTREVISTA)
        self.assertEqual(
            Intercambio.objects.filter(entrevista=entrevista, evaluacion__isnull=False).count(),
            PREGUNTAS_POR_ENTREVISTA,
        )
        self.assertIsNotNone(entrevista.puntuacion_promedio)
        self.assertIsNotNone(entrevista.fecha_fin)

    def test_puntuacion_promedio_es_el_promedio_real(self):
        proveedor = FakeProveedorIA()  # siempre califica 75
        entrevista = self._completar_entrevista(proveedor)

        self.assertEqual(entrevista.puntuacion_promedio, 75)

    def test_evaluacion_registra_el_proveedor_y_modelo_usados(self):
        proveedor = FakeProveedorIA()
        entrevista = servicio.iniciar(self.usuario, area_de(AreaTecnica.PROGRAMACION), nivel_de(Nivel.BASICO), proveedor=proveedor)
        evaluacion = servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor)

        self.assertEqual(evaluacion.proveedor_ia, "fake")
        self.assertEqual(evaluacion.modelo_ia, "fake-1")

    def test_responder_sin_intercambio_pendiente_falla_explicito(self):
        proveedor = FakeProveedorIA()
        entrevista = self._completar_entrevista(proveedor)

        with self.assertRaises(ValueError):
            servicio.responder(entrevista, "Respuesta de más", proveedor=proveedor)


if __name__ == "__main__":
    import unittest

    unittest.main()

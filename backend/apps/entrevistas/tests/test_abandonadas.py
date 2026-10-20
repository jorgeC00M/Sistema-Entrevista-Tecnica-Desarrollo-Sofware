from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas.models import Entrevista
from apps.entrevistas import services as servicio
from apps.evaluaciones.models import Evaluacion
from integrations.ia.fake import FakeProveedorIA
from tests.conftest import crear_entrevista, crear_intercambio, crear_usuario, nivel_de, puesto_de

Usuario = get_user_model()


class AbandonoTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )

    def test_entrevista_vieja_sin_actividad_pasa_a_abandonada(self):
        entrevista = crear_entrevista(self.usuario)
        Entrevista.objects.filter(pk=entrevista.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )

        actualizadas = servicio.marcar_abandonadas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(actualizadas, 1)
        self.assertEqual(entrevista.estado, Entrevista.Estado.ABANDONADA)

    def test_entrevista_reciente_no_se_marca(self):
        crear_entrevista(self.usuario)

        actualizadas = servicio.marcar_abandonadas(self.usuario)
        self.assertEqual(actualizadas, 0)

    def test_no_afecta_entrevistas_ya_finalizadas(self):
        entrevista = crear_entrevista(self.usuario, estado=Entrevista.Estado.FINALIZADA)
        Entrevista.objects.filter(pk=entrevista.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )

        servicio.marcar_abandonadas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.FINALIZADA)

    def test_actividad_reciente_en_un_intercambio_evita_el_abandono(self):
        """Aunque la entrevista haya iniciado hace más de 30 minutos, una
        respuesta reciente cuenta como actividad."""
        entrevista = crear_entrevista(self.usuario)
        Entrevista.objects.filter(pk=entrevista.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )
        crear_intercambio(
            entrevista,
            respuesta="r",
            respondido_en=timezone.now() - timedelta(minutes=2),
        )

        actualizadas = servicio.marcar_abandonadas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(actualizadas, 0)
        self.assertEqual(entrevista.estado, Entrevista.Estado.EN_PROGRESO)

    def test_no_afecta_entrevistas_de_otro_usuario(self):
        otro_usuario = Usuario.objects.create_user(
            email="otro@example.com", password="clave-segura-123", nombre_completo="Otro"
        )
        entrevista_ajena = crear_entrevista(otro_usuario)
        Entrevista.objects.filter(pk=entrevista_ajena.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )

        servicio.marcar_abandonadas(self.usuario)

        entrevista_ajena.refresh_from_db()
        self.assertEqual(entrevista_ajena.estado, Entrevista.Estado.EN_PROGRESO)

    def test_el_coste_no_crece_con_el_numero_de_entrevistas(self):
        """Candado contra el N+1: `marcar_abandonadas` corre en cada consulta
        del historial, así que su número de consultas debe ser constante y no
        depender de cuántas entrevistas en progreso tenga el usuario."""
        self._crear_en_progreso_antiguas(1)
        with self.assertNumQueries(1):
            servicio.marcar_abandonadas(self.usuario)

        self._crear_en_progreso_antiguas(5)
        with self.assertNumQueries(1):
            servicio.marcar_abandonadas(self.usuario)

    def _crear_en_progreso_antiguas(self, cuantas: int) -> None:
        for _ in range(cuantas):
            entrevista = crear_entrevista(self.usuario)
            crear_intercambio(
                entrevista,
                respuesta="r",
                respondido_en=timezone.now() - timedelta(minutes=45),
            )
            Entrevista.objects.filter(pk=entrevista.pk).update(
                fecha_inicio=timezone.now() - timedelta(minutes=45)
            )


class AbandonoManualTest(APITestCase):
    """`POST /api/entrevistas/<id>/abandonar/`: el usuario deja la entrevista a
    medias tras confirmarlo en la interfaz."""

    def setUp(self):
        self.usuario = crear_usuario(email="manual@example.com")
        self.client.force_authenticate(self.usuario)
        self.proveedor = FakeProveedorIA()
        self.entrevista = servicio.iniciar(
            self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=self.proveedor
        )
        servicio.responder(self.entrevista, "Una respuesta", proveedor=self.proveedor)

    def _abandonar(self, entrevista=None):
        return self.client.post(f"/api/entrevistas/{(entrevista or self.entrevista).pk}/abandonar/")

    def test_deja_la_entrevista_abandonada_sin_tocar_lo_respondido(self):
        respuesta = self._abandonar()

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["estado"], Entrevista.Estado.ABANDONADA)
        self.entrevista.refresh_from_db()
        self.assertEqual(self.entrevista.estado, Entrevista.Estado.ABANDONADA)
        self.assertIsNotNone(self.entrevista.fecha_fin)
        self.assertIsNone(self.entrevista.puntuacion_promedio)
        self.assertEqual(Evaluacion.objects.filter(intercambio__entrevista=self.entrevista).count(), 1)

    def test_despues_el_reporte_es_parcial(self):
        self._abandonar()

        datos = self.client.get(f"/api/entrevistas/{self.entrevista.pk}/resultados/").data

        self.assertIsNotNone(datos["resumen"])
        self.assertEqual(datos["entrevista"]["preguntas_calificadas"], 1)
        self.assertIsNotNone(datos["intercambios"][0]["evaluacion"])

    def test_una_terminada_responde_409(self):
        self._abandonar()

        self.assertEqual(self._abandonar().status_code, status.HTTP_409_CONFLICT)

    def test_ya_no_se_puede_responder(self):
        self._abandonar()

        respuesta = self.client.post(
            f"/api/entrevistas/{self.entrevista.pk}/responder/", {"respuesta": "Otra"}, format="json"
        )

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)

    def test_la_de_otro_usuario_es_404(self):
        otro = crear_usuario(email="otro@example.com")
        ajena = servicio.iniciar(otro, puesto_de("backend"), nivel_de("junior"), proveedor=self.proveedor)

        self.assertEqual(self._abandonar(ajena).status_code, status.HTTP_404_NOT_FOUND)
        ajena.refresh_from_db()
        self.assertEqual(ajena.estado, Entrevista.Estado.EN_PROGRESO)

    def test_requiere_sesion(self):
        self.client.force_authenticate(None)

        self.assertEqual(self._abandonar().status_code, status.HTTP_401_UNAUTHORIZED)

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from apps.entrevistas.models import Entrevista
from apps.entrevistas import services as servicio
from tests.conftest import crear_entrevista, crear_intercambio

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

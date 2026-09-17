from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from entrevistas.models import Entrevista
from entrevistas.services import entrevista as servicio
from entrevistas.services.ia.schemas import AreaTecnica, Nivel

Usuario = get_user_model()


class AbandonoTest(TestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )

    def test_entrevista_vieja_sin_actividad_pasa_a_abandonada(self):
        entrevista = Entrevista.objects.create(
            usuario=self.usuario, area=AreaTecnica.PROGRAMACION.value, nivel=Nivel.BASICO.value
        )
        Entrevista.objects.filter(pk=entrevista.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )

        actualizadas = servicio.marcar_abandonadas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(actualizadas, 1)
        self.assertEqual(entrevista.estado, Entrevista.Estado.ABANDONADA)

    def test_entrevista_reciente_no_se_marca(self):
        Entrevista.objects.create(
            usuario=self.usuario, area=AreaTecnica.PROGRAMACION.value, nivel=Nivel.BASICO.value
        )

        actualizadas = servicio.marcar_abandonadas(self.usuario)
        self.assertEqual(actualizadas, 0)

    def test_no_afecta_entrevistas_ya_finalizadas(self):
        entrevista = Entrevista.objects.create(
            usuario=self.usuario,
            area=AreaTecnica.PROGRAMACION.value,
            nivel=Nivel.BASICO.value,
            estado=Entrevista.Estado.FINALIZADA,
        )
        Entrevista.objects.filter(pk=entrevista.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )

        servicio.marcar_abandonadas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.FINALIZADA)

    def test_actividad_reciente_en_un_intercambio_evita_el_abandono(self):
        """Aunque la entrevista haya iniciado hace más de 30 minutos, una
        respuesta reciente cuenta como actividad."""
        entrevista = Entrevista.objects.create(
            usuario=self.usuario, area=AreaTecnica.PROGRAMACION.value, nivel=Nivel.BASICO.value
        )
        Entrevista.objects.filter(pk=entrevista.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )
        entrevista.intercambios.create(
            numero=1,
            pregunta="p",
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
        entrevista_ajena = Entrevista.objects.create(
            usuario=otro_usuario, area=AreaTecnica.PROGRAMACION.value, nivel=Nivel.BASICO.value
        )
        Entrevista.objects.filter(pk=entrevista_ajena.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=45)
        )

        servicio.marcar_abandonadas(self.usuario)

        entrevista_ajena.refresh_from_db()
        self.assertEqual(entrevista_ajena.estado, Entrevista.Estado.EN_PROGRESO)


if __name__ == "__main__":
    import unittest

    unittest.main()

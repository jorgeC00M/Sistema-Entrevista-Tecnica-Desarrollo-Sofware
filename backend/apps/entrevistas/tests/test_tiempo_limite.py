"""El límite total de la entrevista y los estados en que termina.

30 minutos desde el inicio, no de inactividad. Vencida sin respuestas queda
ABANDONADA; con alguna, TIEMPO_AGOTADO. Lo aplica cada puerta de la API, no
solo el historial, y solo una FINALIZADA tiene nota.
"""

from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.entrevistas.models import MINUTOS_DE_ENTREVISTA, Entrevista
from apps.evaluaciones.models import Evaluacion
from integrations.ia.fake import FakeProveedorIA
from tests.conftest import crear_entrevista, crear_intercambio, crear_usuario, nivel_de, puesto_de

PASADO_EL_LIMITE = timedelta(minutes=MINUTOS_DE_ENTREVISTA + 1)


def _iniciada_hace(entrevista, delta) -> None:
    Entrevista.objects.filter(pk=entrevista.pk).update(fecha_inicio=timezone.now() - delta)
    entrevista.refresh_from_db()


class CerrarVencidasTest(TestCase):
    def setUp(self):
        self.usuario = crear_usuario()

    def test_vencida_sin_respuestas_queda_abandonada_con_fin_en_el_limite(self):
        entrevista = crear_entrevista(self.usuario)
        _iniciada_hace(entrevista, PASADO_EL_LIMITE)

        self.assertEqual(servicio.cerrar_vencidas(self.usuario), 1)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.ABANDONADA)
        self.assertEqual(entrevista.fecha_fin, entrevista.fecha_limite)

    def test_vencida_con_respuestas_queda_con_el_tiempo_agotado(self):
        entrevista = crear_entrevista(self.usuario)
        crear_intercambio(entrevista, respuesta="r", respondido_en=timezone.now())
        crear_intercambio(entrevista, numero=2)
        _iniciada_hace(entrevista, PASADO_EL_LIMITE)

        servicio.cerrar_vencidas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.TIEMPO_AGOTADO)
        self.assertEqual(entrevista.fecha_fin, entrevista.fecha_limite)
        self.assertIsNone(entrevista.puntuacion_promedio)

    def test_responder_no_extiende_el_limite(self):
        """Es un límite total: una respuesta de hace dos minutos no la salva."""
        entrevista = crear_entrevista(self.usuario)
        crear_intercambio(entrevista, respuesta="r", respondido_en=timezone.now() - timedelta(minutes=2))
        _iniciada_hace(entrevista, PASADO_EL_LIMITE)

        servicio.cerrar_vencidas(self.usuario)

        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.TIEMPO_AGOTADO)

    def test_una_dentro_del_limite_no_se_cierra(self):
        entrevista = crear_entrevista(self.usuario)
        _iniciada_hace(entrevista, timedelta(minutes=MINUTOS_DE_ENTREVISTA - 1))

        self.assertEqual(servicio.cerrar_vencidas(self.usuario), 0)
        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.EN_PROGRESO)

    def test_no_toca_las_ya_terminadas(self):
        """Ni una finalizada ni una abandonada de antes de este cambio cambian."""
        finalizada = crear_entrevista(self.usuario, estado=Entrevista.Estado.FINALIZADA)
        abandonada = crear_entrevista(self.usuario, estado=Entrevista.Estado.ABANDONADA)
        crear_intercambio(abandonada, respuesta="r", respondido_en=timezone.now())
        for entrevista in (finalizada, abandonada):
            _iniciada_hace(entrevista, PASADO_EL_LIMITE)

        self.assertEqual(servicio.cerrar_vencidas(self.usuario), 0)

        finalizada.refresh_from_db()
        abandonada.refresh_from_db()
        self.assertEqual(finalizada.estado, Entrevista.Estado.FINALIZADA)
        self.assertEqual(abandonada.estado, Entrevista.Estado.ABANDONADA)

    def test_no_afecta_entrevistas_de_otro_usuario(self):
        ajena = crear_entrevista(crear_usuario(email="otro@example.com"))
        _iniciada_hace(ajena, PASADO_EL_LIMITE)

        servicio.cerrar_vencidas(self.usuario)

        ajena.refresh_from_db()
        self.assertEqual(ajena.estado, Entrevista.Estado.EN_PROGRESO)

    def test_el_coste_no_crece_con_el_numero_de_entrevistas(self):
        """Candado contra el N+1: corre en cada consulta del historial, así que
        son dos sentencias (una por estado) sea cual sea el número."""
        self._vencidas(1)
        with self.assertNumQueries(2):
            servicio.cerrar_vencidas(self.usuario)

        self._vencidas(5)
        with self.assertNumQueries(2):
            servicio.cerrar_vencidas(self.usuario)

    def _vencidas(self, cuantas: int) -> None:
        for i in range(cuantas):
            entrevista = crear_entrevista(self.usuario)
            if i % 2:
                crear_intercambio(entrevista, respuesta="r", respondido_en=timezone.now())
            _iniciada_hace(entrevista, PASADO_EL_LIMITE)


class LimiteEnLaAPITest(APITestCase):
    """Cada puerta aplica el límite: un enlace directo no se lo salta."""

    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.proveedor = FakeProveedorIA()
        self.entrevista = servicio.iniciar(
            self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=self.proveedor
        )

    def _url(self, sufijo=""):
        return f"/api/entrevistas/{self.entrevista.pk}/{sufijo}"

    def test_abrir_el_detalle_tras_el_limite_la_cierra(self):
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        datos = self.client.get(self._url()).data

        self.assertEqual(datos["entrevista"]["estado"], Entrevista.Estado.ABANDONADA)

    def test_pedir_los_resultados_tras_el_limite_la_cierra(self):
        servicio.responder(self.entrevista, "Una respuesta", proveedor=self.proveedor)
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        datos = self.client.get(self._url("resultados/")).data

        self.assertEqual(datos["entrevista"]["estado"], Entrevista.Estado.TIEMPO_AGOTADO)

    def test_una_respuesta_tardia_recibe_409_y_no_se_guarda(self):
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        respuesta = self.client.post(self._url("responder/"), {"respuesta": "Tarde"}, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)
        self.assertIn("Se acabó el tiempo", respuesta.data["detail"])
        self.assertFalse(self.entrevista.intercambios.exclude(respuesta="").exists())
        self.entrevista.refresh_from_db()
        self.assertEqual(self.entrevista.estado, Entrevista.Estado.ABANDONADA)

    def test_el_reintento_tras_el_limite_no_ofrece_otra_pregunta(self):
        """La de calentamiento existe sin responder, pero la entrevista ya cerró."""
        primera = self.entrevista.intercambios.get(numero=1)
        primera.respuesta = "Llegó a tiempo"
        primera.respondido_en = timezone.now()
        primera.save()
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        datos = self.client.post(self._url("responder/"), {"respuesta": "x"}, format="json").data

        self.assertIsNone(datos["siguiente_pregunta"])
        self.assertEqual(datos["entrevista"]["estado"], Entrevista.Estado.TIEMPO_AGOTADO)

    def test_publica_el_limite_y_la_hora_del_servidor(self):
        datos = self.client.get(self._url()).data["entrevista"]

        self.assertIn("fecha_limite", datos)
        self.assertIn("ahora", datos)
        self.assertNotIn("puntuacion_parcial", datos)


class ReintentoAlBordeDelLimiteTest(TestCase):
    """Cuenta cuándo llegó la respuesta, no cuándo terminó la IA."""

    def setUp(self):
        self.usuario = crear_usuario()
        self.proveedor = FakeProveedorIA()
        self.entrevista = servicio.iniciar(
            self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=self.proveedor
        )

    def test_una_respuesta_guardada_a_tiempo_se_evalua_y_cierra_sin_otra_pregunta(self):
        # La primera llegó a tiempo y su evaluación falló: quedó guardada sin nota.
        primera = self.entrevista.intercambios.get(numero=1)
        primera.respuesta = "Llegó a tiempo"
        primera.respondido_en = timezone.now() - timedelta(minutes=2)
        primera.save()
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)
        preguntas_antes = self.entrevista.intercambios.count()

        servicio.responder(self.entrevista, "ignorada: ya hay respuesta", proveedor=self.proveedor)

        self.entrevista.refresh_from_db()
        self.assertTrue(Evaluacion.objects.filter(intercambio=primera).exists())
        self.assertEqual(self.entrevista.estado, Entrevista.Estado.TIEMPO_AGOTADO)
        self.assertEqual(self.entrevista.intercambios.count(), preguntas_antes)

    def test_si_vence_tras_la_segunda_no_se_paga_la_tercera(self):
        servicio.responder(self.entrevista, "Primera", proveedor=self.proveedor)
        segunda = self.entrevista.intercambios.get(numero=2)
        segunda.respuesta = "Segunda, a tiempo"
        segunda.respondido_en = timezone.now()
        segunda.save()
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        servicio.responder(self.entrevista, "ignorada", proveedor=self.proveedor)

        self.entrevista.refresh_from_db()
        self.assertEqual(self.entrevista.estado, Entrevista.Estado.TIEMPO_AGOTADO)
        self.assertFalse(self.entrevista.intercambios.filter(numero=3).exists())

    def test_una_respuesta_nueva_tras_el_limite_lanza_tiempo_agotado(self):
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        with self.assertRaises(servicio.TiempoAgotado):
            servicio.responder(self.entrevista, "Tarde", proveedor=self.proveedor)

    def test_el_cierre_no_pisa_una_finalizada(self):
        Entrevista.objects.filter(pk=self.entrevista.pk).update(estado=Entrevista.Estado.FINALIZADA)
        self.entrevista.refresh_from_db()
        _iniciada_hace(self.entrevista, PASADO_EL_LIMITE)

        self.assertFalse(servicio.cerrar_si_vencio(self.entrevista))
        self.assertEqual(self.entrevista.estado, Entrevista.Estado.FINALIZADA)


class SinNotaFueraDeFinalizadaTest(APITestCase):
    """Solo una finalizada tiene nota: lo incompleto no se califica."""

    def setUp(self):
        self.usuario = crear_usuario(email="sinnota@example.com")
        self.client.force_authenticate(self.usuario)
        self.proveedor = FakeProveedorIA()
        self.entrevista = servicio.iniciar(
            self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=self.proveedor
        )
        servicio.responder(self.entrevista, "Una respuesta", proveedor=self.proveedor)

    def _resultados(self):
        return self.client.get(f"/api/entrevistas/{self.entrevista.pk}/resultados/").data

    def _cerrar(self, estado):
        Entrevista.objects.filter(pk=self.entrevista.pk).update(estado=estado, fecha_fin=timezone.now())

    def test_tiempo_agotado_publica_solo_la_retroalimentacion(self):
        self._cerrar(Entrevista.Estado.TIEMPO_AGOTADO)

        datos = self._resultados()

        self.assertIsNone(datos["resumen"])
        self.assertIsNone(datos["veredicto"])
        self.assertEqual(
            set(datos["intercambios"][0]["evaluacion"]), {"fortalezas", "debilidades", "sugerencias"}
        )
        self.assertIsNone(datos["intercambios"][1]["evaluacion"])

    def test_abandonada_tampoco_tiene_nota(self):
        self.client.post(f"/api/entrevistas/{self.entrevista.pk}/abandonar/")

        datos = self._resultados()

        self.assertIsNone(datos["resumen"])
        self.assertNotIn("puntuacion", datos["intercambios"][0]["evaluacion"])
        self.assertNotIn("niveles", datos["intercambios"][0]["evaluacion"])

    def test_el_veredicto_de_una_no_finalizada_es_409(self):
        for estado in (Entrevista.Estado.TIEMPO_AGOTADO, Entrevista.Estado.ABANDONADA):
            with self.subTest(estado=estado):
                self._cerrar(estado)
                respuesta = self.client.post(f"/api/entrevistas/{self.entrevista.pk}/veredicto/")
                self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)


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

    def test_queda_abandonada_aunque_tenga_respuestas(self):
        respuesta = self._abandonar()

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["estado"], Entrevista.Estado.ABANDONADA)
        self.entrevista.refresh_from_db()
        self.assertIsNotNone(self.entrevista.fecha_fin)
        self.assertIsNone(self.entrevista.puntuacion_promedio)
        self.assertEqual(Evaluacion.objects.filter(intercambio__entrevista=self.entrevista).count(), 1)

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

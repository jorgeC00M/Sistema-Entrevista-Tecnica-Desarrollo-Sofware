"""Reanudar sin repetir (`reanudar-sin-repetir-y-errores-de-ia`).

Una respuesta guardada nunca se vuelve a pedir: si la IA falla, queda marcada
para que el chat recargado ofrezca «Reintentar» al instante; el detalle publica
la respuesta y la marca; y dos peticiones sobre el mismo intercambio dejan una
sola evaluación.
"""

from datetime import timedelta
from unittest import mock

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.entrevistas.models import MINUTOS_DE_ENTREVISTA
from apps.evaluaciones.models import Evaluacion
from apps.evaluaciones.services import calificar, guardar
from integrations.ia.exceptions import ErrorTransitorio
from integrations.ia.fake import FakeProveedorIA
from tests.conftest import crear_usuario, nivel_de, puesto_de


def _iniciar(usuario, proveedor):
    return servicio.iniciar(usuario, puesto_de("backend"), nivel_de("junior"), proveedor=proveedor)


def _con_otra_peticion_que_gana(proveedor):
    """Un `calificar` que, antes de devolver, guarda la evaluación como si otra
    petición sobre el mismo intercambio hubiera terminado primero."""

    def calificar_y_perder(contexto, area, pregunta, respuesta, prov):
        resultado = calificar(contexto, area, pregunta, respuesta, prov)
        from apps.entrevistas.models import Intercambio

        intercambio = Intercambio.objects.get(pregunta=pregunta, respuesta=respuesta)
        guardar(intercambio, resultado, proveedor)
        return resultado

    return mock.patch("apps.entrevistas.services.calificar", side_effect=calificar_y_perder)


class MarcaDeFalloTest(TestCase):
    def setUp(self):
        self.usuario = crear_usuario()

    def test_fallo_al_evaluar_marca_la_respuesta(self):
        # Llamada 1 = calentamiento; 2 = la evaluación de la primera respuesta.
        proveedor = FakeProveedorIA(fallar_en=2)
        entrevista = _iniciar(self.usuario, proveedor)

        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor)

        intercambio = entrevista.intercambios.get(numero=1)
        self.assertEqual(intercambio.respuesta, "Mi respuesta")
        self.assertIsNotNone(intercambio.evaluacion_fallida_en)

    def test_fallo_al_generar_la_siguiente_marca_la_respuesta(self):
        # 1 calentamiento, 2 y 3 evaluaciones, 4 = generar la pregunta 3.
        proveedor = FakeProveedorIA(fallar_en=4)
        entrevista = _iniciar(self.usuario, proveedor)
        servicio.responder(entrevista, "Primera", proveedor=proveedor)

        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Segunda", proveedor=proveedor)

        intercambio = entrevista.intercambios.get(numero=2)
        self.assertIsNotNone(intercambio.evaluacion_fallida_en)
        self.assertFalse(Evaluacion.objects.filter(intercambio=intercambio).exists())

    def test_reintento_exitoso_limpia_la_marca(self):
        proveedor = FakeProveedorIA(fallar_en=2)
        entrevista = _iniciar(self.usuario, proveedor)
        with self.assertRaises(ErrorTransitorio):
            servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor)

        servicio.responder(entrevista, "Mi respuesta", proveedor=FakeProveedorIA())

        intercambio = entrevista.intercambios.get(numero=1)
        self.assertIsNone(intercambio.evaluacion_fallida_en)
        self.assertTrue(Evaluacion.objects.filter(intercambio=intercambio).exists())

    def test_tiempo_agotado_no_marca(self):
        proveedor = FakeProveedorIA()
        entrevista = _iniciar(self.usuario, proveedor)
        entrevista.fecha_inicio = timezone.now() - timedelta(minutes=MINUTOS_DE_ENTREVISTA + 1)
        entrevista.save(update_fields=["fecha_inicio"])

        with self.assertRaises(servicio.TiempoAgotado):
            servicio.responder(entrevista, "Tarde", proveedor=proveedor)

        self.assertIsNone(entrevista.intercambios.get(numero=1).evaluacion_fallida_en)


class UnaSolaEvaluacionTest(TestCase):
    def setUp(self):
        self.usuario = crear_usuario()

    def test_la_peticion_que_pierde_la_carrera_devuelve_la_evaluacion_ajena(self):
        proveedor = FakeProveedorIA()
        entrevista = _iniciar(self.usuario, proveedor)

        with _con_otra_peticion_que_gana(proveedor):
            evaluacion = servicio.responder(entrevista, "Mi respuesta", proveedor=proveedor)

        intercambio = entrevista.intercambios.get(numero=1)
        self.assertEqual(Evaluacion.objects.filter(intercambio=intercambio).count(), 1)
        self.assertEqual(evaluacion.intercambio_id, intercambio.pk)
        self.assertEqual(entrevista.intercambios.count(), 2)

    def test_la_ultima_respuesta_perdedora_no_genera_otra_ni_rompe_el_cierre(self):
        proveedor = FakeProveedorIA()
        entrevista = _iniciar(self.usuario, proveedor)
        for i in range(4):
            servicio.responder(entrevista, f"Respuesta {i + 1}", proveedor=proveedor)

        with _con_otra_peticion_que_gana(proveedor):
            servicio.responder(entrevista, "Respuesta 5", proveedor=proveedor)

        self.assertEqual(entrevista.intercambios.count(), 5)
        self.assertEqual(
            Evaluacion.objects.filter(intercambio__entrevista=entrevista).count(), 5
        )


class PendienteEnLaAPITest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.entrevista = _iniciar(self.usuario, FakeProveedorIA())

    def _detalle(self):
        return self.client.get(f"/api/entrevistas/{self.entrevista.pk}/").data

    def test_pendiente_sin_responder(self):
        pendiente = self._detalle()["pregunta_pendiente"]

        self.assertEqual(pendiente["numero"], 1)
        self.assertEqual(pendiente["respuesta"], "")
        self.assertIsNone(pendiente["respondido_en"])
        self.assertFalse(pendiente["evaluacion_fallida"])

    def test_pendiente_con_respuesta_guardada_y_fallida(self):
        proveedor = FakeProveedorIA(fallar_en=1)
        with self.assertRaises(ErrorTransitorio):
            servicio.responder(self.entrevista, "Guardada", proveedor=proveedor)

        pendiente = self._detalle()["pregunta_pendiente"]

        self.assertEqual(pendiente["numero"], 1)
        self.assertEqual(pendiente["respuesta"], "Guardada")
        self.assertIsNotNone(pendiente["respondido_en"])
        self.assertTrue(pendiente["evaluacion_fallida"])

    def test_responder_no_cambia_su_forma(self):
        respuesta = self.client.post(
            f"/api/entrevistas/{self.entrevista.pk}/responder/", {"respuesta": "Una respuesta"}
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(set(respuesta.data["siguiente_pregunta"]), {"numero", "texto"})

    def test_responder_devuelve_el_conteo_al_dia(self):
        """`refresh_from_db()` no recalcula anotaciones: la respuesta traía una
        pregunta calificada de menos."""
        respuesta = self.client.post(
            f"/api/entrevistas/{self.entrevista.pk}/responder/", {"respuesta": "Una respuesta"}
        )

        self.assertEqual(respuesta.data["entrevista"]["preguntas_calificadas"], 1)

    def test_dos_peticiones_a_la_vez_responden_con_exito(self):
        with _con_otra_peticion_que_gana(FakeProveedorIA()):
            respuesta = self.client.post(
                f"/api/entrevistas/{self.entrevista.pk}/responder/", {"respuesta": "Una respuesta"}
            )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["siguiente_pregunta"]["numero"], 2)
        self.assertEqual(
            Evaluacion.objects.filter(intercambio__entrevista=self.entrevista).count(), 1
        )

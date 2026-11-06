"""El veredicto de la IA: se redacta al terminar y nunca pone en riesgo el cierre."""

from __future__ import annotations

from unittest import mock

from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.entrevistas.models import Entrevista
from integrations.ia.exceptions import ErrorTransitorio
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA
from tests.conftest import crear_usuario, nivel_de, puesto_de


class Redactor(FakeProveedorIA):
    """Cuenta los veredictos que se le piden y guarda la última entrada."""

    def __init__(self, fallar=False):
        super().__init__()
        self.veredictos = 0
        self.entrada = None
        self._fallar = fallar

    def redactar_veredicto(self, entrada):
        self.veredictos += 1
        self.entrada = entrada
        if self._fallar:
            raise ErrorTransitorio("429")
        return super().redactar_veredicto(entrada)


class VeredictoTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)

    def _iniciar(self, proveedor):
        return servicio.iniciar(self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=proveedor)

    def _completa(self, proveedor):
        entrevista = self._iniciar(proveedor)
        for numero in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
            servicio.responder(entrevista, f"Respuesta secreta {numero}", proveedor=proveedor)
            if numero < PREGUNTAS_POR_ENTREVISTA:
                self.assertEqual(proveedor.veredictos, 0)
        entrevista.refresh_from_db()
        return entrevista

    def test_la_ultima_respuesta_redacta_el_veredicto_una_sola_vez(self):
        proveedor = Redactor()

        entrevista = self._completa(proveedor)

        self.assertEqual(proveedor.veredictos, 1)
        self.assertEqual(entrevista.veredicto_ia["estado"], "ok")
        self.assertTrue(entrevista.veredicto_ia["texto"])
        self.assertEqual(len(proveedor.entrada.respuestas), PREGUNTAS_POR_ENTREVISTA)

    def test_el_redactor_no_recibe_el_texto_de_las_respuestas(self):
        proveedor = Redactor()

        self._completa(proveedor)

        self.assertNotIn("Respuesta secreta", repr(proveedor.entrada))

    def test_si_la_ia_falla_la_entrevista_se_cierra_igual(self):
        proveedor = Redactor(fallar=True)
        entrevista = self._iniciar(proveedor)
        for _ in range(PREGUNTAS_POR_ENTREVISTA - 1):
            servicio.responder(entrevista, "Una respuesta", proveedor=proveedor)

        # La última, por la API: el fallo del veredicto no se nota en la respuesta.
        with mock.patch("apps.entrevistas.services.get_proveedor", return_value=proveedor):
            respuesta = self.client.post(f"/api/entrevistas/{entrevista.pk}/responder/", {"respuesta": "La última"})

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        entrevista.refresh_from_db()
        self.assertEqual(entrevista.estado, Entrevista.Estado.FINALIZADA)
        self.assertIsNotNone(entrevista.puntuacion_promedio)
        self.assertEqual(entrevista.veredicto_ia["estado"], "no_disponible")

    def test_resultados_lo_publica_al_terminar_y_lo_oculta_en_progreso(self):
        # Primero la terminada: un usuario solo puede tener una en curso.
        terminada = self._completa(Redactor())
        proveedor = Redactor()
        en_curso = self._iniciar(proveedor)
        servicio.responder(en_curso, "Una", proveedor=proveedor)

        en_progreso = self.client.get(f"/api/entrevistas/{en_curso.pk}/resultados/").data
        final = self.client.get(f"/api/entrevistas/{terminada.pk}/resultados/").data

        self.assertIn("veredicto", en_progreso)
        self.assertIsNone(en_progreso["veredicto"])
        self.assertEqual(final["veredicto"]["estado"], "ok")

    def test_el_endpoint_devuelve_el_guardado_sin_llamar_a_la_ia(self):
        entrevista = self._completa(Redactor())
        prohibido = mock.Mock(side_effect=AssertionError("No debe llamar a la IA"))

        with mock.patch("apps.entrevistas.veredicto.get_redactor_de_veredicto", prohibido):
            respuesta = self.client.post(f"/api/entrevistas/{entrevista.pk}/veredicto/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data, entrevista.veredicto_ia)
        prohibido.assert_not_called()

    def test_el_endpoint_reintenta_uno_no_disponible(self):
        entrevista = self._completa(Redactor(fallar=True))
        redactor = Redactor()

        with mock.patch("apps.entrevistas.veredicto.get_redactor_de_veredicto", return_value=redactor):
            respuesta = self.client.post(f"/api/entrevistas/{entrevista.pk}/veredicto/")

        self.assertEqual(respuesta.data["estado"], "ok")
        self.assertEqual(redactor.veredictos, 1)

    def test_en_progreso_es_409(self):
        entrevista = self._iniciar(Redactor())

        respuesta = self.client.post(f"/api/entrevistas/{entrevista.pk}/veredicto/")

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)

    def test_una_abandonada_es_409_y_no_llama_a_la_ia(self):
        """Solo una finalizada tiene nota, y el veredicto la resume."""
        proveedor = Redactor()
        entrevista = self._iniciar(proveedor)
        servicio.responder(entrevista, "Una", proveedor=proveedor)
        servicio.abandonar(entrevista)
        prohibido = mock.Mock(side_effect=AssertionError("No debe llamar a la IA"))

        with mock.patch("apps.entrevistas.veredicto.get_redactor_de_veredicto", prohibido):
            respuesta = self.client.post(f"/api/entrevistas/{entrevista.pk}/veredicto/")

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)
        prohibido.assert_not_called()

    def test_de_otro_usuario_es_404(self):
        ajena = servicio.iniciar(crear_usuario(email="otra@ejemplo.com"), puesto_de("backend"), nivel_de("junior"), proveedor=Redactor())

        respuesta = self.client.post(f"/api/entrevistas/{ajena.pk}/veredicto/")

        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)

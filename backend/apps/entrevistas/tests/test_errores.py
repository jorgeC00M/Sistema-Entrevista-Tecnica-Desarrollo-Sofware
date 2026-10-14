"""Verifica que un fallo del proveedor de IA produzca el código HTTP correcto,
según la tabla de traducción de errores del plan: transitorio -> 503,
permanente -> 502, respuesta inválida -> 502.

Se reemplaza `get_proveedor` (el punto de entrada al proveedor real dentro del
orquestador) por uno que falla de la manera exacta que se quiere probar, sin
red ni cuota.
"""

from unittest import mock

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from integrations.ia.base import ProveedorIA
from integrations.ia.exceptions import ErrorPermanente, ErrorTransitorio, RespuestaIAInvalida
from integrations.ia.fake import FakeProveedorIA

Usuario = get_user_model()


class ProveedorQueFalla(ProveedorIA):
    nombre = "falla"
    modelo = "falla-1"

    def __init__(self, excepcion: Exception):
        self._excepcion = excepcion

    def generar_preguntas_iniciales(self, *args, **kwargs):
        raise self._excepcion

    def generar_pregunta(self, *args, **kwargs):
        raise self._excepcion

    def evaluar_respuesta(self, *args, **kwargs):
        raise self._excepcion


class ErroresAlIniciarTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    @mock.patch("apps.entrevistas.services.get_proveedor")
    def test_error_transitorio_responde_503(self, mock_get_proveedor):
        mock_get_proveedor.return_value = ProveedorQueFalla(ErrorTransitorio("simulado"))

        respuesta = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})

        self.assertEqual(respuesta.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @mock.patch("apps.entrevistas.services.get_proveedor")
    def test_error_permanente_responde_502(self, mock_get_proveedor):
        mock_get_proveedor.return_value = ProveedorQueFalla(ErrorPermanente("simulado"))

        respuesta = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})

        self.assertEqual(respuesta.status_code, status.HTTP_502_BAD_GATEWAY)

    @mock.patch("apps.entrevistas.services.get_proveedor")
    def test_respuesta_invalida_responde_502(self, mock_get_proveedor):
        mock_get_proveedor.return_value = ProveedorQueFalla(RespuestaIAInvalida("simulado"))

        respuesta = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})

        self.assertEqual(respuesta.status_code, status.HTTP_502_BAD_GATEWAY)

    @mock.patch("apps.entrevistas.services.get_proveedor")
    def test_fallo_al_iniciar_no_deja_entrevista_huerfana(self, mock_get_proveedor):
        from apps.entrevistas.models import Entrevista

        mock_get_proveedor.return_value = ProveedorQueFalla(ErrorTransitorio("simulado"))
        self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})

        self.assertEqual(Entrevista.objects.count(), 0)


class ErroresAlResponderTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

        with mock.patch(
            "apps.entrevistas.services.get_proveedor", return_value=FakeProveedorIA()
        ):
            inicio = self.client.post(
                "/api/entrevistas/", {"puesto": "backend", "nivel": "basico"}
            )
        self.entrevista_id = inicio.data["entrevista"]["id"]

    @mock.patch("apps.entrevistas.services.get_proveedor")
    def test_error_transitorio_al_evaluar_responde_503(self, mock_get_proveedor):
        mock_get_proveedor.return_value = ProveedorQueFalla(ErrorTransitorio("simulado"))

        respuesta = self.client.post(
            f"/api/entrevistas/{self.entrevista_id}/responder/", {"respuesta": "Mi respuesta"}
        )

        self.assertEqual(respuesta.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)


class CadenaDeRespaldoTest(APITestCase):
    """Con `IA_PROVEEDOR=gemini,deepseek`, una cuota agotada no corta la entrevista
    y la evaluación registra el proveedor que de verdad respondió."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)
        with mock.patch("apps.entrevistas.services.get_proveedor", return_value=FakeProveedorIA()):
            inicio = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})
        self.entrevista_id = inicio.data["entrevista"]["id"]

    def test_responde_el_respaldo_y_queda_registrado(self):
        from apps.evaluaciones.models import Evaluacion
        from integrations.ia.cadena import ProveedorEnCadena

        cadena = ProveedorEnCadena([ProveedorQueFalla(ErrorTransitorio("429")), FakeProveedorIA()])
        with mock.patch("apps.entrevistas.services.get_proveedor", return_value=cadena):
            respuesta = self.client.post(
                f"/api/entrevistas/{self.entrevista_id}/responder/", {"respuesta": "Mi respuesta"}
            )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        evaluacion = Evaluacion.objects.get(intercambio__entrevista_id=self.entrevista_id)
        self.assertEqual((evaluacion.proveedor_ia, evaluacion.modelo_ia), ("fake", "fake-1"))

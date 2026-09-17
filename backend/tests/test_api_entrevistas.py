from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from entrevistas.services.ia.schemas import PREGUNTAS_POR_ENTREVISTA

Usuario = get_user_model()


class FlujoDeEntrevistaPorHttpTest(APITestCase):
    """Recorre una entrevista completa exclusivamente por HTTP, autenticado,
    sin tocar el ORM ni el shell de Django — tal como lo haría el frontend.
    """

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )
        self.client.force_authenticate(self.usuario)

    def test_entrevista_completa_de_principio_a_fin(self):
        inicio = self.client.post(
            "/api/entrevistas/", {"area": "programacion", "nivel": "basico"}
        )
        self.assertEqual(inicio.status_code, status.HTTP_201_CREATED)
        entrevista_id = inicio.data["entrevista"]["id"]
        self.assertEqual(inicio.data["pregunta"]["numero"], 1)
        self.assertEqual(inicio.data["entrevista"]["estado"], "en_progreso")

        for numero_esperado in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
            respuesta = self.client.post(
                f"/api/entrevistas/{entrevista_id}/responder/",
                {"respuesta": f"Mi respuesta a la pregunta {numero_esperado}"},
            )
            self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
            self.assertIn("puntuacion", respuesta.data["evaluacion"])

            if numero_esperado < PREGUNTAS_POR_ENTREVISTA:
                self.assertIsNotNone(respuesta.data["siguiente_pregunta"])
                self.assertEqual(respuesta.data["siguiente_pregunta"]["numero"], numero_esperado + 1)
            else:
                self.assertIsNone(respuesta.data["siguiente_pregunta"])
                self.assertEqual(respuesta.data["entrevista"]["estado"], "finalizada")

        historial = self.client.get("/api/entrevistas/")
        self.assertEqual(historial.status_code, status.HTTP_200_OK)
        self.assertEqual(len(historial.data), 1)

        resultados = self.client.get(f"/api/entrevistas/{entrevista_id}/resultados/")
        self.assertEqual(resultados.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resultados.data["intercambios"]), PREGUNTAS_POR_ENTREVISTA)
        for intercambio in resultados.data["intercambios"]:
            self.assertIsNotNone(intercambio["evaluacion"])

    def test_detalle_muestra_la_pregunta_pendiente(self):
        inicio = self.client.post("/api/entrevistas/", {"area": "desarrollo_web", "nivel": "intermedio"})
        entrevista_id = inicio.data["entrevista"]["id"]

        detalle = self.client.get(f"/api/entrevistas/{entrevista_id}/")

        self.assertEqual(detalle.status_code, status.HTTP_200_OK)
        self.assertEqual(detalle.data["pregunta_pendiente"]["numero"], 1)

    def test_responder_una_entrevista_finalizada_devuelve_conflicto(self):
        inicio = self.client.post("/api/entrevistas/", {"area": "programacion", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]

        for numero in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
            self.client.post(
                f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": f"Respuesta {numero}"}
            )

        extra = self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Una respuesta de más"}
        )
        self.assertEqual(extra.status_code, status.HTTP_409_CONFLICT)

    def test_area_invalida_es_rechazada(self):
        respuesta = self.client.post(
            "/api/entrevistas/", {"area": "cocina", "nivel": "basico"}
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_respuesta_vacia_es_rechazada(self):
        inicio = self.client.post("/api/entrevistas/", {"area": "programacion", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]

        respuesta = self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": ""}
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_endpoints_sin_autenticar_son_rechazados(self):
        self.client.force_authenticate(None)
        respuesta = self.client.get("/api/entrevistas/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)


if __name__ == "__main__":
    import unittest

    unittest.main()

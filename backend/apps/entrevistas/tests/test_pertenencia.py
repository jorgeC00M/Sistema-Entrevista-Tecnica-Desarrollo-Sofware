"""Un usuario autenticado no debe poder leer ni modificar la entrevista de
otro, aunque conozca o adivine su id. Es la vulnerabilidad más común en APIs
REST y la razón por la que toda consulta filtra por `usuario=request.user`.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

Usuario = get_user_model()


class PertenenciaTest(APITestCase):
    def setUp(self):
        self.usuario_a = Usuario.objects.create_user(
            email="a@example.com", password="clave-segura-123", nombre_completo="Usuario A"
        )
        self.usuario_b = Usuario.objects.create_user(
            email="b@example.com", password="clave-segura-123", nombre_completo="Usuario B"
        )

        self.client.force_authenticate(self.usuario_a)
        inicio = self.client.post("/api/entrevistas/", {"area": "programacion", "nivel": "basico"})
        self.entrevista_de_a = inicio.data["entrevista"]["id"]

    def test_detalle_de_entrevista_ajena_es_404(self):
        self.client.force_authenticate(self.usuario_b)
        respuesta = self.client.get(f"/api/entrevistas/{self.entrevista_de_a}/")
        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)

    def test_responder_entrevista_ajena_es_404(self):
        self.client.force_authenticate(self.usuario_b)
        respuesta = self.client.post(
            f"/api/entrevistas/{self.entrevista_de_a}/responder/", {"respuesta": "Intento ajeno"}
        )
        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)

    def test_resultados_de_entrevista_ajena_es_404(self):
        self.client.force_authenticate(self.usuario_b)
        respuesta = self.client.get(f"/api/entrevistas/{self.entrevista_de_a}/resultados/")
        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)

    def test_historial_no_incluye_entrevistas_ajenas(self):
        self.client.force_authenticate(self.usuario_b)
        self.client.post("/api/entrevistas/", {"area": "bases_de_datos", "nivel": "basico"})

        respuesta = self.client.get("/api/entrevistas/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        ids_visibles = [e["id"] for e in respuesta.data]
        self.assertNotIn(self.entrevista_de_a, ids_visibles)


if __name__ == "__main__":
    import unittest

    unittest.main()

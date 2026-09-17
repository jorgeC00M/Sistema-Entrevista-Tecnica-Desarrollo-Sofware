"""Pruebas del login con Google.

No se llama a la red de Google en ningún momento: se sustituye
`verify_oauth2_token` para simular lo que Google devolvería, y se verifica
que la vista reaccione correctamente a cada caso — incluida la verificación
real de que un token inválido o sin email verificado se rechaza.
"""

from unittest import mock

from django.contrib.auth import get_user_model
from django.test import override_settings
from google.auth import exceptions as google_exceptions
from rest_framework import status
from rest_framework.test import APITestCase

Usuario = get_user_model()


def _payload(email="egresado@example.com", nombre="Egresado de Google", verificado=True):
    return {"email": email, "name": nombre, "email_verified": verificado, "sub": "1234567890"}


@override_settings(GOOGLE_OAUTH_CLIENT_ID="client-id-de-prueba")
class GoogleLoginTest(APITestCase):
    @mock.patch("apps.usuarios.views.google_id_token.verify_oauth2_token")
    def test_token_valido_crea_usuario_nuevo(self, mock_verify):
        mock_verify.return_value = _payload()

        respuesta = self.client.post("/api/auth/google", {"id_token": "token-simulado"})

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)

        usuario = Usuario.objects.get(email="egresado@example.com")
        self.assertEqual(usuario.nombre_completo, "Egresado de Google")
        self.assertFalse(usuario.has_usable_password())

    @mock.patch("apps.usuarios.views.google_id_token.verify_oauth2_token")
    def test_token_valido_con_usuario_existente_no_duplica_cuenta(self, mock_verify):
        Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Ya Existía"
        )
        mock_verify.return_value = _payload()

        respuesta = self.client.post("/api/auth/google", {"id_token": "token-simulado"})

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(Usuario.objects.filter(email="egresado@example.com").count(), 1)
        # No se sobreescribe el nombre de una cuenta que ya existía.
        usuario = Usuario.objects.get(email="egresado@example.com")
        self.assertEqual(usuario.nombre_completo, "Ya Existía")

    @mock.patch("apps.usuarios.views.google_id_token.verify_oauth2_token")
    def test_email_no_verificado_es_rechazado(self, mock_verify):
        mock_verify.return_value = _payload(verificado=False)

        respuesta = self.client.post("/api/auth/google", {"id_token": "token-simulado"})

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Usuario.objects.filter(email="egresado@example.com").exists())

    @mock.patch("apps.usuarios.views.google_id_token.verify_oauth2_token")
    def test_token_invalido_es_rechazado(self, mock_verify):
        mock_verify.side_effect = ValueError("Token signature invalid")

        respuesta = self.client.post("/api/auth/google", {"id_token": "token-falsificado"})

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    @mock.patch("apps.usuarios.views.google_id_token.verify_oauth2_token")
    def test_fallo_de_red_hacia_google_responde_503(self, mock_verify):
        mock_verify.side_effect = google_exceptions.TransportError("no se pudo contactar a Google")

        respuesta = self.client.post("/api/auth/google", {"id_token": "token-simulado"})

        self.assertEqual(respuesta.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def test_id_token_ausente_es_rechazado(self):
        respuesta = self.client.post("/api/auth/google", {})
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)


@override_settings(GOOGLE_OAUTH_CLIENT_ID="")
class GoogleLoginSinConfigurarTest(APITestCase):
    def test_sin_client_id_configurado_responde_503(self):
        respuesta = self.client.post("/api/auth/google", {"id_token": "cualquier-cosa"})
        self.assertEqual(respuesta.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)


if __name__ == "__main__":
    import unittest

    unittest.main()

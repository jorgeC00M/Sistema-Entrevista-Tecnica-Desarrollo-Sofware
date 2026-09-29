from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

Usuario = get_user_model()


class RegistroTest(APITestCase):
    def test_registro_valido_devuelve_tokens(self):
        respuesta = self.client.post(
            "/api/auth/registro",
            {
                "email": "nuevo@example.com",
                "password": "una-contrasena-robusta-123",
                "nombre_completo": "Egresado Nuevo",
            },
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)
        self.assertTrue(Usuario.objects.filter(email="nuevo@example.com").exists())

    def test_registro_con_email_duplicado_falla(self):
        Usuario.objects.create_user(
            email="repetido@example.com", password="clave-segura-123", nombre_completo="Uno"
        )

        respuesta = self.client.post(
            "/api/auth/registro",
            {
                "email": "repetido@example.com",
                "password": "otra-contrasena-robusta-123",
                "nombre_completo": "Otro",
            },
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", respuesta.data)

    def test_registro_con_contrasena_debil_falla(self):
        respuesta = self.client.post(
            "/api/auth/registro",
            {"email": "debil@example.com", "password": "1234", "nombre_completo": "Alguien"},
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", respuesta.data)

    def test_contrasena_queda_hasheada(self):
        self.client.post(
            "/api/auth/registro",
            {
                "email": "hash@example.com",
                "password": "una-contrasena-robusta-123",
                "nombre_completo": "Egresado",
            },
        )
        usuario = Usuario.objects.get(email="hash@example.com")
        self.assertNotEqual(usuario.password, "una-contrasena-robusta-123")
        self.assertTrue(usuario.check_password("una-contrasena-robusta-123"))


class ModeloUsuarioTest(TestCase):
    """Invariantes del modelo, independientes de la API.

    Vivían en `apps/entrevistas/tests/test_modelos.py`, que es la app
    equivocada; el test de hasheo que había allí se omite porque
    `test_contrasena_queda_hasheada` de arriba ya lo cubre.
    """

    def test_usuario_se_autentica_por_email(self):
        self.assertEqual(Usuario.USERNAME_FIELD, "email")

    def test_email_duplicado_no_permitido(self):
        Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Uno"
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Usuario.objects.create_user(
                    email="egresado@example.com", password="otra-clave-123", nombre_completo="Otro"
                )


class LoginTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )

    def test_login_con_credenciales_correctas(self):
        respuesta = self.client.post(
            "/api/auth/token", {"email": "egresado@example.com", "password": "clave-segura-123"}
        )

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)

    def test_login_con_contrasena_incorrecta(self):
        respuesta = self.client.post(
            "/api/auth/token", {"email": "egresado@example.com", "password": "incorrecta"}
        )
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refrescar_access_token(self):
        login = self.client.post(
            "/api/auth/token", {"email": "egresado@example.com", "password": "clave-segura-123"}
        )
        respuesta = self.client.post("/api/auth/token/refresh", {"refresh": login.data["refresh"]})

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)


class PerfilTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )

    def test_perfil_sin_token_es_rechazado(self):
        respuesta = self.client.get("/api/auth/perfil")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_perfil_autenticado_devuelve_los_datos_propios(self):
        self.client.force_authenticate(self.usuario)
        respuesta = self.client.get("/api/auth/perfil")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["email"], "egresado@example.com")
        self.assertEqual(respuesta.data["nombre_completo"], "Egresado de Prueba")
        self.assertNotIn("password", respuesta.data)


if __name__ == "__main__":
    import unittest

    unittest.main()

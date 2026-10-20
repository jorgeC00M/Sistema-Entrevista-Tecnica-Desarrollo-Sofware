"""Cambio de contraseña desde el perfil.

Se usan tokens reales (login por la API) y no `force_authenticate`: lo que se
prueba es justamente qué tokens siguen sirviendo después del cambio.
"""

from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework import status
from rest_framework.test import APITestCase

Usuario = get_user_model()

CORREO = "egresado@example.com"
ACTUAL = "clave-actual-robusta-123"
NUEVA = "otra-clave-robusta-456"


class CambiarContrasenaTest(APITestCase):
    def setUp(self):
        cache.clear()
        self.usuario = Usuario.objects.create_user(
            email=CORREO, password=ACTUAL, nombre_completo="Egresado"
        )
        self.tokens = self._login(ACTUAL).data

    def tearDown(self):
        cache.clear()

    def _login(self, password):
        return self.client.post("/api/auth/token", {"email": CORREO, "password": password})

    def _cambiar(self, actual=ACTUAL, nueva=NUEVA, access=None):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access or self.tokens['access']}")
        respuesta = self.client.post("/api/auth/contrasena", {"actual": actual, "nueva": nueva})
        self.client.credentials()
        return respuesta

    def test_cambio_correcto_devuelve_tokens_y_cambia_el_login(self):
        respuesta = self._cambiar()

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertIn("access", respuesta.data)
        self.assertIn("refresh", respuesta.data)
        self.assertEqual(self._login(NUEVA).status_code, status.HTTP_200_OK)
        self.assertEqual(self._login(ACTUAL).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_contrasena_actual_incorrecta(self):
        respuesta = self._cambiar(actual="no-es-esta-123")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("actual", respuesta.data)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(ACTUAL))

    def test_nueva_debil_se_rechaza_con_el_validador(self):
        respuesta = self._cambiar(nueva="1234")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nueva", respuesta.data)
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password(ACTUAL))

    def test_nueva_igual_a_la_actual(self):
        respuesta = self._cambiar(nueva=ACTUAL)

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nueva", respuesta.data)

    def test_sin_token_es_rechazado(self):
        respuesta = self.client.post("/api/auth/contrasena", {"actual": ACTUAL, "nueva": NUEVA})

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cuenta_sin_contrasena_no_puede_cambiarla(self):
        self.usuario.set_unusable_password()
        self.usuario.save()

        respuesta = self._cambiar()

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.usuario.refresh_from_db()
        self.assertFalse(self.usuario.has_usable_password())

    def test_cierra_las_demas_sesiones_y_conserva_la_nueva(self):
        # Una segunda sesión, como la de otro dispositivo.
        otra_sesion = self._login(ACTUAL).data

        nuevos = self._cambiar().data

        for viejo in (self.tokens["refresh"], otra_sesion["refresh"]):
            respuesta = self.client.post("/api/auth/token/refresh", {"refresh": viejo})
            self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)
        respuesta = self.client.post("/api/auth/token/refresh", {"refresh": nuevos["refresh"]})
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)


class TieneContrasenaEnElPerfilTest(APITestCase):
    def _perfil(self, usuario):
        self.client.force_authenticate(user=usuario)
        return self.client.get("/api/auth/perfil").data

    def test_cuenta_con_contrasena(self):
        usuario = Usuario.objects.create_user(
            email="con@example.com", password=ACTUAL, nombre_completo="Con"
        )
        self.assertTrue(self._perfil(usuario)["tiene_contrasena"])

    def test_cuenta_de_google(self):
        usuario = Usuario.objects.create_user(email="google@example.com", nombre_completo="Google")
        usuario.set_unusable_password()
        usuario.save()
        self.assertFalse(self._perfil(usuario)["tiene_contrasena"])

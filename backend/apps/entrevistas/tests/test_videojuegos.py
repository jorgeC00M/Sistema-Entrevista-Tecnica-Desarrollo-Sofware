"""El puesto Desarrollador de Videojuegos se practica como cualquier otro."""

from unittest import mock

from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas.models import Entrevista
from integrations.ia.fake import FakeProveedorIA
from tests.conftest import crear_usuario


class EntrevistaDeVideojuegosTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.proveedor = mock.Mock(wraps=FakeProveedorIA())
        self.enterContext(mock.patch("apps.entrevistas.services.get_proveedor", return_value=self.proveedor))

    def _iniciar(self, **cuerpo):
        return self.client.post("/api/entrevistas/", cuerpo, format="json")

    def test_se_inicia_con_una_tecnologia_del_puesto(self):
        respuesta = self._iniciar(puesto="videojuegos", tecnologia="videojuegos_godot", nivel="junior")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        entrevista = Entrevista.objects.get()
        self.assertEqual(entrevista.tecnologia_nombre, "Godot (GDScript)")
        # Las dos de calentamiento ya existen, cada una con el área del plan.
        self.assertEqual(
            list(entrevista.intercambios.order_by("numero").values_list("area__codigo", flat=True)),
            ["programacion", "desarrollo_videojuegos"],
        )

    def test_rechaza_una_tecnologia_de_otro_puesto_sin_llamar_a_la_ia(self):
        respuesta = self._iniciar(puesto="videojuegos", tecnologia="backend_django", nivel="junior")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.proveedor.generar_preguntas_iniciales.assert_not_called()

    def test_no_admite_segunda_tecnologia(self):
        respuesta = self._iniciar(
            puesto="videojuegos",
            tecnologia="videojuegos_unity",
            segunda_tecnologia="videojuegos_godot",
            nivel="senior",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("segunda_tecnologia", respuesta.data)

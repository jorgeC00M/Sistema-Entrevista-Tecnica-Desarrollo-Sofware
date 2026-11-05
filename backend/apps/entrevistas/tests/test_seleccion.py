"""Iniciar con puesto + tecnología del puesto + nivel, y "Repetir configuración".

Full Stack tiene tecnologías por capa: se inicia con una de frontend
(`tecnologia`) y una de backend (`segunda_tecnologia`).
"""

from datetime import timedelta
from unittest import mock

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalogos.models import Tecnologia
from apps.entrevistas.models import Entrevista
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts import entrevistador
from tests.conftest import crear_entrevista, crear_usuario


class IniciarConTecnologiaDelPuestoTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.proveedor = mock.Mock(wraps=FakeProveedorIA())
        self.enterContext(mock.patch("apps.entrevistas.services.get_proveedor", return_value=self.proveedor))

    def _iniciar(self, **cuerpo):
        return self.client.post("/api/entrevistas/", cuerpo, format="json")

    def test_combinacion_valida(self):
        respuesta = self._iniciar(puesto="frontend", tecnologia="frontend_react", nivel="semi_senior")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        entrevista = Entrevista.objects.get()
        self.assertEqual(
            (entrevista.puesto.codigo, entrevista.tecnologia.codigo, entrevista.nivel.codigo),
            ("frontend", "frontend_react", "semi_senior"),
        )
        # La tecnología llega por su nombre a la pregunta (el falso la escribe).
        self.assertIn("[React]", respuesta.data["pregunta"]["texto"])

    def test_tecnologia_de_otro_puesto(self):
        respuesta = self._iniciar(puesto="frontend", tecnologia="movil_flutter", nivel="semi_senior")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("tecnologia", respuesta.data)
        self.assertFalse(Entrevista.objects.exists())
        self.proveedor.generar_preguntas_iniciales.assert_not_called()

    def test_sin_tecnologia(self):
        respuesta = self._iniciar(puesto="frontend", nivel="semi_senior")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Entrevista.objects.exists())

    def test_tecnologia_inactiva(self):
        Tecnologia.objects.filter(codigo="frontend_vue").update(activo=False)

        respuesta = self._iniciar(puesto="frontend", tecnologia="frontend_vue", nivel="semi_senior")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_una_tecnologia_retirada_no_se_ofrece(self):
        """"Python" de Backend se dividió en Django, FastAPI y Flask: sigue en la
        base por las entrevistas que la usaron, pero ya no se puede elegir."""
        respuesta = self._iniciar(puesto="backend", tecnologia="backend_python", nivel="junior")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.proveedor.generar_preguntas_iniciales.assert_not_called()

    def test_una_entrevista_con_tecnologia_retirada_conserva_su_nombre(self):
        entrevista = crear_entrevista(self.usuario, puesto="backend", tecnologia="backend_python")

        self.assertEqual(entrevista.tecnologia_nombre, "Python")

    def test_el_mismo_nombre_en_otro_puesto_no_sirve(self):
        """C# .NET de Escritorio no es la de Backend."""
        respuesta = self._iniciar(puesto="backend", tecnologia="escritorio_csharp", nivel="junior")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_un_puesto_sin_capas_no_admite_segunda_tecnologia(self):
        respuesta = self._iniciar(
            puesto="backend", tecnologia="backend_django", segunda_tecnologia="backend_spring", nivel="junior"
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("segunda_tecnologia", respuesta.data)
        self.proveedor.generar_preguntas_iniciales.assert_not_called()


class IniciarFullStackPorCapasTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.proveedor = mock.Mock(wraps=FakeProveedorIA())
        self.enterContext(mock.patch("apps.entrevistas.services.get_proveedor", return_value=self.proveedor))

    def _iniciar(self, **tecnologias):
        cuerpo = {"puesto": "full_stack", "nivel": "junior", **tecnologias}
        return self.client.post("/api/entrevistas/", cuerpo, format="json")

    def _rechazada(self, respuesta, campo):
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(campo, respuesta.data)
        self.assertFalse(Entrevista.objects.exists())
        self.proveedor.generar_preguntas_iniciales.assert_not_called()

    def test_frontend_y_backend(self):
        respuesta = self._iniciar(tecnologia="full_stack_react", segunda_tecnologia="full_stack_express")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(respuesta.data["entrevista"]["tecnologia_display"], "React + Express")
        self.assertEqual(respuesta.data["entrevista"]["segunda_tecnologia"], "full_stack_express")

    def test_el_entrevistador_recibe_el_nombre_compuesto(self):
        """La capa de IA no cambia: recibe el mismo texto que con las
        combinaciones fijas."""
        self._iniciar(tecnologia="full_stack_vue", segunda_tecnologia="full_stack_laravel")

        contexto, areas = self.proveedor.generar_preguntas_iniciales.call_args.args
        self.assertEqual(contexto.tecnologia, "Vue + Laravel")
        self.assertIn("Vue + Laravel", entrevistador.sistema_de_calentamiento(contexto, areas, 5))

    def test_sin_backend(self):
        respuesta = self._iniciar(tecnologia="full_stack_react")

        self._rechazada(respuesta, "segunda_tecnologia")
        self.assertIn("backend", str(respuesta.data["segunda_tecnologia"]))

    def test_capas_invertidas(self):
        respuesta = self._iniciar(tecnologia="full_stack_express", segunda_tecnologia="full_stack_react")

        self._rechazada(respuesta, "tecnologia")

    def test_dos_de_la_misma_capa(self):
        respuesta = self._iniciar(tecnologia="full_stack_react", segunda_tecnologia="full_stack_vue")

        self._rechazada(respuesta, "segunda_tecnologia")

    def test_backend_de_otro_puesto(self):
        respuesta = self._iniciar(tecnologia="full_stack_react", segunda_tecnologia="backend_express")

        self._rechazada(respuesta, "segunda_tecnologia")

    def test_una_entrevista_antigua_conserva_su_combinacion(self):
        """Las iniciadas con una combinación fija siguen mostrándose igual."""
        entrevista = crear_entrevista(self.usuario, puesto="full_stack", tecnologia="full_stack_react_python")

        self.assertEqual(entrevista.tecnologia_nombre, "React + Python")

    def test_combinacion_fija_retirada(self):
        respuesta = self._iniciar(tecnologia="full_stack_react_node")

        self._rechazada(respuesta, "tecnologia")


class UltimaConfiguracionTest(APITestCase):
    URL = "/api/entrevistas/ultima-configuracion/"

    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)

    def test_usuario_nuevo_recibe_204(self):
        respuesta = self.client.get(self.URL)

        self.assertEqual(respuesta.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(respuesta.content)

    def test_devuelve_la_mas_reciente(self):
        vieja = crear_entrevista(self.usuario, puesto="qa", tecnologia="qa_cypress", estado=Entrevista.Estado.FINALIZADA)
        Entrevista.objects.filter(pk=vieja.pk).update(fecha_inicio=timezone.now() - timedelta(days=1))
        crear_entrevista(self.usuario, puesto="backend", tecnologia="backend_django", nivel="semi_senior")

        datos = self.client.get(self.URL).data

        self.assertEqual(
            datos,
            {
                "puesto": "backend",
                "puesto_nombre": "Desarrollador Backend",
                "nivel": "semi_senior",
                "nivel_nombre": "Semi-Senior",
                "tecnologia": "backend_django",
                "tecnologia_nombre": "Django",
                "segunda_tecnologia": None,
                "segunda_tecnologia_nombre": None,
            },
        )

    def test_full_stack_devuelve_las_dos_capas(self):
        crear_entrevista(
            self.usuario, puesto="full_stack", tecnologia="full_stack_react", segunda_tecnologia="full_stack_express"
        )

        datos = self.client.get(self.URL).data

        self.assertEqual(
            (datos["tecnologia_nombre"], datos["segunda_tecnologia_nombre"]), ("React", "Express")
        )

    def test_combinacion_fija_de_full_stack_sale_nula(self):
        """La combinación ya no se ofrece: repetir pide elegir frontend y backend."""
        crear_entrevista(self.usuario, puesto="full_stack", tecnologia="full_stack_react_node")

        datos = self.client.get(self.URL).data

        self.assertEqual(datos["puesto"], "full_stack")
        self.assertIsNone(datos["tecnologia"])
        self.assertIsNone(datos["segunda_tecnologia"])

    def test_solo_las_propias(self):
        crear_entrevista(self.usuario, puesto="qa", tecnologia="qa_cypress")
        otro = crear_usuario(email="otro@example.com")
        crear_entrevista(otro, puesto="movil", tecnologia="movil_flutter")

        self.assertEqual(self.client.get(self.URL).data["puesto"], "qa")

    def test_tecnologia_antigua_o_inactiva_sale_nula(self):
        """Las entrevistas anteriores al catálogo por puesto usaban tecnologías
        hoy inactivas: no se propone repetir algo que ya no se acepta."""
        crear_entrevista(self.usuario, puesto="backend", tecnologia="java_spring")

        datos = self.client.get(self.URL).data

        self.assertIsNone(datos["tecnologia"])
        self.assertIsNone(datos["tecnologia_nombre"])
        self.assertEqual(datos["puesto"], "backend")

    def test_requiere_sesion(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.URL).status_code, status.HTTP_401_UNAUTHORIZED)

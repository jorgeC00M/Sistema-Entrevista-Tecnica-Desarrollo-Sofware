from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalogos.models import Area, Nivel
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica
from integrations.ia.prompts.schemas import Nivel as NivelIA


class CatalogoSembradoTest(APITestCase):
    """La migración de datos debe dejar el catálogo listo, sin fixtures."""

    def test_migracion_siembra_las_cuatro_areas_del_alcance(self):
        self.assertEqual(Area.objects.count(), 4)

    def test_migracion_siembra_solo_los_dos_niveles_del_alcance(self):
        # El perfil excluye explícitamente el nivel avanzado.
        self.assertEqual(Nivel.objects.count(), 2)

    def test_codigos_coinciden_con_los_enums_de_la_capa_de_ia(self):
        """El puente entre la base de datos y el proveedor.

        `Entrevista.area_enum` hace `AreaTecnica(self.area.codigo)`. Si alguien
        da de alta un área con un código que el enum no conoce, la entrevista
        reventaría recién al generar la primera pregunta. Este test convierte
        esa desincronización en un fallo inmediato.
        """
        self.assertEqual(
            set(Area.objects.values_list("codigo", flat=True)),
            {a.value for a in AreaTecnica},
        )
        self.assertEqual(
            set(Nivel.objects.values_list("codigo", flat=True)),
            {n.value for n in NivelIA},
        )


class CatalogoAPITest(APITestCase):
    def setUp(self):
        self.usuario = get_user_model().objects.create_user(
            email="jorge@example.com", password="contrasena-segura-123", nombre_completo="Jorge"
        )
        self.client.force_authenticate(self.usuario)

    def test_requiere_autenticacion(self):
        self.client.force_authenticate(None)
        respuesta = self.client.get("/api/catalogos/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_devuelve_areas_niveles_y_total_de_preguntas(self):
        respuesta = self.client.get("/api/catalogos/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(respuesta.data["areas"]), 4)
        self.assertEqual(len(respuesta.data["niveles"]), 2)
        # El frontend lee de aquí cuántas preguntas tiene una entrevista en
        # lugar de hardcodear el número.
        self.assertEqual(respuesta.data["preguntas_por_entrevista"], PREGUNTAS_POR_ENTREVISTA)

    def test_respeta_el_orden_configurado(self):
        respuesta = self.client.get("/api/catalogos/")
        ordenes = [a["orden"] for a in respuesta.data["areas"]]
        self.assertEqual(ordenes, sorted(ordenes))

    def test_un_area_inactiva_no_se_ofrece(self):
        Area.objects.filter(codigo=AreaTecnica.DESARROLLO_WEB.value).update(activo=False)

        respuesta = self.client.get("/api/catalogos/")

        codigos = [a["codigo"] for a in respuesta.data["areas"]]
        self.assertNotIn(AreaTecnica.DESARROLLO_WEB.value, codigos)
        self.assertEqual(len(codigos), 3)

    def test_no_se_puede_iniciar_entrevista_en_area_inactiva(self):
        """Dar de baja un área la retira de verdad, no solo de la vista."""
        Area.objects.filter(codigo=AreaTecnica.DESARROLLO_WEB.value).update(activo=False)

        respuesta = self.client.post(
            "/api/entrevistas/",
            {"area": AreaTecnica.DESARROLLO_WEB.value, "nivel": NivelIA.BASICO.value},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

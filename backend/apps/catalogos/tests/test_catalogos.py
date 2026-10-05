from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalogos.models import Area, Nivel, Puesto, Tecnologia
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica
from integrations.ia.prompts.schemas import Nivel as NivelIA
from integrations.ia.prompts.schemas import Puesto as PuestoIA
from integrations.ia.prompts.schemas import Tecnologia as TecnologiaIA
from integrations.ia.prompts.schemas import areas_que_cubre


class CatalogoSembradoTest(APITestCase):
    """La migración de datos debe dejar el catálogo listo, sin fixtures."""

    def test_migracion_siembra_las_ocho_areas(self):
        """Las cuatro del alcance original más POO, APIs, control de versiones y
        pruebas. El alcance las enumera con "tales como", lista ejemplificativa,
        así que ampliarla no lo contradice."""
        self.assertEqual(Area.objects.count(), 8)

    def test_migracion_siembra_solo_los_dos_niveles_del_alcance(self):
        # El perfil excluye explícitamente el nivel avanzado.
        self.assertEqual(Nivel.objects.count(), 2)

    def test_migracion_siembra_los_puestos_y_tecnologias(self):
        self.assertEqual(Puesto.objects.count(), 3)
        self.assertEqual(Tecnologia.objects.count(), 3)

    def test_codigos_coinciden_con_los_enums_de_la_capa_de_ia(self):
        """El puente entre la base de datos y el proveedor.

        `Entrevista.puesto_enum` hace `Puesto(self.puesto.codigo)` y
        `Intercambio.area_enum` lo propio con el área. Si alguien da de alta una
        fila con un código que el enum no conoce, la entrevista reventaría recién
        al generar la primera pregunta. Este test convierte esa desincronización
        en un fallo inmediato.
        """
        for modelo, enum in (
            (Area, AreaTecnica),
            (Nivel, NivelIA),
            (Puesto, PuestoIA),
            (Tecnologia, TecnologiaIA),
        ):
            with self.subTest(modelo=modelo.__name__):
                self.assertEqual(
                    set(modelo.objects.values_list("codigo", flat=True)),
                    {miembro.value for miembro in enum},
                )

    def test_los_nombres_visibles_coinciden_con_las_etiquetas_de_la_capa_de_ia(self):
        """El nombre que ve el usuario y la etiqueta que recibe el modelo tienen
        que ser el mismo texto. Si divergen, la tarjeta del puesto promete un
        tema con un nombre y al proveedor se le pide otro — pasó con
        "Programación" vs "Fundamentos de Programación".
        """
        for modelo, enum in (
            (Area, AreaTecnica),
            (Nivel, NivelIA),
            (Puesto, PuestoIA),
            (Tecnologia, TecnologiaIA),
        ):
            for fila in modelo.objects.all():
                with self.subTest(modelo=modelo.__name__, codigo=fila.codigo):
                    self.assertEqual(fila.nombre, enum(fila.codigo).etiqueta)

    def test_las_areas_que_cubre_cada_puesto_existen_en_el_catalogo(self):
        """El plan vive en código y las áreas en la base: si divergen, la
        pantalla de selección prometería temas inexistentes y el orquestador
        fallaría al guardar el intercambio."""
        existentes = set(Area.objects.values_list("codigo", flat=True))
        for puesto in PuestoIA:
            with self.subTest(puesto=puesto.value):
                for area in areas_que_cubre(puesto):
                    self.assertIn(area.value, existentes)


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

    def test_devuelve_los_catalogos_y_el_total_de_preguntas(self):
        respuesta = self.client.get("/api/catalogos/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(len(respuesta.data["puestos"]), 3)
        self.assertEqual(len(respuesta.data["niveles"]), 2)
        self.assertEqual(len(respuesta.data["tecnologias"]), 3)
        self.assertEqual(len(respuesta.data["areas"]), 8)
        # El frontend lee de aquí cuántas preguntas tiene una entrevista en
        # lugar de hardcodear el número.
        self.assertEqual(respuesta.data["preguntas_por_entrevista"], PREGUNTAS_POR_ENTREVISTA)

    def test_cada_puesto_declara_las_areas_que_cubre(self):
        """La pantalla de selección las muestra en la tarjeta del puesto: el
        usuario ya no elige el área, pero tiene que poder verla antes de
        empezar."""
        respuesta = self.client.get("/api/catalogos/")

        for puesto in respuesta.data["puestos"]:
            with self.subTest(puesto=puesto["codigo"]):
                esperadas = [a.value for a in areas_que_cubre(PuestoIA(puesto["codigo"]))]
                self.assertEqual(list(puesto["areas"]), esperadas)

    def test_respeta_el_orden_configurado(self):
        respuesta = self.client.get("/api/catalogos/")
        for clave in ("puestos", "niveles", "tecnologias", "areas"):
            with self.subTest(catalogo=clave):
                ordenes = [fila["orden"] for fila in respuesta.data[clave]]
                self.assertEqual(ordenes, sorted(ordenes))

    def test_un_puesto_inactivo_no_se_ofrece(self):
        Puesto.objects.filter(codigo=PuestoIA.FRONTEND.value).update(activo=False)

        respuesta = self.client.get("/api/catalogos/")

        codigos = [p["codigo"] for p in respuesta.data["puestos"]]
        self.assertNotIn(PuestoIA.FRONTEND.value, codigos)
        self.assertEqual(len(codigos), 2)

    def test_no_se_puede_iniciar_entrevista_en_puesto_inactivo(self):
        """Dar de baja un puesto lo retira de verdad, no solo de la vista."""
        Puesto.objects.filter(codigo=PuestoIA.FRONTEND.value).update(activo=False)

        respuesta = self.client.post(
            "/api/entrevistas/",
            {"puesto": PuestoIA.FRONTEND.value, "nivel": NivelIA.BASICO.value},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

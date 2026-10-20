from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalogos.models import Area, Nivel, Puesto, Tecnologia
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica
from integrations.ia.prompts.schemas import Nivel as NivelIA
from integrations.ia.prompts.schemas import Puesto as PuestoIA
from integrations.ia.prompts.schemas import areas_que_cubre


class CatalogoSembradoTest(APITestCase):
    """La migración de datos debe dejar el catálogo listo, sin fixtures."""

    def test_migracion_siembra_las_diez_areas(self):
        """Las cuatro del alcance original, POO, APIs, control de versiones,
        pruebas, y desarrollo móvil y de escritorio para los puestos nuevos. El
        alcance las enumera con "tales como", lista ejemplificativa."""
        self.assertEqual(Area.objects.count(), 10)

    def test_migracion_siembra_los_tres_niveles(self):
        # Junior, Semi-Senior y Senior: inicial, intermedio y avanzado. Senior
        # amplía el alcance del perfil aprobado, que solo preveía básico e
        # intermedio; el documento de tesis debe recogerlo.
        self.assertEqual(
            list(Nivel.objects.order_by("orden").values_list("codigo", flat=True)),
            ["junior", "semi_senior", "senior"],
        )

    def test_migracion_siembra_los_puestos_y_tecnologias(self):
        self.assertEqual(Puesto.objects.filter(activo=True).count(), 6)
        self.assertEqual(Tecnologia.objects.filter(activo=True).count(), 53)
        # Las combinaciones fijas de Full Stack quedan inactivas, con su puesto:
        # entrevistas anteriores las referencian. Las reemplazan las de capa.
        combinaciones = Tecnologia.objects.filter(codigo__in=["full_stack_react_node", "full_stack_vue_php"])
        self.assertFalse(combinaciones.filter(activo=True).exists())
        self.assertEqual(set(combinaciones.values_list("puesto__codigo", flat=True)), {"full_stack"})
        # Las tres transversales anteriores siguen existiendo, inactivas y sin
        # puesto: hay entrevistas que las usaron.
        anteriores = Tecnologia.objects.filter(codigo__in=["python_django", "javascript_react", "java_spring"])
        self.assertEqual(anteriores.count(), 3)
        self.assertFalse(anteriores.filter(activo=True).exists())

    def test_cada_puesto_tiene_sus_propias_tecnologias(self):
        """.NET MAUI aparece en Móvil y en Escritorio como dos filas: el puesto
        cambia lo que se pregunta sobre ella."""
        maui = Tecnologia.objects.filter(nombre=".NET MAUI", activo=True)
        self.assertEqual(set(maui.values_list("puesto__codigo", flat=True)), {"movil", "escritorio"})

    def test_una_tecnologia_activa_sin_puesto_no_se_puede_guardar(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Tecnologia.objects.create(codigo="huerfana", nombre="Huérfana", activo=True)

    def test_cargar_catalogos_coincide_con_la_migracion(self):
        """La migración copia los datos de `datos.py`; si divergen, el comando
        cambiaría filas al ejecutarse sobre una base recién migrada."""

        def foto():
            return (
                list(Puesto.objects.order_by("codigo").values_list(
                    "codigo", "nombre", "descripcion", "icono", "orden", "activo"
                )),
                list(Tecnologia.objects.order_by("codigo").values_list(
                    "codigo", "nombre", "puesto__codigo", "capa", "grupo", "orden", "activo"
                )),
                list(Nivel.objects.order_by("codigo").values_list("codigo", "nombre", "orden")),
            )

        antes = foto()
        call_command("cargar_catalogos", stdout=StringIO())
        self.assertEqual(foto(), antes)
        call_command("cargar_catalogos", stdout=StringIO())
        self.assertEqual(foto(), antes)

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
        self.assertEqual(len(respuesta.data["puestos"]), 6)
        self.assertEqual(len(respuesta.data["niveles"]), 3)
        self.assertEqual(len(respuesta.data["tecnologias"]), 53)
        self.assertEqual(len(respuesta.data["areas"]), 10)
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
        self.assertEqual(len(codigos), 5)

    def test_no_se_puede_iniciar_entrevista_en_puesto_inactivo(self):
        """Dar de baja un puesto lo retira de verdad, no solo de la vista."""
        Puesto.objects.filter(codigo=PuestoIA.FRONTEND.value).update(activo=False)

        respuesta = self.client.post(
            "/api/entrevistas/",
            {"puesto": PuestoIA.FRONTEND.value, "nivel": NivelIA.JUNIOR.value, "tecnologia": "frontend_react"},
            format="json",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

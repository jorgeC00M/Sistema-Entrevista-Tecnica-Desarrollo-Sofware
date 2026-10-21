"""GET /api/catalogos/puestos/: lo que necesita la pantalla de nueva entrevista."""

from rest_framework import status
from rest_framework.test import APITestCase

from apps.catalogos.models import Tecnologia
from tests.conftest import crear_usuario

URL = "/api/catalogos/puestos/"


class PuestosTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)

    def test_requiere_sesion(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(URL).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_siete_puestos_con_sus_tecnologias_en_orden(self):
        datos = self.client.get(URL).data

        puestos = {p["codigo"]: p for p in datos["puestos"]}
        self.assertEqual(
            list(puestos), ["frontend", "backend", "full_stack", "movil", "escritorio", "qa", "videojuegos"]
        )
        self.assertEqual(
            [t["nombre"] for t in puestos["movil"]["tecnologias"]],
            ["Flutter", "React Native", "Kotlin (Jetpack Compose)", "Swift (SwiftUI)", ".NET MAUI", "Ionic"],
        )
        for puesto in datos["puestos"]:
            with self.subTest(puesto=puesto["codigo"]):
                self.assertTrue(puesto["icono"])
                self.assertTrue(puesto["areas"])

    def test_no_publica_datos_del_buscador_retirado(self):
        datos = self.client.get(URL).data

        self.assertNotIn("mas_practicados", datos)
        self.assertNotIn("palabras_clave", datos["puestos"][0])

    def test_full_stack_ofrece_frontend_y_backend_por_capa(self):
        full_stack = next(p for p in self.client.get(URL).data["puestos"] if p["codigo"] == "full_stack")

        capas = {}
        for tecnologia in full_stack["tecnologias"]:
            capas.setdefault(tecnologia["capa"], []).append(tecnologia["nombre"])
        self.assertEqual(
            capas,
            {
                "frontend": ["React", "Next.js", "Angular", "Vue", "Nuxt", "Svelte"],
                "backend": ["Django", "FastAPI", "Express", "NestJS", "Spring Boot", "Laravel", "ASP.NET Core"],
            },
        )

    def test_backend_ofrece_frameworks_agrupados_por_lenguaje(self):
        backend = next(p for p in self.client.get(URL).data["puestos"] if p["codigo"] == "backend")

        grupos = {}
        for tecnologia in backend["tecnologias"]:
            grupos.setdefault(tecnologia["grupo"], []).append(tecnologia["nombre"])
        self.assertEqual(
            grupos,
            {
                "Python": ["Django", "FastAPI", "Flask"],
                "Node.js": ["Express", "NestJS"],
                "Java": ["Spring Boot"],
                "PHP": ["Laravel"],
                "C#": ["ASP.NET Core"],
                "Go": ["Go"],
                "Ruby": ["Ruby on Rails"],
            },
        )

    def test_cuantas_tecnologias_ofrece_cada_puesto(self):
        puestos = self.client.get(URL).data["puestos"]

        self.assertEqual(
            {p["codigo"]: len(p["tecnologias"]) for p in puestos},
            {
                "frontend": 7,
                "backend": 10,
                "full_stack": 13,
                "movil": 6,
                "escritorio": 7,
                "qa": 10,
                "videojuegos": 17,
            },
        )

    def test_videojuegos_agrupa_por_tipo_de_motor(self):
        videojuegos = next(p for p in self.client.get(URL).data["puestos"] if p["codigo"] == "videojuegos")

        grupos: dict[str, list[str]] = {}
        for tecnologia in videojuegos["tecnologias"]:
            grupos.setdefault(tecnologia["grupo"], []).append(tecnologia["nombre"])
        self.assertEqual(
            grupos,
            {
                "Motores": [
                    "Unity (C#)",
                    "Unreal Engine (C++)",
                    "Unreal Engine (Blueprints)",
                    "Godot (GDScript)",
                    "Godot (C#)",
                ],
                "Motores 2D y plataformas": [
                    "GameMaker (GML)",
                    "Roblox Studio (Luau)",
                    "Defold (Lua)",
                    "Cocos Creator (TypeScript)",
                ],
                "Web": ["Phaser (JavaScript)", "Three.js", "Babylon.js"],
                "Frameworks de código": [
                    "MonoGame (C#)",
                    "Pygame (Python)",
                    "LÖVE (Lua)",
                    "Bevy (Rust)",
                    "SDL / SFML (C++)",
                ],
            },
        )
        self.assertEqual(list(grupos), ["Motores", "Motores 2D y plataformas", "Web", "Frameworks de código"])
        self.assertEqual(
            videojuegos["areas"], ["programacion", "desarrollo_videojuegos", "estructuras_de_datos"]
        )

    def test_frontend_no_agrupa(self):
        frontend = next(p for p in self.client.get(URL).data["puestos"] if p["codigo"] == "frontend")

        self.assertEqual({t["grupo"] for t in frontend["tecnologias"]}, {""})

    def test_los_demas_puestos_no_tienen_capas(self):
        for puesto in self.client.get(URL).data["puestos"]:
            if puesto["codigo"] == "full_stack":
                continue
            with self.subTest(puesto=puesto["codigo"]):
                self.assertEqual({t["capa"] for t in puesto["tecnologias"]}, {""})

    def test_no_ofrece_tecnologias_inactivas(self):
        Tecnologia.objects.filter(codigo="frontend_vue").update(activo=False)

        frontend = next(p for p in self.client.get(URL).data["puestos"] if p["codigo"] == "frontend")

        self.assertNotIn("frontend_vue", [t["codigo"] for t in frontend["tecnologias"]])

    def test_consultas_acotadas(self):
        """Puestos y tecnologías en dos consultas, más niveles y áreas: no
        crece con el número de puestos."""
        with self.assertNumQueries(4):
            self.client.get(URL)

    def test_trae_niveles_areas_y_duracion(self):
        datos = self.client.get(URL).data

        self.assertEqual([n["codigo"] for n in datos["niveles"]], ["junior", "semi_senior", "senior"])
        self.assertEqual(len(datos["areas"]), 11)
        self.assertEqual(datos["preguntas_por_entrevista"], 5)

    def test_se_cachea_en_el_cliente(self):
        self.assertEqual(self.client.get(URL)["Cache-Control"], "private, max-age=300")


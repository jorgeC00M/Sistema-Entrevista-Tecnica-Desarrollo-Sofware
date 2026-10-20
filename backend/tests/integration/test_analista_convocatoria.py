"""El análisis de una convocatoria: lo que la IA devuelva se ancla al catálogo y al aviso."""

import unittest

from integrations.ia.exceptions import RespuestaIAInvalida
from integrations.ia.prompts.analista_convocatoria import (
    MAXIMO_REQUISITOS,
    SIN_PUESTO,
    EntradaDeConvocatoria,
    OpcionDeNivel,
    OpcionDePuesto,
    OpcionDeTecnologia,
    esquema,
    parsear_perfil,
    sistema,
    usuario,
)

AVISO = (
    "Empresa de software busca Desarrollador Backend Junior. Requisitos: experiencia con "
    "Python y Django, diseño de APIs REST, PostgreSQL y Git. Deseable: Docker y AWS. "
    "Enviar CV a [CORREO]."
)

ENTRADA = EntradaDeConvocatoria(
    texto=AVISO,
    terminos=("Python", "Django", "REST", "PostgreSQL", "Git", "Docker", "AWS"),
    anos_requeridos=None,
    cargo="Desarrollador Backend",
    puestos=(
        OpcionDePuesto("frontend", "Desarrollador Frontend", (OpcionDeTecnologia("frontend_react", "React"),)),
        OpcionDePuesto(
            "backend",
            "Desarrollador Backend",
            (OpcionDeTecnologia("backend_python", "Python"), OpcionDeTecnologia("backend_java", "Java")),
        ),
        OpcionDePuesto("movil", "Desarrollador Móvil", (OpcionDeTecnologia("movil_flutter", "Flutter"),)),
        OpcionDePuesto(
            "full_stack",
            "Desarrollador Full Stack",
            (
                OpcionDeTecnologia("full_stack_react", "React", "frontend"),
                OpcionDeTecnologia("full_stack_vue", "Vue", "frontend"),
                OpcionDeTecnologia("full_stack_node", "Node.js", "backend"),
            ),
        ),
    ),
    niveles=(
        OpcionDeNivel("junior", "Junior", "Inicial"),
        OpcionDeNivel("semi_senior", "Semi-Senior", "Intermedio"),
        OpcionDeNivel("senior", "Senior", "Avanzado"),
    ),
)


def _respuesta(**cambios):
    datos = {
        "puesto": "backend",
        "tecnologias": ["backend_python"],
        "nivel": "junior",
        "requisitos": ["APIs REST", "PostgreSQL", "Git"],
        "fuera_de_alcance": ["AWS"],
    }
    datos.update(cambios)
    return datos


class ParsearPerfilTest(unittest.TestCase):
    def test_perfil_valido(self):
        perfil = parsear_perfil(_respuesta(), ENTRADA)

        self.assertTrue(perfil.identificado)
        self.assertEqual((perfil.puesto, perfil.tecnologias, perfil.nivel), ("backend", ("backend_python",), "junior"))
        self.assertEqual(perfil.requisitos, ("APIs REST", "PostgreSQL", "Git"))
        self.assertEqual(perfil.fuera_de_alcance, ("AWS",))
        self.assertFalse(perfil.nivel_supuesto)

    def test_sin_puesto_no_inventa_perfil(self):
        for puesto in (SIN_PUESTO, "contador", ""):
            with self.subTest(puesto=puesto):
                perfil = parsear_perfil(_respuesta(puesto=puesto), ENTRADA)
                self.assertFalse(perfil.identificado)
                self.assertIsNone(perfil.puesto)

    def test_tecnologia_de_otro_puesto_se_descarta(self):
        perfil = parsear_perfil(_respuesta(puesto="frontend", tecnologias=["movil_flutter"]), ENTRADA)

        self.assertEqual(perfil.puesto, "frontend")
        self.assertEqual(perfil.tecnologias, ())

    def test_sin_capas_queda_una_sola(self):
        perfil = parsear_perfil(_respuesta(tecnologias=["backend_java", "backend_python"]), ENTRADA)

        self.assertEqual(perfil.tecnologias, ("backend_java",))

    def test_full_stack_una_por_capa(self):
        perfil = parsear_perfil(
            _respuesta(puesto="full_stack", tecnologias=["full_stack_react", "full_stack_node"]), ENTRADA
        )

        self.assertEqual(perfil.tecnologias, ("full_stack_react", "full_stack_node"))

    def test_dos_de_la_misma_capa_queda_la_primera(self):
        perfil = parsear_perfil(
            _respuesta(puesto="full_stack", tecnologias=["full_stack_vue", "full_stack_react", "full_stack_node"]),
            ENTRADA,
        )

        self.assertEqual(perfil.tecnologias, ("full_stack_vue", "full_stack_node"))

    def test_tecnologias_que_no_son_lista_se_ignoran(self):
        perfil = parsear_perfil(_respuesta(tecnologias="backend_python"), ENTRADA)

        self.assertEqual(perfil.tecnologias, ())

    def test_nivel_invalido_supone_el_inicial(self):
        perfil = parsear_perfil(_respuesta(nivel="experto"), ENTRADA)

        self.assertEqual(perfil.nivel, "junior")
        self.assertTrue(perfil.nivel_supuesto)

    def test_descarta_requisitos_que_el_aviso_no_pide(self):
        perfil = parsear_perfil(_respuesta(requisitos=["PostgreSQL", "Kubernetes", "Liderazgo de equipos"]), ENTRADA)

        self.assertEqual(perfil.requisitos, ("PostgreSQL",))

    def test_sin_tildes_ni_mayusculas_y_sin_repetir(self):
        perfil = parsear_perfil(_respuesta(requisitos=["postgresql", "PostgreSQL", "diseno de apis rest"]), ENTRADA)

        self.assertEqual(perfil.requisitos, ("PostgreSQL", "diseno de apis rest"))

    def test_recorta_al_maximo(self):
        muchos = ["Python", "Django", "APIs REST", "PostgreSQL", "Git", "Docker", "AWS", "REST", "Python"]
        perfil = parsear_perfil(_respuesta(requisitos=muchos), ENTRADA)

        self.assertLessEqual(len(perfil.requisitos), MAXIMO_REQUISITOS)

    def test_no_deja_pasar_los_marcadores_del_enmascarado(self):
        perfil = parsear_perfil(_respuesta(requisitos=["[CORREO]"]), ENTRADA)

        # Aparece en el aviso enmascarado, pero no es un requisito: se descarta igual.
        self.assertNotIn("[CORREO]", perfil.requisitos)

    def test_forma_rota_es_respuesta_invalida(self):
        with self.assertRaises(RespuestaIAInvalida):
            parsear_perfil(_respuesta(requisitos="PostgreSQL"), ENTRADA)
        with self.assertRaises(RespuestaIAInvalida):
            parsear_perfil(["no", "es", "objeto"], ENTRADA)  # type: ignore[arg-type]


class PromptTest(unittest.TestCase):
    def test_el_sistema_lista_el_catalogo(self):
        prompt = sistema(ENTRADA)
        self.assertIn("backend_python = Python", prompt)
        self.assertIn("full_stack_react = React [frontend]", prompt)
        self.assertIn("semi_senior", prompt)
        self.assertIn("json", prompt)

    def test_el_usuario_lleva_el_aviso_y_las_pistas(self):
        prompt = usuario(ENTRADA)
        self.assertIn("PostgreSQL", prompt)
        self.assertIn("Cargo que nombra: Desarrollador Backend", prompt)

    def test_el_esquema_limita_puesto_y_nivel_al_catalogo(self):
        datos = esquema(ENTRADA)
        self.assertEqual(datos["properties"]["puesto"]["enum"], ["frontend", "backend", "movil", "full_stack", SIN_PUESTO])
        self.assertEqual(datos["properties"]["nivel"]["enum"], ["junior", "semi_senior", "senior"])


if __name__ == "__main__":
    unittest.main()


class ProveedoresTest(unittest.TestCase):
    def test_el_falso_detecta_el_ejemplo_backend(self):
        from integrations.ia.fake import FakeProveedorIA

        perfil = FakeProveedorIA().analizar_convocatoria(ENTRADA)

        self.assertEqual((perfil.puesto, perfil.tecnologias, perfil.nivel), ("backend", ("backend_python",), "junior"))
        self.assertIn("PostgreSQL", perfil.requisitos)

    def test_el_falso_detecta_una_tecnologia_por_capa(self):
        from dataclasses import replace

        from integrations.ia.fake import FakeProveedorIA

        aviso = "Buscamos Desarrollador Full Stack con React y Node.js para nuestro equipo."
        perfil = FakeProveedorIA().analizar_convocatoria(replace(ENTRADA, texto=aviso))

        self.assertEqual((perfil.puesto, perfil.tecnologias), ("full_stack", ("full_stack_react", "full_stack_node")))

    def test_el_falso_no_inventa_un_puesto(self):
        from dataclasses import replace

        from integrations.ia.fake import FakeProveedorIA

        contador = replace(ENTRADA, texto="Se busca contador público con experiencia en tributación.", terminos=())
        self.assertFalse(FakeProveedorIA().analizar_convocatoria(contador).identificado)

    def test_la_cadena_pasa_al_siguiente_si_uno_falla(self):
        from integrations.ia.cadena import ProveedorEnCadena
        from integrations.ia.exceptions import ErrorTransitorio
        from integrations.ia.fake import FakeProveedorIA

        class Agotado(FakeProveedorIA):
            nombre = "agotado"

            def analizar_convocatoria(self, entrada):
                raise ErrorTransitorio("429")

        cadena = ProveedorEnCadena([Agotado(), FakeProveedorIA()])

        self.assertTrue(cadena.analizar_convocatoria(ENTRADA).identificado)
        self.assertEqual(cadena.nombre, "fake")

    def test_todos_los_adaptadores_por_json_lo_implementan(self):
        from integrations.ia.base import ProveedorIAporJSON
        from integrations.ia.claude import AnthropicProveedorIA
        from integrations.ia.compatible_openai import DeepSeekProveedorIA
        from integrations.ia.gemini import GeminiProveedorIA

        for clase in (GeminiProveedorIA, AnthropicProveedorIA, DeepSeekProveedorIA):
            with self.subTest(clase=clase.__name__):
                self.assertIs(clase.analizar_convocatoria, ProveedorIAporJSON.analizar_convocatoria)

import unittest

from integrations.ia.prompts import entrevistador, evaluador
from integrations.ia.prompts.schemas import (
    CRITERIOS,
    NIVEL_MAXIMO,
    AreaTecnica,
    ContextoDeEntrevista,
    Nivel,
    Puesto,
    Tecnologia,
    TemaEvaluado,
)

# Estimación conservadora para español (~3.7 caracteres por token). Sirve solo
# como cota superior fácil de calcular sin depender de un tokenizador real.
CARACTERES_POR_TOKEN = 3.7

CONTEXTO = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.BASICO)
CONTEXTO_CON_STACK = ContextoDeEntrevista(
    puesto=Puesto.BACKEND, nivel=Nivel.BASICO, tecnologia=Tecnologia.PYTHON_DJANGO
)


def _tokens_estimados(texto: str) -> float:
    return len(texto) / CARACTERES_POR_TOKEN


class PromptEvaluadorSinHistorialTest(unittest.TestCase):
    """El evaluador es una función pura: solo conoce el turno que califica."""

    def test_prompt_del_evaluador_no_incluye_turnos_de_otras_preguntas(self):
        marcador_ajeno = "MARCADOR_DE_UN_TURNO_ANTERIOR_QUE_NO_DEBERIA_APARECER"

        prompt = evaluador.usuario(
            pregunta="¿Qué es una clave foránea?",
            respuesta="Es un campo que referencia la clave primaria de otra tabla.",
        )

        self.assertNotIn(marcador_ajeno, prompt)

    def test_firma_del_evaluador_no_acepta_historial(self):
        # Si en el futuro alguien agrega un parámetro de historial al evaluador,
        # esta prueba lo señala explícitamente en vez de dejarlo pasar en silencio.
        import inspect

        parametros = list(inspect.signature(evaluador.usuario).parameters)
        self.assertEqual(parametros, ["pregunta", "respuesta"])


class PromptEntrevistadorContextoAcotadoTest(unittest.TestCase):
    """El entrevistador recibe un resumen comprimido, no el historial completo:
    el prompt no debe crecer sin control con la longitud de la entrevista.
    """

    def test_pregunta_uno_sin_previas_es_minimo(self):
        prompt = entrevistador.usuario(numero=1, previas=[])
        self.assertLess(_tokens_estimados(prompt), 50)

    def test_pregunta_cinco_con_historial_completo_se_mantiene_acotada(self):
        previas = [
            TemaEvaluado(
                pregunta=(
                    "Explica en detalle la diferencia entre una lista enlazada simple "
                    "y una lista doblemente enlazada, incluyendo ventajas y desventajas "
                    "de cada una en términos de complejidad temporal y espacial."
                ),
                puntuacion=70 + i,
            )
            for i in range(4)
        ]

        prompt = entrevistador.usuario(numero=5, previas=previas)

        # Umbral generoso: si alguien reintroduce las RESPUESTAS del candidato
        # (no solo la pregunta y la puntuación), el prompt lo supera con margen.
        self.assertLess(_tokens_estimados(prompt), 400)

    def test_prompt_no_crece_proporcional_a_respuestas_largas(self):
        respuesta_larga = "palabra " * 500  # ~4000 caracteres, simulando una respuesta extensa

        previas_cortas = [TemaEvaluado(pregunta="¿Qué es SQL?", puntuacion=80)]
        prompt_sin_respuesta = entrevistador.usuario(numero=2, previas=previas_cortas)

        self.assertNotIn(respuesta_larga.strip(), prompt_sin_respuesta)
        self.assertLess(_tokens_estimados(prompt_sin_respuesta), 100)


class SistemaMencionaRolCorrectoTest(unittest.TestCase):
    """El entrevistador y el evaluador tienen roles distintos y no deben mezclarse."""

    def test_sistema_del_entrevistador_no_contiene_la_rubrica(self):
        prompt = entrevistador.sistema(CONTEXTO, AreaTecnica.PROGRAMACION, total_preguntas=5)
        self.assertNotIn(evaluador.RUBRICA, prompt)
        self.assertNotIn("Corrección técnica", prompt)

    def test_sistema_del_evaluador_contiene_la_rubrica(self):
        prompt = evaluador.sistema(CONTEXTO, AreaTecnica.PROGRAMACION)
        self.assertIn(evaluador.RUBRICA, prompt)


class RubricaAnaliticaTest(unittest.TestCase):
    """La rúbrica es el instrumento que justifica la nota: tres criterios, cinco
    niveles descritos cada uno, y el modelo solo elige niveles."""

    def test_cada_criterio_tiene_un_descriptor_por_nivel(self):
        for criterio in CRITERIOS:
            with self.subTest(criterio=criterio):
                descriptores = evaluador.DESCRIPTORES[criterio]
                self.assertEqual(len(descriptores), NIVEL_MAXIMO + 1)
                for descriptor in descriptores:
                    self.assertIn(descriptor, evaluador.RUBRICA)

    def test_el_esquema_exige_puntos_clave_acotados(self):
        esquema = evaluador.ESQUEMA_EVALUACION
        self.assertIn("puntos_clave", esquema["required"])
        self.assertEqual(esquema["properties"]["puntos_clave"]["minItems"], 2)
        self.assertEqual(esquema["properties"]["puntos_clave"]["maxItems"], 4)

    def test_el_prompt_pide_lo_esperado_sin_corregir_la_respuesta(self):
        prompt = evaluador.sistema(CONTEXTO, AreaTecnica.PROGRAMACION)
        self.assertIn("puntos_clave", prompt)
        self.assertIn("no repitas ni corrijas la respuesta del candidato", prompt)

    def test_el_esquema_exige_niveles_y_no_pide_nota(self):
        esquema = evaluador.ESQUEMA_EVALUACION
        self.assertIn("niveles", esquema["required"])
        self.assertNotIn("puntuacion", esquema["properties"])
        niveles = esquema["properties"]["niveles"]
        self.assertEqual(set(niveles["required"]), set(CRITERIOS))
        for criterio in CRITERIOS:
            with self.subTest(criterio=criterio):
                self.assertEqual(niveles["properties"][criterio]["minimum"], 0)
                self.assertEqual(niveles["properties"][criterio]["maximum"], NIVEL_MAXIMO)


class SistemaDeclaraElEncuadreTest(unittest.TestCase):
    """Los dos prompts deben decirle al modelo a qué puesto se postula y de qué
    tema va la pregunta: es lo que hace que la simulación se parezca a una
    entrevista real en lugar de a un cuestionario suelto."""

    def test_ambos_prompts_nombran_puesto_nivel_y_tema(self):
        for nombre, prompt in (
            ("entrevistador", entrevistador.sistema(CONTEXTO, AreaTecnica.APIS, 5)),
            ("evaluador", evaluador.sistema(CONTEXTO, AreaTecnica.APIS)),
        ):
            with self.subTest(prompt=nombre):
                self.assertIn(Puesto.BACKEND.etiqueta, prompt)
                self.assertIn(Nivel.BASICO.etiqueta, prompt)
                self.assertIn(AreaTecnica.APIS.etiqueta, prompt)

    def test_la_tecnologia_se_omite_cuando_no_hay(self):
        """Sin stack elegido no se escribe "ninguna": mencionar la ausencia
        invita al modelo a comentarla en vez de ignorarla."""
        for nombre, prompt in (
            ("entrevistador", entrevistador.sistema(CONTEXTO, AreaTecnica.APIS, 5)),
            ("evaluador", evaluador.sistema(CONTEXTO, AreaTecnica.APIS)),
        ):
            with self.subTest(prompt=nombre):
                self.assertNotIn("Tecnología", prompt)

    def test_la_tecnologia_aparece_cuando_se_eligio(self):
        for nombre, prompt in (
            ("entrevistador", entrevistador.sistema(CONTEXTO_CON_STACK, AreaTecnica.APIS, 5)),
            ("evaluador", evaluador.sistema(CONTEXTO_CON_STACK, AreaTecnica.APIS)),
        ):
            with self.subTest(prompt=nombre):
                self.assertIn(Tecnologia.PYTHON_DJANGO.etiqueta, prompt)


if __name__ == "__main__":
    unittest.main()

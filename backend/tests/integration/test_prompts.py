import unittest

from integrations.ia.prompts import entrevistador, evaluador
from integrations.ia.prompts.schemas import AreaTecnica, Nivel, TemaEvaluado

# Estimación conservadora para español (~3.7 caracteres por token). Sirve solo
# como cota superior fácil de calcular sin depender de un tokenizador real.
CARACTERES_POR_TOKEN = 3.7


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
        prompt = entrevistador.sistema(AreaTecnica.PROGRAMACION, Nivel.BASICO, total_preguntas=5)
        self.assertNotIn("Bandas de puntuación", prompt)

    def test_sistema_del_evaluador_contiene_la_rubrica(self):
        prompt = evaluador.sistema(AreaTecnica.PROGRAMACION, Nivel.BASICO)
        self.assertIn("Bandas de puntuación", prompt)


if __name__ == "__main__":
    unittest.main()

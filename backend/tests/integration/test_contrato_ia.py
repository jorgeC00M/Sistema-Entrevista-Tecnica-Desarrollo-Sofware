import unittest

from integrations.ia import (
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    ErrorTransitorio,
    Nivel,
    TemaEvaluado,
)
from integrations.ia.fake import FakeProveedorIA


def _recorrer_entrevista(proveedor: FakeProveedorIA, area: AreaTecnica, nivel: Nivel):
    """Recorre una entrevista completa usando las dos operaciones separadas,
    reconstruyendo el resumen comprimido turno a turno — igual que hará
    `services/entrevista.py` a partir de la base de datos en el Incremento 2.
    """
    previas: list[TemaEvaluado] = []
    evaluaciones = []

    for numero in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
        pregunta = proveedor.generar_pregunta(area, nivel, numero, previas)
        respuesta = f"Respuesta del candidato a la pregunta {numero}"
        evaluacion = proveedor.evaluar_respuesta(area, nivel, pregunta.texto, respuesta)
        evaluaciones.append(evaluacion)
        previas.append(TemaEvaluado(pregunta=pregunta.texto, puntuacion=evaluacion.puntuacion))

    return evaluaciones, previas


class FlujoCompletoTest(unittest.TestCase):
    """Recorre una entrevista entera contra un proveedor, sin red ni cuota."""

    def test_entrevista_completa_produce_cinco_evaluaciones(self):
        proveedor = FakeProveedorIA()
        evaluaciones, previas = _recorrer_entrevista(proveedor, AreaTecnica.PROGRAMACION, Nivel.BASICO)

        self.assertEqual(len(evaluaciones), PREGUNTAS_POR_ENTREVISTA)
        self.assertEqual(len(previas), PREGUNTAS_POR_ENTREVISTA)
        for evaluacion in evaluaciones:
            self.assertTrue(0 <= evaluacion.puntuacion <= 100)

    def test_promedio_de_entrevista_es_calculable(self):
        proveedor = FakeProveedorIA()
        evaluaciones, _ = _recorrer_entrevista(proveedor, AreaTecnica.DESARROLLO_WEB, Nivel.INTERMEDIO)

        promedio = sum(e.puntuacion for e in evaluaciones) / len(evaluaciones)
        self.assertTrue(0 <= promedio <= 100)

    def test_evaluador_no_depende_del_orden_de_la_entrevista(self):
        """Función pura: la misma pregunta y respuesta producen la misma evaluación,
        sin importar en qué entrevista ni en qué turno ocurrieron.
        """
        proveedor = FakeProveedorIA()
        a = proveedor.evaluar_respuesta(AreaTecnica.PROGRAMACION, Nivel.BASICO, "¿Qué es un índice?", "Una estructura que acelera búsquedas.")
        b = proveedor.evaluar_respuesta(AreaTecnica.PROGRAMACION, Nivel.BASICO, "¿Qué es un índice?", "Una estructura que acelera búsquedas.")
        self.assertEqual(a, b)


class ResilienciaTest(unittest.TestCase):
    """Verifica el mecanismo de simulación de fallos que usará el Incremento 2
    para probar reintentos e idempotencia.
    """

    def test_fallar_en_interrumpe_la_llamada_indicada(self):
        proveedor = FakeProveedorIA(fallar_en=3)
        proveedor.generar_pregunta(AreaTecnica.PROGRAMACION, Nivel.BASICO, 1, [])  # llamada 1
        proveedor.evaluar_respuesta(AreaTecnica.PROGRAMACION, Nivel.BASICO, "p", "r")  # llamada 2

        with self.assertRaises(ErrorTransitorio):
            proveedor.generar_pregunta(AreaTecnica.PROGRAMACION, Nivel.BASICO, 2, [])  # llamada 3

    def test_sin_fallar_en_no_falla_nunca(self):
        proveedor = FakeProveedorIA()
        _recorrer_entrevista(proveedor, AreaTecnica.BASES_DE_DATOS, Nivel.BASICO)


if __name__ == "__main__":
    unittest.main()

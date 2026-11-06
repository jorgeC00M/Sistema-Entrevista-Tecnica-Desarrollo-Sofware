"""Una entrevista entera contra el proveedor falso, con la nota que calcula la app.

Vivía en `tests/integration/test_contrato_ia.py`, pero usa `puntuacion_de`
(`apps/evaluaciones/rubricas.py`), y esa carpeta es solo de la capa de IA, sin
Django.
"""

import unittest

from apps.evaluaciones.rubricas import puntuacion_de
from integrations.ia import (
    NIVEL_MAXIMO,
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    ContextoDeEntrevista,
    Nivel,
    Puesto,
    TemaEvaluado,
    area_de_la_pregunta,
    areas_que_cubre,
)
from integrations.ia.fake import FakeProveedorIA

BACKEND_JUNIOR = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.JUNIOR)


def _recorrer_entrevista(proveedor: FakeProveedorIA, contexto: ContextoDeEntrevista):
    """Recorre una entrevista completa usando las dos operaciones separadas,
    reconstruyendo el resumen comprimido turno a turno — igual que hace
    `apps/entrevistas/services.py` a partir de la base de datos.

    El área de cada turno la decide el puesto, no quien llama: es lo que hace
    que una entrevista toque varios temas como una de verdad.
    """
    previas: list[TemaEvaluado] = []
    evaluaciones = []
    areas_recorridas = []

    for numero in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
        area = area_de_la_pregunta(contexto.puesto, numero)
        areas_recorridas.append(area)
        pregunta = proveedor.generar_pregunta(contexto, area, numero, previas)
        respuesta = f"Respuesta del candidato a la pregunta {numero}"
        evaluacion = proveedor.evaluar_respuesta(contexto, area, pregunta.texto, respuesta)
        evaluaciones.append(evaluacion)
        # La nota no la da el proveedor: la calcula la aplicación con la fórmula,
        # igual que hace `guardar()` antes de que el entrevistador la lea de la BD.
        previas.append(TemaEvaluado(pregunta=pregunta.texto, puntuacion=puntuacion_de(evaluacion.niveles)))

    return evaluaciones, previas, areas_recorridas


class FlujoCompletoTest(unittest.TestCase):
    """Recorre una entrevista entera contra un proveedor, sin red ni cuota."""

    def test_entrevista_completa_produce_cinco_evaluaciones(self):
        evaluaciones, previas, _ = _recorrer_entrevista(FakeProveedorIA(), BACKEND_JUNIOR)

        self.assertEqual(len(evaluaciones), PREGUNTAS_POR_ENTREVISTA)
        self.assertEqual(len(previas), PREGUNTAS_POR_ENTREVISTA)
        for evaluacion in evaluaciones:
            for nivel in evaluacion.niveles.como_dict().values():
                self.assertTrue(0 <= nivel <= NIVEL_MAXIMO)

    def test_la_entrevista_recorre_las_areas_del_puesto(self):
        _, _, areas = _recorrer_entrevista(FakeProveedorIA(), BACKEND_JUNIOR)

        self.assertEqual(set(areas), set(areas_que_cubre(Puesto.BACKEND)))

    def test_promedio_de_entrevista_es_calculable(self):
        contexto = ContextoDeEntrevista(puesto=Puesto.FRONTEND, nivel=Nivel.SEMI_SENIOR, tecnologia="React")
        evaluaciones, _, _ = _recorrer_entrevista(FakeProveedorIA(), contexto)

        promedio = sum(puntuacion_de(e.niveles) for e in evaluaciones) / len(evaluaciones)
        self.assertTrue(0 <= promedio <= 100)

    def test_evaluador_no_depende_del_orden_de_la_entrevista(self):
        """Función pura: la misma pregunta y respuesta producen la misma evaluación,
        sin importar en qué entrevista ni en qué turno ocurrieron.
        """
        proveedor = FakeProveedorIA()
        argumentos = (BACKEND_JUNIOR, AreaTecnica.BASES_DE_DATOS, "¿Qué es un índice?", "Una estructura que acelera búsquedas.")

        self.assertEqual(proveedor.evaluar_respuesta(*argumentos), proveedor.evaluar_respuesta(*argumentos))

    def test_sin_fallar_en_no_falla_nunca(self):
        _recorrer_entrevista(FakeProveedorIA(), ContextoDeEntrevista(Puesto.FULL_STACK, Nivel.JUNIOR))

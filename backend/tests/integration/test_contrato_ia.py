import unittest

from apps.evaluaciones.rubricas import puntuacion_de
from integrations.ia import (
    NIVEL_MAXIMO,
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    ContextoDeEntrevista,
    ErrorTransitorio,
    Nivel,
    Puesto,
    TemaEvaluado,
    Enfoque,
    area_de_la_pregunta,
    areas_que_cubre,
    paso_de_la_pregunta,
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


class PlanPorPuestoTest(unittest.TestCase):
    """La composición de cada puesto es el contrato que hace realista la
    simulación, así que se verifica como tal y no se da por supuesta."""

    def test_cada_puesto_cubre_exactamente_las_preguntas_de_una_entrevista(self):
        for puesto in Puesto:
            with self.subTest(puesto=puesto.value):
                recorrido = [
                    area_de_la_pregunta(puesto, numero)
                    for numero in range(1, PREGUNTAS_POR_ENTREVISTA + 1)
                ]
                self.assertEqual(len(recorrido), PREGUNTAS_POR_ENTREVISTA)
                for area in recorrido:
                    self.assertIsInstance(area, AreaTecnica)

    def test_una_pregunta_fuera_del_plan_falla_explicito(self):
        for numero in (0, PREGUNTAS_POR_ENTREVISTA + 1):
            with self.subTest(numero=numero):
                with self.assertRaises(ValueError):
                    area_de_la_pregunta(Puesto.BACKEND, numero)

    def test_todo_puesto_recorre_los_cinco_enfoques_en_orden(self):
        esperados = [
            Enfoque.FUNDAMENTOS,
            Enfoque.TECNOLOGIA,
            Enfoque.DATOS,
            Enfoque.PROFUNDIDAD,
            Enfoque.CASO_PRACTICO,
        ]
        for puesto in Puesto:
            with self.subTest(puesto=puesto.value):
                enfoques = [paso_de_la_pregunta(puesto, n).enfoque for n in range(1, PREGUNTAS_POR_ENTREVISTA + 1)]
                self.assertEqual(enfoques, esperados)

    def test_areas_del_plan_segun_el_diseno(self):
        """La tabla de design.md D6, fijada: cambiarla debe ser visible aquí."""
        A = AreaTecnica
        esperado = {
            Puesto.FRONTEND: [A.PROGRAMACION, A.DESARROLLO_WEB, A.ESTRUCTURAS_DE_DATOS, A.DESARROLLO_WEB, A.DESARROLLO_WEB],
            Puesto.BACKEND: [A.PROGRAMACION, A.APIS, A.BASES_DE_DATOS, A.APIS, A.APIS],
            Puesto.FULL_STACK: [A.PROGRAMACION, A.DESARROLLO_WEB, A.BASES_DE_DATOS, A.APIS, A.APIS],
            Puesto.MOVIL: [A.PROGRAMACION, A.DESARROLLO_MOVIL, A.ESTRUCTURAS_DE_DATOS, A.DESARROLLO_MOVIL, A.DESARROLLO_MOVIL],
            Puesto.ESCRITORIO: [
                A.PROGRAMACION,
                A.DESARROLLO_ESCRITORIO,
                A.ESTRUCTURAS_DE_DATOS,
                A.DESARROLLO_ESCRITORIO,
                A.DESARROLLO_ESCRITORIO,
            ],
            Puesto.QA: [A.PROGRAMACION, A.PRUEBAS, A.BASES_DE_DATOS, A.PRUEBAS, A.PRUEBAS],
        }
        self.assertEqual(set(esperado), set(Puesto))
        for puesto, areas in esperado.items():
            with self.subTest(puesto=puesto.value):
                self.assertEqual([area_de_la_pregunta(puesto, n) for n in range(1, 6)], areas)

    def test_ningun_puesto_pregunta_siempre_del_mismo_tema(self):
        """El motivo de todo el cambio: una entrevista monotemática no se parece
        a una real. Si alguien reduce un plan a un solo área, esto lo señala."""
        for puesto in Puesto:
            with self.subTest(puesto=puesto.value):
                self.assertGreater(len(areas_que_cubre(puesto)), 1)


class FlujoCompletoTest(unittest.TestCase):
    """Recorre una entrevista entera contra un proveedor, sin red ni cuota."""

    def test_entrevista_completa_produce_cinco_evaluaciones(self):
        proveedor = FakeProveedorIA()
        evaluaciones, previas, _ = _recorrer_entrevista(proveedor, BACKEND_JUNIOR)

        self.assertEqual(len(evaluaciones), PREGUNTAS_POR_ENTREVISTA)
        self.assertEqual(len(previas), PREGUNTAS_POR_ENTREVISTA)
        for evaluacion in evaluaciones:
            for nivel in evaluacion.niveles.como_dict().values():
                self.assertTrue(0 <= nivel <= NIVEL_MAXIMO)

    def test_la_entrevista_recorre_las_areas_del_puesto(self):
        proveedor = FakeProveedorIA()
        _, _, areas = _recorrer_entrevista(proveedor, BACKEND_JUNIOR)

        self.assertEqual(set(areas), set(areas_que_cubre(Puesto.BACKEND)))

    def test_promedio_de_entrevista_es_calculable(self):
        proveedor = FakeProveedorIA()
        contexto = ContextoDeEntrevista(
            puesto=Puesto.FRONTEND,
            nivel=Nivel.SEMI_SENIOR,
            tecnologia="React",
        )
        evaluaciones, _, _ = _recorrer_entrevista(proveedor, contexto)

        promedio = sum(puntuacion_de(e.niveles) for e in evaluaciones) / len(evaluaciones)
        self.assertTrue(0 <= promedio <= 100)

    def test_evaluador_no_depende_del_orden_de_la_entrevista(self):
        """Función pura: la misma pregunta y respuesta producen la misma evaluación,
        sin importar en qué entrevista ni en qué turno ocurrieron.
        """
        proveedor = FakeProveedorIA()
        a = proveedor.evaluar_respuesta(
            BACKEND_JUNIOR,
            AreaTecnica.BASES_DE_DATOS,
            "¿Qué es un índice?",
            "Una estructura que acelera búsquedas.",
        )
        b = proveedor.evaluar_respuesta(
            BACKEND_JUNIOR,
            AreaTecnica.BASES_DE_DATOS,
            "¿Qué es un índice?",
            "Una estructura que acelera búsquedas.",
        )
        self.assertEqual(a, b)


class ResilienciaTest(unittest.TestCase):
    """Verifica el mecanismo de simulación de fallos con el que se prueban los
    reintentos y la idempotencia del orquestador."""

    def test_fallar_en_interrumpe_la_llamada_indicada(self):
        proveedor = FakeProveedorIA(fallar_en=3)
        area = AreaTecnica.PROGRAMACION
        proveedor.generar_pregunta(BACKEND_JUNIOR, area, 1, [])  # llamada 1
        proveedor.evaluar_respuesta(BACKEND_JUNIOR, area, "p", "r")  # llamada 2

        with self.assertRaises(ErrorTransitorio):
            proveedor.generar_pregunta(BACKEND_JUNIOR, area, 2, [])  # llamada 3

    def test_sin_fallar_en_no_falla_nunca(self):
        proveedor = FakeProveedorIA()
        _recorrer_entrevista(proveedor, ContextoDeEntrevista(Puesto.FULL_STACK, Nivel.JUNIOR))


if __name__ == "__main__":
    unittest.main()

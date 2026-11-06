"""El contrato de la capa de IA: el plan por puesto y la simulación de fallos.

Sin Django, como todo `tests/integration/`. La entrevista entera con la nota
que calcula la app está en `apps/evaluaciones/tests/test_flujo_con_la_formula.py`.
"""

import unittest

from integrations.ia import (
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    ContextoDeEntrevista,
    ErrorTransitorio,
    Nivel,
    Puesto,
    Enfoque,
    area_de_la_pregunta,
    areas_que_cubre,
    paso_de_la_pregunta,
)
from integrations.ia.fake import FakeProveedorIA

BACKEND_JUNIOR = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.JUNIOR)


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
            Puesto.VIDEOJUEGOS: [
                A.PROGRAMACION,
                A.DESARROLLO_VIDEOJUEGOS,
                A.ESTRUCTURAS_DE_DATOS,
                A.DESARROLLO_VIDEOJUEGOS,
                A.DESARROLLO_VIDEOJUEGOS,
            ],
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


if __name__ == "__main__":
    unittest.main()

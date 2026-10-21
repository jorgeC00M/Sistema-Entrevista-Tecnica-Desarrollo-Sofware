"""Verifica el desglose por área de la retroalimentación (y que el viejo
/api/estadisticas/ ya no existe), calculado con agregaciones reales sobre
PostgreSQL — no reimplementadas en Python en la prueba, para no validar el
cálculo contra sí mismo. Se arman entrevistas completas conocidas y se
comprueban los números exactos que deberían salir.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from tests.conftest import nivel_de, niveles_para, puesto_de
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import (
    PREGUNTAS_POR_ENTREVISTA,
    Puesto,
    areas_que_cubre,
)

Usuario = get_user_model()

URL_RETROALIMENTACION = "/api/estadisticas/retroalimentacion/"


class ProveedorPuntuacionFija(FakeProveedorIA):
    """Como FakeProveedorIA, pero con puntuación configurable en vez de fija
    en 75 — necesario para construir escenarios con promedios conocidos.
    """

    def __init__(self, puntuacion):
        super().__init__()
        self._puntuacion = puntuacion

    def evaluar_respuesta(self, contexto, area, pregunta, respuesta):
        from integrations.ia.prompts.schemas import parsear_evaluacion

        return parsear_evaluacion(
            {
                "niveles": niveles_para(self._puntuacion),
                "fortalezas": "ok",
                "debilidades": "ok",
                "sugerencias": "ok",
                "puntos_clave": ["Primer punto", "Segundo punto"],
            }
        )


def _completar_entrevista(usuario, puesto, nivel, puntuacion):
    proveedor = ProveedorPuntuacionFija(puntuacion)
    entrevista = servicio.iniciar(usuario, puesto, nivel, proveedor=proveedor)
    for _ in range(PREGUNTAS_POR_ENTREVISTA):
        servicio.responder(entrevista, "Una respuesta", proveedor=proveedor)
    entrevista.refresh_from_db()
    return entrevista


class EndpointDeEstadisticasRetiradoTest(APITestCase):
    """`/api/estadisticas/` solo alimentaba las cifras del encabezado del
    historial, que se quitaron; la retroalimentación sigue bajo el mismo prefijo."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    def test_ya_no_existe_y_la_retroalimentacion_sigue(self):
        self.assertEqual(self.client.get("/api/estadisticas/").status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            self.client.get("/api/estadisticas/retroalimentacion/").status_code, status.HTTP_200_OK
        )


class DesglosePorAreaTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    def test_el_desglose_por_area_reparte_los_temas_de_la_entrevista(self):
        """Una sola entrevista aporta a varias áreas, porque el puesto reparte
        los temas entre sus preguntas. Antes la entrevista tenía un área única y
        las cinco respuestas heredaban esa etiqueta; ahora el desglose dice de
        verdad en qué temas le fue bien o mal al candidato. Ese desglose vive en
        la retroalimentación acumulada.
        """
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 92)

        respuesta = self.client.get(URL_RETROALIMENTACION)

        por_area = {fila["area"]: fila for fila in respuesta.data["por_area"]}
        esperadas = {a.value for a in areas_que_cubre(Puesto.BACKEND)}
        self.assertEqual(set(por_area), esperadas)
        for codigo, fila in por_area.items():
            with self.subTest(area=codigo):
                self.assertEqual(float(fila["promedio"]), 92.0)

    def test_dos_puestos_distintos_tocan_conjuntos_de_areas_distintos(self):
        """Elegir Backend o Frontend cambia los temas que se evalúan: es lo que
        hace que el puesto signifique algo y no sea solo una etiqueta."""
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 67)

        del_backend = {fila["area"] for fila in self.client.get(URL_RETROALIMENTACION).data["por_area"]}

        _completar_entrevista(self.usuario, puesto_de("frontend"), nivel_de("junior"), 67)
        con_ambos = {fila["area"] for fila in self.client.get(URL_RETROALIMENTACION).data["por_area"]}

        # El frontend aporta temas que el backend no toca.
        self.assertTrue(con_ambos - del_backend)





if __name__ == "__main__":
    import unittest

    unittest.main()


class TrazabilidadDeLaNotaTest(APITestCase):
    """Cualquier nota guardada se puede reconstruir a mano desde su JSON: es lo
    que permite responder "¿de dónde sale el 67?" con una cuenta y no con
    "lo dijo la IA"."""

    def test_la_formula_aplicada_al_json_da_la_columna_puntuacion(self):
        from apps.evaluaciones.models import Evaluacion
        from apps.evaluaciones.rubricas import PESOS, VERSION_DE_RUBRICA, puntuacion_de

        usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        entrevista = _completar_entrevista(usuario, puesto_de("backend"), nivel_de("junior"), 67)

        evaluaciones = Evaluacion.objects.filter(intercambio__entrevista=entrevista)
        self.assertEqual(evaluaciones.count(), PREGUNTAS_POR_ENTREVISTA)
        for evaluacion in evaluaciones:
            with self.subTest(intercambio=evaluacion.intercambio_id):
                datos = evaluacion.evaluacion_json
                self.assertEqual(datos["version_rubrica"], VERSION_DE_RUBRICA)
                self.assertEqual(datos["pesos"], PESOS)
                self.assertEqual(puntuacion_de(datos["niveles"], datos["pesos"]), evaluacion.puntuacion)
                self.assertEqual(evaluacion.puntuacion, 67)
                self.assertEqual(datos["puntos_clave"], ["Primer punto", "Segundo punto"])

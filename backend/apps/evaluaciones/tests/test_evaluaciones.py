"""Verifica /api/estadisticas/: promedio general, promedio por área y
evolución cronológica, calculados con agregaciones reales sobre PostgreSQL —
no reimplementadas en Python en la prueba, para no validar el cálculo contra
sí mismo. Se arman entrevistas completas conocidas y se comprueban los
números exactos que deberían salir.
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


class EstadisticasSinDatosTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    def test_sin_entrevistas_completadas(self):
        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["entrevistas_completadas"], 0)
        self.assertIsNone(respuesta.data["promedio_general"])
        self.assertEqual(respuesta.data["promedio_por_area"], [])
        self.assertEqual(respuesta.data["evolucion"], [])

    def test_endpoint_requiere_autenticacion(self):
        self.client.force_authenticate(None)
        respuesta = self.client.get("/api/estadisticas/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)


class EstadisticasConDatosTest(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    def test_promedio_general_es_el_promedio_real_de_las_evaluaciones(self):
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 58)
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 83)

        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(float(respuesta.data["promedio_general"]), 70.5)
        self.assertEqual(respuesta.data["entrevistas_completadas"], 2)

    def test_promedio_por_area_desglosa_los_temas_de_la_entrevista(self):
        """Una sola entrevista aporta a varias áreas, porque el puesto reparte
        los temas entre sus preguntas. Antes la entrevista tenía un área única y
        las cinco respuestas heredaban esa etiqueta; ahora el desglose dice de
        verdad en qué temas le fue bien o mal al candidato.
        """
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 92)

        respuesta = self.client.get("/api/estadisticas/")

        por_area = {fila["area"]: fila for fila in respuesta.data["promedio_por_area"]}
        esperadas = {a.value for a in areas_que_cubre(Puesto.BACKEND)}
        self.assertEqual(set(por_area), esperadas)
        for codigo, fila in por_area.items():
            with self.subTest(area=codigo):
                self.assertEqual(float(fila["promedio"]), 92.0)
                # La misma entrevista es la que aportó a cada área.
                self.assertEqual(fila["entrevistas"], 1)

    def test_dos_puestos_distintos_tocan_conjuntos_de_areas_distintos(self):
        """Elegir Backend o Frontend cambia los temas que se evalúan: es lo que
        hace que el puesto signifique algo y no sea solo una etiqueta."""
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 67)

        del_backend = {
            fila["area"] for fila in self.client.get("/api/estadisticas/").data["promedio_por_area"]
        }

        _completar_entrevista(self.usuario, puesto_de("frontend"), nivel_de("junior"), 67)
        con_ambos = {
            fila["area"] for fila in self.client.get("/api/estadisticas/").data["promedio_por_area"]
        }

        # El frontend aporta temas que el backend no toca.
        self.assertTrue(con_ambos - del_backend)

    def test_dos_entrevistas_del_mismo_puesto_muestran_variacion(self):
        """Criterio de aceptación del incremento: tras completar dos
        entrevistas del mismo puesto, se puede observar la variación de
        desempeño entre ambas.
        """
        _completar_entrevista(self.usuario, puesto_de("frontend"), nivel_de("junior"), 42)
        _completar_entrevista(self.usuario, puesto_de("frontend"), nivel_de("junior"), 92)

        respuesta = self.client.get("/api/estadisticas/")

        evolucion = respuesta.data["evolucion"]
        self.assertEqual(len(evolucion), 2)
        puntuaciones = [float(e["puntuacion_promedio"]) for e in evolucion]
        self.assertEqual(puntuaciones, [42.0, 92.0])
        self.assertNotEqual(puntuaciones[0], puntuaciones[1])

    def test_la_evolucion_identifica_cada_entrevista_por_su_puesto(self):
        """La evolución es por entrevista, no por tema, así que lo que la
        identifica es el puesto: un punto del gráfico es "mi entrevista de
        Backend", no "mi entrevista de Bases de Datos"."""
        _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 67)

        punto = self.client.get("/api/estadisticas/").data["evolucion"][0]

        self.assertEqual(punto["puesto"], Puesto.BACKEND.value)
        self.assertEqual(punto["puesto_display"], "Desarrollador Backend")

    def test_evolucion_esta_ordenada_cronologicamente(self):
        primera = _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 67)
        segunda = _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 83)

        respuesta = self.client.get("/api/estadisticas/")

        ids = [e["entrevista_id"] for e in respuesta.data["evolucion"]]
        self.assertEqual(ids, [primera.id, segunda.id])

    def test_entrevistas_en_progreso_no_cuentan(self):
        servicio.iniciar(self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=FakeProveedorIA())

        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.data["entrevistas_completadas"], 0)
        self.assertIsNone(respuesta.data["promedio_general"])

    def test_solo_cuenta_entrevistas_del_usuario_autenticado(self):
        otro = Usuario.objects.create_user(
            email="otro@example.com", password="clave-segura-123", nombre_completo="Otro"
        )
        _completar_entrevista(otro, puesto_de("backend"), nivel_de("junior"), 100)

        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.data["entrevistas_completadas"], 0)


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

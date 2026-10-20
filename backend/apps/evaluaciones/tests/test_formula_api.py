"""Lo que la API publica de la fórmula de puntuación.

El reporte explica cada nota con los niveles de esa respuesta y los
descriptores de la rúbrica; una entrevista abandonada declara sobre cuántas
preguntas se calculó su nota. Ninguna de las dos cosas puede depender de que
el frontend adivine nada.
"""

from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.entrevistas.models import Entrevista
from apps.evaluaciones.models import Evaluacion
from apps.evaluaciones.rubricas import CRITERIOS, DESCRIPTORES, NIVEL_MAXIMO, PESOS
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA
from tests.conftest import crear_usuario, nivel_de, puesto_de


class FormulaEnLaApiTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.proveedor = FakeProveedorIA()

    def _iniciar(self):
        return servicio.iniciar(self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=self.proveedor)

    def _resultados(self, entrevista):
        respuesta = self.client.get(f"/api/entrevistas/{entrevista.pk}/resultados/")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return respuesta.data

    def test_cada_evaluacion_publica_sus_niveles_y_la_version(self):
        entrevista = self._iniciar()
        for _ in range(PREGUNTAS_POR_ENTREVISTA):
            servicio.responder(entrevista, "Una respuesta", proveedor=self.proveedor)

        for intercambio in self._resultados(entrevista)["intercambios"]:
            with self.subTest(numero=intercambio["numero"]):
                evaluacion = intercambio["evaluacion"]
                self.assertEqual(evaluacion["niveles"], {"correccion": 3, "completitud": 3, "claridad": 3})
                self.assertEqual(evaluacion["version_rubrica"], 2)
                self.assertEqual(evaluacion["puntuacion"], 75)
                self.assertEqual(len(evaluacion["puntos_clave"]), 3)

    def test_una_evaluacion_anterior_a_los_niveles_publica_null(self):
        """Las evaluaciones guardadas con la rúbrica 1 no se recalculan: conservan
        su nota y no tienen desglose que mostrar."""
        entrevista = self._iniciar()
        for _ in range(PREGUNTAS_POR_ENTREVISTA):
            servicio.responder(entrevista, "Una respuesta", proveedor=self.proveedor)
        Evaluacion.objects.filter(intercambio__entrevista=entrevista).update(
            puntuacion=74, evaluacion_json={"puntuacion": 74, "fortalezas": "ok"}
        )

        for intercambio in self._resultados(entrevista)["intercambios"]:
            with self.subTest(numero=intercambio["numero"]):
                self.assertIsNone(intercambio["evaluacion"]["niveles"])
                self.assertIsNone(intercambio["evaluacion"]["version_rubrica"])
                self.assertEqual(intercambio["evaluacion"]["puntuacion"], 74)
                self.assertEqual(intercambio["evaluacion"]["puntos_clave"], [])

    def test_una_abandonada_declara_sobre_cuantas_preguntas_se_calculo(self):
        entrevista = self._iniciar()
        servicio.responder(entrevista, "Una respuesta", proveedor=self.proveedor)
        servicio.responder(entrevista, "Otra respuesta", proveedor=self.proveedor)
        Entrevista.objects.filter(pk=entrevista.pk).update(estado=Entrevista.Estado.ABANDONADA)

        datos = self._resultados(entrevista)["entrevista"]

        self.assertEqual(datos["preguntas_calificadas"], 2)
        self.assertEqual(datos["preguntas_previstas"], PREGUNTAS_POR_ENTREVISTA)

    def test_el_historial_tambien_trae_el_conteo(self):
        entrevista = self._iniciar()
        servicio.responder(entrevista, "Una respuesta", proveedor=self.proveedor)

        listado = self.client.get("/api/entrevistas/").data
        fila = next(e for e in (listado["results"] if "results" in listado else listado) if e["id"] == entrevista.pk)

        self.assertEqual(fila["preguntas_calificadas"], 1)

    def test_el_catalogo_publica_la_rubrica(self):
        rubrica = self.client.get("/api/catalogos/").data["rubrica"]

        self.assertEqual(rubrica["nivel_maximo"], NIVEL_MAXIMO)
        self.assertEqual([c["codigo"] for c in rubrica["criterios"]], list(CRITERIOS))
        for criterio in rubrica["criterios"]:
            with self.subTest(criterio=criterio["codigo"]):
                self.assertEqual(criterio["peso"], PESOS[criterio["codigo"]])
                self.assertEqual(criterio["descriptores"], list(DESCRIPTORES[criterio["codigo"]]))

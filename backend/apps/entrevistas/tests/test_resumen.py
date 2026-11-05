"""El reporte final consolidado: qué priorizar para la próxima entrevista.

Se calcula con las evaluaciones guardadas, sin otra llamada a la IA, y sigue la
misma regla de publicación que las notas por pregunta.
"""

from unittest import mock

from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.evaluaciones.models import Evaluacion
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA, Puesto, area_de_la_pregunta
from tests.conftest import crear_usuario, nivel_de, niveles_para, puesto_de


class ProveedorConNotas(FakeProveedorIA):
    """Devuelve, en orden, una nota distinta por pregunta, con su sugerencia."""

    def __init__(self, notas):
        super().__init__()
        self._notas = list(notas)
        self._turno = 0

    def evaluar_respuesta(self, contexto, area, pregunta, respuesta):
        from integrations.ia.prompts.schemas import parsear_evaluacion

        nota = self._notas[self._turno]
        self._turno += 1
        return parsear_evaluacion(
            {
                "niveles": niveles_para(nota),
                "fortalezas": "ok",
                "debilidades": "ok",
                "sugerencias": f"Sugerencia de la pregunta {self._turno}",
                "puntos_clave": ["Primer punto", "Segundo punto"],
            }
        )


class ResumenFinalTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)

    def _entrevista(self, notas, nivel="junior", puesto="backend"):
        proveedor = ProveedorConNotas(notas)
        entrevista = servicio.iniciar(self.usuario, puesto_de(puesto), nivel_de(nivel), proveedor=proveedor)
        for _ in notas:
            servicio.responder(entrevista, "Una respuesta", proveedor=proveedor)
        entrevista.refresh_from_db()
        return entrevista

    def _resumen(self, entrevista):
        respuesta = self.client.get(f"/api/entrevistas/{entrevista.pk}/resultados/")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return respuesta.data["resumen"]

    def test_resumen_de_una_entrevista_finalizada(self):
        entrevista = self._entrevista([75, 58, 92, 67, 83])

        resumen = self._resumen(entrevista)

        self.assertEqual(resumen["promedio"], 75.0)
        self.assertEqual(resumen["banda"], "aceptable")
        self.assertEqual(set(resumen["criterios"]), {"correccion", "completitud", "claridad"})
        self.assertEqual(resumen["criterios_sobre"], PREGUNTAS_POR_ENTREVISTA)
        self.assertIsNotNone(resumen["criterio_mas_debil"])
        self.assertEqual(resumen["prioridad"]["numero"], 2)
        self.assertEqual(resumen["prioridad"]["puntuacion"], 58)
        self.assertEqual(resumen["prioridad"]["sugerencia"], "Sugerencia de la pregunta 2")
        self.assertEqual(resumen["prioridad"]["area"], area_de_la_pregunta(Puesto.BACKEND, 2).value)

    def test_el_criterio_mas_debil_es_el_de_menor_nivel_medio(self):
        # niveles_para reparte la suma llenando primero corrección y después
        # completitud, así que claridad queda siempre por debajo.
        resumen = self._resumen(self._entrevista([58, 58, 58, 58, 58]))

        self.assertEqual(resumen["criterios"], {"correccion": 4.0, "completitud": 3.0, "claridad": 0.0})
        self.assertEqual(resumen["criterio_mas_debil"], {"codigo": "claridad", "nombre": "Claridad"})

    def test_empate_en_la_prioridad_gana_la_pregunta_de_menor_numero(self):
        resumen = self._resumen(self._entrevista([75, 58, 75, 58, 75]))

        self.assertEqual(resumen["prioridad"]["numero"], 2)

    def test_primera_entrevista_del_puesto_no_tiene_comparacion(self):
        resumen = self._resumen(self._entrevista([75] * PREGUNTAS_POR_ENTREVISTA))

        self.assertIsNone(resumen["comparacion"])

    def test_compara_con_la_anterior_del_mismo_puesto_y_nivel(self):
        anterior = self._entrevista([42, 67, 67, 67, 67])  # 62
        actual = self._entrevista([58, 75, 75, 75, 67])  # 70

        comparacion = self._resumen(actual)["comparacion"]

        self.assertEqual(float(anterior.puntuacion_promedio), 62.0)
        self.assertEqual(comparacion, {"entrevista_id": anterior.pk, "diferencia": 8.0})

    def test_otro_nivel_no_cuenta_como_anterior(self):
        self._entrevista([75] * PREGUNTAS_POR_ENTREVISTA, nivel="semi_senior")
        actual = self._entrevista([75] * PREGUNTAS_POR_ENTREVISTA, nivel="junior")

        self.assertIsNone(self._resumen(actual)["comparacion"])

    def test_la_comparacion_no_mira_entrevistas_posteriores(self):
        primera = self._entrevista([75] * PREGUNTAS_POR_ENTREVISTA)
        self._entrevista([92] * PREGUNTAS_POR_ENTREVISTA)

        self.assertIsNone(self._resumen(primera)["comparacion"])

    def test_evaluaciones_antiguas_sin_niveles(self):
        entrevista = self._entrevista([75, 58, 92, 67, 83])
        Evaluacion.objects.filter(intercambio__entrevista=entrevista).update(evaluacion_json={})

        resumen = self._resumen(entrevista)

        self.assertIsNone(resumen["criterios"])
        self.assertIsNone(resumen["criterio_mas_debil"])
        self.assertEqual(resumen["criterios_sobre"], 0)
        self.assertEqual(resumen["prioridad"]["numero"], 2)

    def test_en_progreso_el_resumen_es_nulo(self):
        proveedor = ProveedorConNotas([75])
        entrevista = servicio.iniciar(self.usuario, puesto_de("backend"), nivel_de("junior"), proveedor=proveedor)
        servicio.responder(entrevista, "Una", proveedor=proveedor)

        respuesta = self.client.get(f"/api/entrevistas/{entrevista.pk}/resultados/")

        self.assertIn("resumen", respuesta.data)
        self.assertIsNone(respuesta.data["resumen"])

    def test_consultar_resultados_no_llama_a_la_ia(self):
        entrevista = self._entrevista([75] * PREGUNTAS_POR_ENTREVISTA)
        prohibido = mock.Mock(side_effect=AssertionError("Los resultados no deben llamar a la IA"))

        # Se parchea donde se usa, no donde se define: una referencia copiada
        # con `from ... import` no ve el parche en el módulo de origen.
        with mock.patch("apps.entrevistas.services.get_proveedor", prohibido), mock.patch.object(
            FakeProveedorIA, "evaluar_respuesta", prohibido
        ), mock.patch.object(FakeProveedorIA, "generar_pregunta", prohibido):
            resumen = self._resumen(entrevista)

        self.assertIsNotNone(resumen)
        prohibido.assert_not_called()

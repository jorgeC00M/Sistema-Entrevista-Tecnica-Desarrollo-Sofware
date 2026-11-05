"""Verifica que cada pregunta guarda su propia área (leída del reporte), que
el viejo /api/estadisticas/ ya no existe y que cualquier nota se reconstruye a
mano desde su JSON. Las entrevistas se arman completas y conocidas, y se
comprueban los valores exactos que deberían salir.
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


class EndpointDeEstadisticasRetiradoTest(APITestCase):
    """`/api/estadisticas/` alimentó primero las cifras del encabezado del
    historial y después la retroalimentación acumulada; las dos se quitaron
    (`quitar-retroalimentacion-acumulada`): la retroalimentación vive en el
    reporte de cada entrevista."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    def test_el_prefijo_y_la_retroalimentacion_ya_no_existen(self):
        for url in ("/api/estadisticas/", "/api/estadisticas/retroalimentacion/"):
            with self.subTest(url=url):
                self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)


class AreaPorPreguntaTest(APITestCase):
    """El área vive en cada intercambio, no en la entrevista: el puesto reparte
    los temas entre sus preguntas. Se lee del reporte, que es donde el usuario
    la ve."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado"
        )
        self.client.force_authenticate(self.usuario)

    def _areas(self, entrevista):
        respuesta = self.client.get(f"/api/entrevistas/{entrevista.pk}/resultados/")
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        return {intercambio["area"] for intercambio in respuesta.data["intercambios"]}

    def test_una_entrevista_reparte_los_temas_que_cubre_el_puesto(self):
        entrevista = _completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 92)

        self.assertEqual(self._areas(entrevista), {a.value for a in areas_que_cubre(Puesto.BACKEND)})

    def test_dos_puestos_distintos_tocan_conjuntos_de_areas_distintos(self):
        """Elegir Backend o Frontend cambia los temas que se evalúan: es lo que
        hace que el puesto signifique algo y no sea solo una etiqueta."""
        del_backend = self._areas(_completar_entrevista(self.usuario, puesto_de("backend"), nivel_de("junior"), 67))
        del_frontend = self._areas(_completar_entrevista(self.usuario, puesto_de("frontend"), nivel_de("junior"), 67))

        # El frontend aporta temas que el backend no toca.
        self.assertTrue(del_frontend - del_backend)


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


if __name__ == "__main__":
    import unittest

    unittest.main()

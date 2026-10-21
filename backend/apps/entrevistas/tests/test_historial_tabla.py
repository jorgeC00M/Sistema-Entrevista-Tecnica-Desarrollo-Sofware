"""`puntuacion_parcial` en el historial: la nota de lo respondido, solo en una abandonada."""

from django.db import connection
from django.test.utils import CaptureQueriesContext

from apps.entrevistas.models import Entrevista
from apps.evaluaciones.models import Evaluacion
from tests.conftest import TestDeAPI, crear_entrevista, crear_intercambio

URL = "/api/entrevistas/"


def _responder(entrevista, *notas):
    """Intercambios respondidos y calificados con estas notas, en orden."""
    for numero, nota in enumerate(notas, start=1):
        intercambio = crear_intercambio(entrevista, numero=numero, respuesta=f"Respuesta {numero}")
        Evaluacion.objects.create(
            intercambio=intercambio,
            puntuacion=nota,
            fortalezas="f",
            debilidades="d",
            sugerencias="s",
            evaluacion_json={},
            proveedor_ia="fake",
            modelo_ia="fake",
        )


class PuntuacionParcialTest(TestDeAPI):
    def _del_historial(self, entrevista) -> dict:
        return next(e for e in self.client.get(URL).data if e["id"] == entrevista.pk)

    def test_una_abandonada_publica_la_media_de_lo_respondido(self):
        entrevista = crear_entrevista(self.usuario, puesto="backend", estado=Entrevista.Estado.ABANDONADA)
        _responder(entrevista, 50, 42)

        fila = self._del_historial(entrevista)

        self.assertEqual(fila["puntuacion_parcial"], 46)
        self.assertIsNone(fila["puntuacion_promedio"])
        # La misma nota que su reporte: el historial no inventa otra cuenta.
        resumen = self.client.get(f"{URL}{entrevista.pk}/resultados/").data["resumen"]
        self.assertEqual(resumen["promedio"], fila["puntuacion_parcial"])

    def test_una_abandonada_sin_respuestas_no_tiene_nota(self):
        entrevista = crear_entrevista(self.usuario, estado=Entrevista.Estado.ABANDONADA)

        self.assertIsNone(self._del_historial(entrevista)["puntuacion_parcial"])

    def test_una_en_curso_no_publica_ninguna_nota(self):
        """La regla de siempre: nada de la calificación sale antes de terminar."""
        entrevista = crear_entrevista(self.usuario)
        _responder(entrevista, 75, 83)

        fila = self._del_historial(entrevista)

        self.assertIsNone(fila["puntuacion_parcial"])
        self.assertIsNone(fila["puntuacion_promedio"])

    def test_una_finalizada_usa_su_nota_y_no_la_parcial(self):
        entrevista = crear_entrevista(
            self.usuario, estado=Entrevista.Estado.FINALIZADA, puntuacion_promedio=75
        )
        _responder(entrevista, 75, 75, 75, 75, 75)

        fila = self._del_historial(entrevista)

        self.assertIsNone(fila["puntuacion_parcial"])
        self.assertEqual(fila["puntuacion_promedio"], 75)

    def test_el_historial_no_hace_una_consulta_por_entrevista(self):
        def consultas() -> int:
            with CaptureQueriesContext(connection) as capturadas:
                self.client.get(URL)
            return len(capturadas)

        _responder(crear_entrevista(self.usuario, estado=Entrevista.Estado.ABANDONADA), 50)
        con_una = consultas()

        for _ in range(3):
            _responder(crear_entrevista(self.usuario, estado=Entrevista.Estado.ABANDONADA), 50, 42)

        self.assertEqual(consultas(), con_una)

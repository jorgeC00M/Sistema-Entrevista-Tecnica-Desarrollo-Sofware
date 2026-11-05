"""La columna de nota del historial: solo una finalizada la tiene."""

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


class NotaEnElHistorialTest(TestDeAPI):
    def _del_historial(self, entrevista) -> dict:
        return next(e for e in self.client.get(URL).data if e["id"] == entrevista.pk)

    def test_no_hay_nota_parcial(self):
        """Lo incompleto no se califica: ni abandonada ni con el tiempo agotado."""
        for estado in (Entrevista.Estado.ABANDONADA, Entrevista.Estado.TIEMPO_AGOTADO):
            with self.subTest(estado=estado):
                entrevista = crear_entrevista(self.usuario, puesto="backend", estado=estado)
                _responder(entrevista, 50, 42)

                fila = self._del_historial(entrevista)

                self.assertNotIn("puntuacion_parcial", fila)
                self.assertIsNone(fila["puntuacion_promedio"])

    def test_una_en_curso_no_publica_ninguna_nota(self):
        """La regla de siempre: nada de la calificación sale antes de terminar."""
        entrevista = crear_entrevista(self.usuario)
        _responder(entrevista, 75, 83)

        self.assertIsNone(self._del_historial(entrevista)["puntuacion_promedio"])

    def test_una_finalizada_publica_su_nota(self):
        entrevista = crear_entrevista(
            self.usuario, estado=Entrevista.Estado.FINALIZADA, puntuacion_promedio=75
        )
        _responder(entrevista, 75, 75, 75, 75, 75)

        self.assertEqual(self._del_historial(entrevista)["puntuacion_promedio"], 75)

    def test_el_historial_no_hace_una_consulta_por_entrevista(self):
        def consultas() -> int:
            with CaptureQueriesContext(connection) as capturadas:
                self.client.get(URL)
            return len(capturadas)

        _responder(crear_entrevista(self.usuario, estado=Entrevista.Estado.FINALIZADA), 50)
        con_una = consultas()

        for _ in range(3):
            _responder(crear_entrevista(self.usuario, estado=Entrevista.Estado.FINALIZADA), 50, 42)

        self.assertEqual(consultas(), con_una)

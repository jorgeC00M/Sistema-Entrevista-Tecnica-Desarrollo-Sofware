from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas.models import Entrevista
from integrations.ia.prompts.schemas import (
    PREGUNTAS_DE_CALENTAMIENTO,
    PREGUNTAS_POR_ENTREVISTA,
)

Usuario = get_user_model()


class FlujoDeEntrevistaPorHttpTest(APITestCase):
    """Recorre una entrevista completa exclusivamente por HTTP, autenticado,
    sin tocar el ORM ni el shell de Django — tal como lo haría el frontend.
    """

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )
        self.client.force_authenticate(self.usuario)

    def test_entrevista_completa_de_principio_a_fin(self):
        inicio = self.client.post(
            "/api/entrevistas/", {"puesto": "backend", "nivel": "basico"}
        )
        self.assertEqual(inicio.status_code, status.HTTP_201_CREATED)
        entrevista_id = inicio.data["entrevista"]["id"]
        self.assertEqual(inicio.data["pregunta"]["numero"], 1)
        self.assertEqual(inicio.data["entrevista"]["estado"], "en_progreso")

        for numero_esperado in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
            respuesta = self.client.post(
                f"/api/entrevistas/{entrevista_id}/responder/",
                {"respuesta": f"Mi respuesta a la pregunta {numero_esperado}"},
            )
            self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
            # La calificación no viaja en la respuesta: se publica solo al
            # terminar. Que sí se haya calculado se comprueba más abajo, contra
            # la base de datos.
            self.assertNotIn("evaluacion", respuesta.data)

            if numero_esperado < PREGUNTAS_POR_ENTREVISTA:
                self.assertIsNotNone(respuesta.data["siguiente_pregunta"])
                self.assertEqual(respuesta.data["siguiente_pregunta"]["numero"], numero_esperado + 1)
            else:
                self.assertIsNone(respuesta.data["siguiente_pregunta"])
                self.assertEqual(respuesta.data["entrevista"]["estado"], "finalizada")

        historial = self.client.get("/api/entrevistas/")
        self.assertEqual(historial.status_code, status.HTTP_200_OK)
        self.assertEqual(len(historial.data), 1)

        resultados = self.client.get(f"/api/entrevistas/{entrevista_id}/resultados/")
        self.assertEqual(resultados.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resultados.data["intercambios"]), PREGUNTAS_POR_ENTREVISTA)
        for intercambio in resultados.data["intercambios"]:
            self.assertIsNotNone(intercambio["evaluacion"])

    def test_la_calificacion_no_se_publica_hasta_terminar(self):
        """La nota se calcula tras cada respuesta —es lo que calibra la
        exigencia de las siguientes— pero no sale por la API hasta el final.

        Se comprueba contra `/resultados/` y no solo en pantalla porque ese es el
        endpoint que el chat usa para reconstruirse al recargar: si filtrara las
        evaluaciones, la nota quedaría visible en la pestaña de red del
        navegador, que es lo mismo que mostrarla.
        """
        from apps.evaluaciones.models import Evaluacion

        inicio = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]
        self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Mi respuesta"}
        )

        en_curso = self.client.get(f"/api/entrevistas/{entrevista_id}/resultados/")

        self.assertEqual(en_curso.data["entrevista"]["estado"], "en_progreso")
        for intercambio in en_curso.data["intercambios"]:
            self.assertIsNone(intercambio["evaluacion"])
        # La pregunta y la respuesta sí viajan: el chat las necesita para
        # reconstruir el hilo al recargar.
        respondidos = [i for i in en_curso.data["intercambios"] if i["respuesta"]]
        self.assertEqual(len(respondidos), 1)
        # Y la evaluación existe de verdad, solo que no se publica.
        self.assertEqual(
            Evaluacion.objects.filter(intercambio__entrevista_id=entrevista_id).count(), 1
        )

        for _ in range(PREGUNTAS_POR_ENTREVISTA - 1):
            self.client.post(
                f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Otra respuesta"}
            )

        terminada = self.client.get(f"/api/entrevistas/{entrevista_id}/resultados/")

        self.assertEqual(terminada.data["entrevista"]["estado"], "finalizada")
        for intercambio in terminada.data["intercambios"]:
            self.assertIsNotNone(intercambio["evaluacion"])

    def test_una_entrevista_abandonada_si_muestra_sus_evaluaciones(self):
        """Coherente con la retroalimentación acumulada, que a propósito incluye
        las entrevistas dejadas a medias: una debilidad detectada en la pregunta
        2 sigue siendo real aunque no se haya terminado."""
        inicio = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]
        self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Mi respuesta"}
        )

        Entrevista.objects.filter(pk=entrevista_id).update(
            estado=Entrevista.Estado.ABANDONADA
        )

        resultados = self.client.get(f"/api/entrevistas/{entrevista_id}/resultados/")

        calificados = [i for i in resultados.data["intercambios"] if i["evaluacion"]]
        self.assertEqual(len(calificados), 1)

    def test_las_dos_primeras_preguntas_se_crean_al_iniciar(self):
        """El calentamiento se pide en una sola llamada: ninguna de las dos
        puede ser adaptativa todavía, y la segunda se adaptaría a un único dato,
        que es ruido. Responder la primera no debe crear una tercera."""
        inicio = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]
        entrevista = Entrevista.objects.get(pk=entrevista_id)

        self.assertEqual(entrevista.intercambios.count(), PREGUNTAS_DE_CALENTAMIENTO)

        self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Mi respuesta"}
        )

        # Sigue habiendo dos: la segunda ya existía, no se genera de nuevo.
        self.assertEqual(entrevista.intercambios.count(), PREGUNTAS_DE_CALENTAMIENTO)

        self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Otra respuesta"}
        )

        # Al responder la segunda sí se genera la tercera, ya con desempeño previo.
        self.assertEqual(entrevista.intercambios.count(), PREGUNTAS_DE_CALENTAMIENTO + 1)

    def test_detalle_muestra_la_pregunta_pendiente(self):
        inicio = self.client.post("/api/entrevistas/", {"puesto": "frontend", "nivel": "intermedio"})
        entrevista_id = inicio.data["entrevista"]["id"]

        detalle = self.client.get(f"/api/entrevistas/{entrevista_id}/")

        self.assertEqual(detalle.status_code, status.HTTP_200_OK)
        self.assertEqual(detalle.data["pregunta_pendiente"]["numero"], 1)

    def test_responder_una_entrevista_finalizada_devuelve_conflicto(self):
        inicio = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]

        for numero in range(1, PREGUNTAS_POR_ENTREVISTA + 1):
            self.client.post(
                f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": f"Respuesta {numero}"}
            )

        extra = self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": "Una respuesta de más"}
        )
        self.assertEqual(extra.status_code, status.HTTP_409_CONFLICT)

    def test_area_invalida_es_rechazada(self):
        respuesta = self.client.post(
            "/api/entrevistas/", {"puesto": "cocinero", "nivel": "basico"}
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_respuesta_vacia_es_rechazada(self):
        inicio = self.client.post("/api/entrevistas/", {"puesto": "backend", "nivel": "basico"})
        entrevista_id = inicio.data["entrevista"]["id"]

        respuesta = self.client.post(
            f"/api/entrevistas/{entrevista_id}/responder/", {"respuesta": ""}
        )
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_endpoints_sin_autenticar_son_rechazados(self):
        self.client.force_authenticate(None)
        respuesta = self.client.get("/api/entrevistas/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)


if __name__ == "__main__":
    import unittest

    unittest.main()

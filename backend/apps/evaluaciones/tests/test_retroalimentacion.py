"""Verifica /api/estadisticas/retroalimentacion/.

Es la vista con las agregaciones más complejas del proyecto (conteo por banda
construido dinámicamente desde `rubricas.BANDAS`) y la que hasta ahora no
tenía ninguna prueba. El caso que más importa es el último: a diferencia de
las estadísticas, la retroalimentación incluye entrevistas sin terminar,
porque una debilidad detectada a mitad de camino sigue siendo real.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.entrevistas.models import Entrevista
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.schemas import (
    PREGUNTAS_POR_ENTREVISTA,
    Puesto,
    area_de_la_pregunta,
)
from tests.conftest import crear_usuario, nivel_de, niveles_para, puesto_de

Usuario = get_user_model()


class ProveedorPuntuacionFija(FakeProveedorIA):
    def __init__(self, puntuacion):
        super().__init__()
        self._puntuacion = puntuacion

    def evaluar_respuesta(self, contexto, area, pregunta, respuesta):
        from integrations.ia.prompts.schemas import parsear_evaluacion

        return parsear_evaluacion(
            {
                "niveles": niveles_para(self._puntuacion),
                "fortalezas": "Definiste bien el concepto",
                "debilidades": "Faltó mencionar la complejidad",
                "sugerencias": "Repasa costes de las operaciones",
                "puntos_clave": ["Primer punto", "Segundo punto"],
            }
        )


class RetroalimentacionTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.puesto = puesto_de("backend")
        self.nivel = nivel_de("junior")

    def _responder(self, entrevista, veces, puntuacion):
        proveedor = ProveedorPuntuacionFija(puntuacion)
        for _ in range(veces):
            servicio.responder(entrevista, "Una respuesta", proveedor=proveedor)

    def test_sin_evaluaciones_devuelve_estructura_vacia(self):
        respuesta = self.client.get("/api/estadisticas/retroalimentacion/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["total_respuestas_evaluadas"], 0)
        self.assertEqual(respuesta.data["por_area"], [])
        self.assertEqual(respuesta.data["observaciones"], [])

    def test_requiere_autenticacion(self):
        self.client.force_authenticate(user=None)
        respuesta = self.client.get("/api/estadisticas/retroalimentacion/")
        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_agrupa_por_area_con_promedio_y_bandas(self):
        proveedor = ProveedorPuntuacionFija(90)
        entrevista = servicio.iniciar(self.usuario, self.puesto, self.nivel, proveedor=proveedor)
        self._responder(entrevista, veces=2, puntuacion=92)

        respuesta = self.client.get("/api/estadisticas/retroalimentacion/")

        self.assertEqual(respuesta.data["total_respuestas_evaluadas"], 2)

        # Las dos primeras preguntas de Backend son de temas distintos, así que
        # cada una forma su propio grupo: eso es justamente lo que el desglose
        # por área debe reflejar ahora.
        por_area = {fila["area"]: fila for fila in respuesta.data["por_area"]}
        esperadas = {area_de_la_pregunta(Puesto.BACKEND, n).value for n in (1, 2)}
        self.assertEqual(set(por_area), esperadas)

        for codigo, fila in por_area.items():
            with self.subTest(area=codigo):
                self.assertEqual(fila["total_respuestas"], 1)
                self.assertEqual(fila["promedio"], 92)
                # 90 cae en la banda "solido"; el resto quedan en cero.
                self.assertEqual(fila["bandas"]["solido"], 1)
                self.assertEqual(fila["bandas"]["insuficiente"], 0)
                self.assertEqual(fila["bandas"]["en_desarrollo"], 0)
                self.assertEqual(fila["bandas"]["aceptable"], 0)

    def test_las_observaciones_traen_el_detalle_de_cada_respuesta(self):
        proveedor = ProveedorPuntuacionFija(50)
        entrevista = servicio.iniciar(self.usuario, self.puesto, self.nivel, proveedor=proveedor)
        self._responder(entrevista, veces=1, puntuacion=50)

        respuesta = self.client.get("/api/estadisticas/retroalimentacion/")

        observacion = respuesta.data["observaciones"][0]
        self.assertEqual(observacion["entrevista_id"], entrevista.pk)
        self.assertEqual(observacion["numero"], 1)
        self.assertEqual(observacion["puntuacion"], 50)
        self.assertEqual(observacion["banda"], "en_desarrollo")
        self.assertEqual(observacion["debilidades"], "Faltó mencionar la complejidad")
        self.assertEqual(observacion["sugerencias"], "Repasa costes de las operaciones")

    def test_incluye_entrevistas_no_finalizadas(self):
        """Una entrevista abandonada a mitad sigue aportando sus respuestas ya
        evaluadas: una debilidad detectada no deja de serlo por no terminar."""
        proveedor = ProveedorPuntuacionFija(70)
        entrevista = servicio.iniciar(self.usuario, self.puesto, self.nivel, proveedor=proveedor)
        self._responder(entrevista, veces=2, puntuacion=67)
        Entrevista.objects.filter(pk=entrevista.pk).update(
            estado=Entrevista.Estado.ABANDONADA
        )

        retro = self.client.get("/api/estadisticas/retroalimentacion/")

        self.assertEqual(retro.data["total_respuestas_evaluadas"], 2)

    def test_no_mezcla_datos_de_otro_usuario(self):
        otro = crear_usuario(email="otro@example.com")
        proveedor = ProveedorPuntuacionFija(83)
        ajena = servicio.iniciar(otro, self.puesto, self.nivel, proveedor=proveedor)
        servicio.responder(ajena, "Una respuesta", proveedor=proveedor)

        respuesta = self.client.get("/api/estadisticas/retroalimentacion/")

        self.assertEqual(respuesta.data["total_respuestas_evaluadas"], 0)

    def test_el_tope_de_observaciones_se_respeta(self):
        from apps.evaluaciones.selectors import MAXIMO_OBSERVACIONES

        proveedor = ProveedorPuntuacionFija(75)
        # Cada entrevista aporta PREGUNTAS_POR_ENTREVISTA evaluaciones.
        entrevistas_necesarias = (MAXIMO_OBSERVACIONES // PREGUNTAS_POR_ENTREVISTA) + 1
        for _ in range(entrevistas_necesarias):
            entrevista = servicio.iniciar(self.usuario, self.puesto, self.nivel, proveedor=proveedor)
            self._responder(entrevista, veces=PREGUNTAS_POR_ENTREVISTA, puntuacion=75)

        respuesta = self.client.get("/api/estadisticas/retroalimentacion/")

        self.assertGreater(
            respuesta.data["total_respuestas_evaluadas"], MAXIMO_OBSERVACIONES
        )
        self.assertEqual(len(respuesta.data["observaciones"]), MAXIMO_OBSERVACIONES)

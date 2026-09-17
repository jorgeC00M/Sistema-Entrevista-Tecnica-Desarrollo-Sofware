"""Verifica /api/estadisticas/: promedio general, promedio por área y
evolución cronológica, calculados con agregaciones reales sobre PostgreSQL —
no reimplementadas en Python en la prueba, para no validar el cálculo contra
sí mismo. Se arman entrevistas completas conocidas y se comprueban los
números exactos que deberían salir.
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from entrevistas.services import entrevista as servicio
from entrevistas.services.ia.fake import FakeProveedorIA
from entrevistas.services.ia.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica, Nivel

Usuario = get_user_model()


class ProveedorPuntuacionFija(FakeProveedorIA):
    """Como FakeProveedorIA, pero con puntuación configurable en vez de fija
    en 75 — necesario para construir escenarios con promedios conocidos.
    """

    def __init__(self, puntuacion):
        super().__init__()
        self._puntuacion = puntuacion

    def evaluar_respuesta(self, area, nivel, pregunta, respuesta):
        from entrevistas.services.ia.schemas import parsear_evaluacion

        return parsear_evaluacion(
            {
                "puntuacion": self._puntuacion,
                "fortalezas": "ok",
                "debilidades": "ok",
                "sugerencias": "ok",
            }
        )


def _completar_entrevista(usuario, area, nivel, puntuacion):
    proveedor = ProveedorPuntuacionFija(puntuacion)
    entrevista = servicio.iniciar(usuario, area, nivel, proveedor=proveedor)
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
        _completar_entrevista(self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, 60)
        _completar_entrevista(self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, 80)

        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(float(respuesta.data["promedio_general"]), 70.0)
        self.assertEqual(respuesta.data["entrevistas_completadas"], 2)

    def test_promedio_por_area_agrupa_correctamente(self):
        _completar_entrevista(self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, 90)
        _completar_entrevista(self.usuario, AreaTecnica.BASES_DE_DATOS, Nivel.BASICO, 50)

        respuesta = self.client.get("/api/estadisticas/")

        por_area = {fila["area"]: fila for fila in respuesta.data["promedio_por_area"]}
        self.assertEqual(float(por_area["programacion"]["promedio"]), 90.0)
        self.assertEqual(por_area["programacion"]["entrevistas"], 1)
        self.assertEqual(float(por_area["bases_de_datos"]["promedio"]), 50.0)
        self.assertEqual(por_area["programacion"]["area_display"], "Programación")

    def test_dos_entrevistas_de_la_misma_area_muestran_variacion(self):
        """Criterio de aceptación del incremento: tras completar dos
        entrevistas de la misma área, se puede observar la variación de
        desempeño entre ambas.
        """
        _completar_entrevista(self.usuario, AreaTecnica.DESARROLLO_WEB, Nivel.BASICO, 40)
        _completar_entrevista(self.usuario, AreaTecnica.DESARROLLO_WEB, Nivel.BASICO, 95)

        respuesta = self.client.get("/api/estadisticas/")

        evolucion = respuesta.data["evolucion"]
        self.assertEqual(len(evolucion), 2)
        puntuaciones = [float(e["puntuacion_promedio"]) for e in evolucion]
        self.assertEqual(puntuaciones, [40.0, 95.0])
        self.assertNotEqual(puntuaciones[0], puntuaciones[1])

    def test_evolucion_esta_ordenada_cronologicamente(self):
        primera = _completar_entrevista(self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, 70)
        segunda = _completar_entrevista(self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, 85)

        respuesta = self.client.get("/api/estadisticas/")

        ids = [e["entrevista_id"] for e in respuesta.data["evolucion"]]
        self.assertEqual(ids, [primera.id, segunda.id])

    def test_entrevistas_en_progreso_no_cuentan(self):
        servicio.iniciar(self.usuario, AreaTecnica.PROGRAMACION, Nivel.BASICO, proveedor=FakeProveedorIA())

        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.data["entrevistas_completadas"], 0)
        self.assertIsNone(respuesta.data["promedio_general"])

    def test_solo_cuenta_entrevistas_del_usuario_autenticado(self):
        otro = Usuario.objects.create_user(
            email="otro@example.com", password="clave-segura-123", nombre_completo="Otro"
        )
        _completar_entrevista(otro, AreaTecnica.PROGRAMACION, Nivel.BASICO, 100)

        respuesta = self.client.get("/api/estadisticas/")

        self.assertEqual(respuesta.data["entrevistas_completadas"], 0)


if __name__ == "__main__":
    import unittest

    unittest.main()

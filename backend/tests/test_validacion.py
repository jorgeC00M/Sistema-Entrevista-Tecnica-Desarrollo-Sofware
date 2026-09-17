import unittest

from entrevistas.services.ia import RespuestaIAInvalida
from entrevistas.services.ia.schemas import parsear_evaluacion, parsear_pregunta


def _datos_validos():
    return {
        "puntuacion": 80,
        "fortalezas": "Buen manejo de conceptos.",
        "debilidades": "Poca profundidad.",
        "sugerencias": "Agrega un ejemplo.",
    }


class ValidacionEvaluacionTest(unittest.TestCase):
    """La salida del LLM es entrada externa no confiable: el contrato debe
    rechazar lo que no cumple, aunque la decodificación restringida del
    proveedor ya garantice la forma del JSON.
    """

    def test_acepta_evaluacion_bien_formada(self):
        evaluacion = parsear_evaluacion(_datos_validos())
        self.assertEqual(evaluacion.puntuacion, 80)
        self.assertEqual(evaluacion.fortalezas, "Buen manejo de conceptos.")

    def test_rechaza_puntuacion_fuera_de_rango_por_arriba(self):
        datos = _datos_validos()
        datos["puntuacion"] = 150
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_puntuacion_fuera_de_rango_por_abajo(self):
        datos = _datos_validos()
        datos["puntuacion"] = -5
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_puntuacion_no_numerica(self):
        datos = _datos_validos()
        datos["puntuacion"] = "excelente"
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_booleano_como_puntuacion(self):
        datos = _datos_validos()
        datos["puntuacion"] = True
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_convierte_puntuacion_enviada_como_texto(self):
        datos = _datos_validos()
        datos["puntuacion"] = "85"
        self.assertEqual(parsear_evaluacion(datos).puntuacion, 85)

    def test_rechaza_campo_faltante(self):
        datos = _datos_validos()
        del datos["sugerencias"]
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_campo_vacio(self):
        datos = _datos_validos()
        datos["fortalezas"] = "   "
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_algo_que_no_es_un_objeto(self):
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(["no", "es", "un", "objeto"])


class ValidacionPreguntaTest(unittest.TestCase):
    def test_acepta_pregunta_bien_formada(self):
        pregunta = parsear_pregunta({"pregunta": "¿Qué es la normalización?"}, numero=2)
        self.assertEqual(pregunta.numero, 2)
        self.assertEqual(pregunta.texto, "¿Qué es la normalización?")

    def test_rechaza_pregunta_vacia(self):
        with self.assertRaises(RespuestaIAInvalida):
            parsear_pregunta({"pregunta": ""}, numero=1)

    def test_rechaza_pregunta_ausente(self):
        with self.assertRaises(RespuestaIAInvalida):
            parsear_pregunta({}, numero=1)


if __name__ == "__main__":
    unittest.main()

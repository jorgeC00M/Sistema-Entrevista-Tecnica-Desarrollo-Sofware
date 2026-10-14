import unittest

from integrations.ia import RespuestaIAInvalida
from integrations.ia.prompts.schemas import (
    CRITERIOS,
    NIVEL_MAXIMO,
    Niveles,
    parsear_evaluacion,
    parsear_pregunta,
)


def _datos_validos():
    return {
        "niveles": {"correccion": 3, "completitud": 2, "claridad": 3},
        "fortalezas": "Buen manejo de conceptos.",
        "debilidades": "Poca profundidad.",
        "sugerencias": "Agrega un ejemplo.",
        "puntos_clave": ["Definir un índice.", "Explicar su costo en escrituras."],
    }


class ValidacionEvaluacionTest(unittest.TestCase):
    """La salida del LLM es entrada externa no confiable: el contrato debe
    rechazar lo que no cumple, aunque la decodificación restringida del
    proveedor ya garantice la forma del JSON.
    """

    def test_acepta_evaluacion_bien_formada(self):
        evaluacion = parsear_evaluacion(_datos_validos())
        self.assertEqual(evaluacion.niveles, Niveles(correccion=3, completitud=2, claridad=3))
        self.assertEqual(evaluacion.fortalezas, "Buen manejo de conceptos.")

    def test_acepta_los_extremos_de_la_escala(self):
        for nivel in (0, NIVEL_MAXIMO):
            with self.subTest(nivel=nivel):
                datos = _datos_validos()
                datos["niveles"] = dict.fromkeys(CRITERIOS, nivel)
                self.assertEqual(parsear_evaluacion(datos).niveles.como_dict(), dict.fromkeys(CRITERIOS, nivel))

    def test_rechaza_nivel_fuera_de_rango_por_arriba(self):
        datos = _datos_validos()
        datos["niveles"]["completitud"] = 5
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_nivel_negativo(self):
        datos = _datos_validos()
        datos["niveles"]["claridad"] = -1
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_nivel_no_numerico(self):
        datos = _datos_validos()
        datos["niveles"]["correccion"] = "excelente"
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_booleano_como_nivel(self):
        datos = _datos_validos()
        datos["niveles"]["correccion"] = True
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_convierte_nivel_enviado_como_texto(self):
        datos = _datos_validos()
        datos["niveles"]["claridad"] = "4"
        self.assertEqual(parsear_evaluacion(datos).niveles.claridad, 4)

    def test_rechaza_criterio_faltante(self):
        datos = _datos_validos()
        del datos["niveles"]["completitud"]
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_niveles_ausentes(self):
        datos = _datos_validos()
        del datos["niveles"]
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_ignora_una_puntuacion_escrita_por_el_modelo(self):
        """La nota es una fórmula sobre los niveles; si el modelo la escribe por
        su cuenta, no se le cree."""
        datos = _datos_validos()
        datos["puntuacion"] = 99
        evaluacion = parsear_evaluacion(datos)
        self.assertFalse(hasattr(evaluacion, "puntuacion"))
        self.assertEqual(evaluacion.niveles.como_dict(), _datos_validos()["niveles"])

    def test_conserva_los_puntos_clave(self):
        evaluacion = parsear_evaluacion(_datos_validos())
        self.assertEqual(evaluacion.puntos_clave, ("Definir un índice.", "Explicar su costo en escrituras."))

    def test_recorta_los_puntos_clave_a_cuatro(self):
        datos = _datos_validos()
        datos["puntos_clave"] = [f"Punto {n}" for n in range(1, 7)]
        self.assertEqual(parsear_evaluacion(datos).puntos_clave, ("Punto 1", "Punto 2", "Punto 3", "Punto 4"))

    def test_rechaza_un_solo_punto_clave(self):
        datos = _datos_validos()
        datos["puntos_clave"] = ["Solo uno"]
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_un_punto_clave_vacio(self):
        datos = _datos_validos()
        datos["puntos_clave"] = ["Definir un índice.", "   "]
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

    def test_rechaza_puntos_clave_ausentes(self):
        datos = _datos_validos()
        del datos["puntos_clave"]
        with self.assertRaises(RespuestaIAInvalida):
            parsear_evaluacion(datos)

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

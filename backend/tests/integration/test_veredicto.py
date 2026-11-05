"""El redactor del veredicto: resume las evaluaciones y nunca califica."""

import os
import unittest
from unittest import mock

from integrations.ia.base import RedactorDeVeredicto
from integrations.ia.cadena import ProveedorEnCadena
from integrations.ia.exceptions import ErrorTransitorio, RespuestaIAInvalida
from integrations.ia.factory import get_redactor_de_veredicto
from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts import veredicto
from integrations.ia.prompts.schemas import AreaTecnica, ContextoDeEntrevista, Nivel, Niveles, Puesto
from integrations.ia.prompts.veredicto import EntradaDeVeredicto, RespuestaEvaluada, parsear_veredicto

CONTEXTO = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.JUNIOR, tecnologia="Django")

ENTRADA = EntradaDeVeredicto(
    contexto=CONTEXTO,
    respuestas=(
        RespuestaEvaluada(
            numero=1,
            area=AreaTecnica.PROGRAMACION,
            puntuacion=75,
            niveles=Niveles(correccion=3, completitud=3, claridad=3),
            fortalezas="Explicaste bien la recursión.",
            debilidades="No mencionaste el caso base.",
        ),
        RespuestaEvaluada(
            numero=2,
            area=AreaTecnica.BASES_DE_DATOS,
            puntuacion=50,
            niveles=None,
            fortalezas="Conoces los índices.",
            debilidades="Faltaron las transacciones.",
        ),
    ),
)


def _parsear(texto):
    return parsear_veredicto({"veredicto": texto})


class ParsearVeredictoTest(unittest.TestCase):
    def test_un_resumen_neutro_pasa_con_los_espacios_colapsados(self):
        self.assertEqual(
            _parsear("  Explicas bien la recursión,  pero te faltaron las transacciones. "),
            "Explicas bien la recursión, pero te faltaron las transacciones.",
        )

    def test_vacio_o_ausente_es_invalido(self):
        for datos in ({"veredicto": "   "}, {}, {"veredicto": 3}):
            with self.subTest(datos=datos), self.assertRaises(RespuestaIAInvalida):
                parsear_veredicto(datos)

    def test_demasiado_largo_es_invalido(self):
        with self.assertRaises(RespuestaIAInvalida):
            _parsear("palabra " * (veredicto.MAXIMO_CARACTERES // 4))

    def test_una_nota_o_un_porcentaje_se_descartan(self):
        for texto in (
            "Obtuviste 75/100 en la entrevista.",
            "Tu nota fue 60 sobre 100.",
            "Sumaste 40 puntos en bases de datos.",
            "Cubriste el 80% de lo esperado.",
        ):
            with self.subTest(texto=texto), self.assertRaises(RespuestaIAInvalida):
                _parsear(texto)

    def test_juzgar_la_aptitud_se_descarta(self):
        for texto in ("Eres apto para el puesto de Backend.", "Estás calificado para postular.", "Pareces idóneo."):
            with self.subTest(texto=texto), self.assertRaises(RespuestaIAInvalida):
                _parsear(texto)

    def test_aptitudes_no_es_juzgar_la_aptitud(self):
        self.assertEqual(_parsear("Muestras aptitudes para el diseño."), "Muestras aptitudes para el diseño.")


class PromptDelVeredictoTest(unittest.TestCase):
    def test_no_lleva_el_texto_de_las_respuestas_sino_su_evaluacion(self):
        texto = veredicto.usuario(ENTRADA)
        self.assertIn("Pregunta 1 · Fundamentos de Programación · Corrección técnica 3/4", texto)
        self.assertIn("Debilidades: Faltaron las transacciones.", texto)
        self.assertIn("sin niveles por criterio", texto)
        self.assertNotIn("Respuesta", texto)


class RedactorTest(unittest.TestCase):
    def test_el_fake_redacta_un_texto_que_su_propio_parser_acepta(self):
        texto = FakeProveedorIA().redactar_veredicto(ENTRADA)
        self.assertIn("Bases de Datos", texto)
        self.assertEqual(parsear_veredicto({"veredicto": texto}), texto)

    def test_la_cadena_pasa_al_siguiente_si_el_primero_falla(self):
        class Falla(FakeProveedorIA):
            nombre = "gemini"

            def redactar_veredicto(self, entrada):
                raise ErrorTransitorio("429")

        cadena = ProveedorEnCadena([Falla(), FakeProveedorIA()])
        self.assertTrue(cadena.redactar_veredicto(ENTRADA))
        self.assertEqual(cadena.nombre, "fake")

    def test_la_fabrica_no_filtra_por_datos_personales(self):
        with mock.patch.dict(os.environ, {"DEEPSEEK_API_KEY": "clave"}):
            redactor = get_redactor_de_veredicto("deepseek,fake")
        self.assertIsInstance(redactor, ProveedorEnCadena)
        self.assertEqual([e.nombre for e in redactor.eslabones], ["deepseek", "fake"])
        self.assertIsInstance(get_redactor_de_veredicto("fake"), RedactorDeVeredicto)


if __name__ == "__main__":
    unittest.main()

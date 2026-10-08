"""Detección de idioma por palabras vacías, sin Django."""

import unittest

from integrations.documentos.idioma import detectar, son_distintos

ESPAÑOL = (
    "Desarrollador con experiencia en el diseño de APIs REST con Django y en la "
    "optimización de consultas para una base de datos PostgreSQL. Trabajé durante "
    "dos años como parte de un equipo ágil."
)
INGLES = (
    "We are looking for a Backend Developer with experience in the design of REST "
    "APIs. You will work with our team on the migration of services to the cloud "
    "and the optimization of queries."
)


class DetectarTest(unittest.TestCase):
    def test_reconoce_el_espanol(self):
        self.assertEqual(detectar(ESPAÑOL), "es")

    def test_reconoce_el_ingles(self):
        self.assertEqual(detectar(INGLES), "en")

    def test_un_texto_corto_no_se_afirma(self):
        self.assertIsNone(detectar("Python, Django, PostgreSQL, Docker"))

    def test_una_mezcla_equilibrada_no_se_afirma(self):
        self.assertIsNone(detectar(ESPAÑOL + " " + INGLES))

    def test_los_nombres_de_tecnologias_no_vuelven_ingles_un_cv_en_espanol(self):
        self.assertEqual(detectar(ESPAÑOL + " React, Node.js, Docker, Kubernetes, AWS, GraphQL"), "es")


class SonDistintosTest(unittest.TestCase):
    def test_espanol_contra_ingles(self):
        self.assertTrue(son_distintos(ESPAÑOL, INGLES))

    def test_mismo_idioma(self):
        self.assertFalse(son_distintos(ESPAÑOL, ESPAÑOL))

    def test_si_uno_es_ambiguo_no_se_avisa(self):
        self.assertFalse(son_distintos(ESPAÑOL, "Python, Django"))

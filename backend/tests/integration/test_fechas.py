"""Experiencia calculada a partir de las fechas del CV, sin Django.

`hoy` se fija en todos los tests: un periodo abierto ("– Actualidad") llega hasta
la fecha del análisis, y sin fijarla estos resultados cambiarían con el
calendario.
"""

import unittest
from datetime import date

from integrations.documentos.fechas import (
    describir,
    experiencia,
    formatos_presentes,
    meses_de_experiencia,
    periodos,
)

HOY = date(2026, 6, 15)


class PeriodosTest(unittest.TestCase):
    def test_los_extremos_son_inclusivos(self):
        (periodo,) = periodos("Ene 2020 - Dic 2020", HOY)

        self.assertEqual(periodo.meses, 12)

    def test_un_periodo_abierto_llega_hasta_hoy(self):
        (periodo,) = periodos("Ene 2026 - Actualidad", HOY)

        self.assertEqual(periodo.meses, 6)

    def test_se_leen_los_formatos_numericos_y_cortos(self):
        lista = periodos("03/2020 - 2021-02\nfeb '16 - dic '21", HOY)

        self.assertEqual([p.meses for p in lista], [12, 71])

    def test_un_fin_futuro_se_recorta_y_un_inicio_futuro_se_descarta(self):
        self.assertEqual(periodos("Ene 2026 - Dic 2027", HOY)[0].meses, 6)
        self.assertEqual(periodos("Ene 2027 - Dic 2027", HOY), [])

    def test_un_rango_invertido_se_descarta(self):
        self.assertEqual(periodos("Mar 2023 - Ene 2020", HOY), [])

    def test_solo_anios_se_completa_y_se_marca(self):
        (periodo,) = periodos("2020 - 2022", HOY)

        self.assertEqual(periodo.meses, 36)
        self.assertTrue(periodo.solo_año)


class SumaTest(unittest.TestCase):
    def test_dos_empleos_simultaneos_se_cuentan_una_vez(self):
        lista = periodos("Ene 2020 - Dic 2021\nJun 2021 - Dic 2022", HOY)

        self.assertEqual(meses_de_experiencia(lista), 36)

    def test_un_periodo_contenido_en_otro_no_suma(self):
        lista = periodos("Ene 2020 - Dic 2022\nMar 2021 - Jun 2021", HOY)

        self.assertEqual(meses_de_experiencia(lista), 36)

    def test_periodos_separados_suman(self):
        lista = periodos("Ene 2020 - Dic 2020\nEne 2022 - Jun 2022", HOY)

        self.assertEqual(meses_de_experiencia(lista), 18)


class ExperienciaTest(unittest.TestCase):
    CV = """Jorge Condori Maita

Experiencia
Desarrollador Backend, Jalasoft
Ene 2020 - Mar 2023

Educacion
Ingenieria de Sistemas, UMSS
Feb 2014 - Dic 2019
"""

    def test_la_educacion_no_suma(self):
        resultado = experiencia(self.CV, HOY)

        self.assertEqual(resultado.meses, 39)
        self.assertTrue(resultado.desde_la_seccion)
        self.assertEqual(resultado.descripcion, "3 años y 3 meses")

    def test_sin_secciones_se_usa_el_texto_completo_y_se_dice(self):
        resultado = experiencia(self.CV.replace("Experiencia", "Mi trayectoria").replace("Educacion", "Estudios varios"), HOY)

        self.assertFalse(resultado.desde_la_seccion)
        self.assertGreater(resultado.meses, 39)

    def test_sin_periodos_la_experiencia_no_es_cero_sino_desconocida(self):
        resultado = experiencia("Experiencia\nDesarrollador Backend", HOY)

        self.assertIsNone(resultado.meses)
        self.assertEqual(resultado.descripcion, "")

    def test_con_anios_sueltos_es_aproximada(self):
        resultado = experiencia("Experiencia\nDesarrollador, ACME\n2020 - 2022", HOY)

        self.assertTrue(resultado.aproximado)
        self.assertEqual(resultado.descripcion, "3 años (aprox.)")


class FormatoTest(unittest.TestCase):
    def test_describir(self):
        self.assertEqual(describir(8), "8 meses")
        self.assertEqual(describir(12), "1 año")
        self.assertEqual(describir(28), "2 años y 4 meses")
        self.assertEqual(describir(13), "1 año y 1 mes")

    def test_los_anios_sueltos_no_son_un_formato_mas(self):
        self.assertEqual(formatos_presentes("Ene 2020 - Mar 2023"), {"mes_año"})

    def test_formatos_mezclados(self):
        self.assertEqual(
            formatos_presentes("Ene 2020 - 03/2023\n2016-02"), {"mes_año", "numerico", "iso"}
        )

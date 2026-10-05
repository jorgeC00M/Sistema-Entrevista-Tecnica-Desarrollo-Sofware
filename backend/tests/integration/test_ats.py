"""Reglas de parseabilidad de currículums, sin Django ni base de datos.

Dos niveles de prueba, a propósito:

- Las reglas se prueban construyendo un `DocumentoExtraido` a mano. Es exacto y
  rápido: cada test fija justo la condición que quiere disparar.
- La geometría se prueba contra los PDF de `tests/fixtures/cv/`, porque detectar
  columnas depende de coordenadas reales y un objeto construido a mano no
  demostraría que `pdfplumber` las entrega como se espera.
"""

import unittest
from pathlib import Path

from integrations.documentos.ats import analizar
from integrations.documentos.exceptions import DocumentoCorrupto, FormatoNoSoportado
from integrations.documentos.extractor import DocumentoExtraido, extraer

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "cv"

CV_CORRECTO = """Jorge Condori Maita
jorge.condori@example.com
+591 71234567

Experiencia
Desarrollador Backend, Jalasoft
Ene 2020 - Mar 2023

Educacion
Ingenieria de Sistemas, UMSS
Feb 2016 - Dic 2021

Habilidades
Python, Django, PostgreSQL
"""


def _documento(texto: str, **extras) -> DocumentoExtraido:
    opciones = {"formato": "pdf", "paginas": 1}
    opciones.update(extras)
    return DocumentoExtraido(texto=texto, **opciones)


def _codigos(analisis) -> set[str]:
    return {hallazgo.codigo for hallazgo in analisis.hallazgos}


class CapaDeTextoTest(unittest.TestCase):
    """El fallo más grave y el más invisible: un CV escaneado."""

    def test_un_documento_sin_texto_se_reporta_y_no_se_sigue_analizando(self):
        # Un escáner deja algún artefacto suelto, así que el criterio no es
        # "cero caracteres" sino un mínimo por página.
        analisis = analizar(_documento("1", paginas=2))

        self.assertIn("sin_capa_de_texto", _codigos(analisis))
        # Es lo único que se reporta: aplicar el resto de las reglas sobre un
        # texto vacío produciría una lista de debilidades falsas que ahogaría la
        # única que importa.
        self.assertEqual(len(analisis.hallazgos), 1)
        self.assertEqual(analisis.campos_detectados, 0)

    def test_un_cv_con_texto_suficiente_si_se_analiza(self):
        analisis = analizar(_documento(CV_CORRECTO))

        self.assertNotIn("sin_capa_de_texto", _codigos(analisis))


class ContactoTest(unittest.TestCase):
    def test_se_extraen_nombre_correo_y_telefono(self):
        analisis = analizar(_documento(CV_CORRECTO))
        por_nombre = {campo.nombre: campo for campo in analisis.campos}

        self.assertEqual(por_nombre["Nombre"].valor, "Jorge Condori Maita")
        self.assertEqual(por_nombre["Correo"].valor, "jorge.condori@example.com")
        self.assertTrue(por_nombre["Teléfono"].detectado)

    def test_la_falta_de_correo_es_critica(self):
        analisis = analizar(_documento(CV_CORRECTO.replace("jorge.condori@example.com", "")))

        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "sin_correo")
        self.assertEqual(hallazgo.severidad, "critica")

    def test_un_rango_de_fechas_no_se_confunde_con_un_telefono(self):
        """`2016-02 - 2021` encaja en cualquier patrón de teléfono tolerante.

        Es el falso positivo que apareció al construir el módulo: el espejo
        mostraba una fecha en el campo del teléfono.
        """
        sin_telefono = CV_CORRECTO.replace("+591 71234567", "")
        analisis = analizar(_documento(sin_telefono + "\n2016-02 - 2021\n"))

        telefono = next(c for c in analisis.campos if c.nombre == "Teléfono")
        self.assertFalse(telefono.detectado)

    def test_el_telefono_se_muestra_completo_con_su_prefijo(self):
        """Detectarlo no basta: el espejo le enseña el valor al usuario."""
        analisis = analizar(_documento(CV_CORRECTO.replace("+591 71234567", "+591 7 123 4567")))

        telefono = next(c for c in analisis.campos if c.nombre == "Teléfono")
        self.assertEqual(telefono.valor, "+591 7 123 4567")


class SeccionesTest(unittest.TestCase):
    def test_los_titulos_convencionales_se_reconocen(self):
        analisis = analizar(_documento(CV_CORRECTO))

        self.assertIn("secciones_reconocidas", _codigos(analisis))

    def test_los_titulos_creativos_no_se_mapean(self):
        creativo = (
            CV_CORRECTO.replace("Experiencia", "Mi trayectoria")
            .replace("Habilidades", "Toolkit")
            .replace("Educacion", "Donde me forme")
        )
        analisis = analizar(_documento(creativo))

        self.assertIn("secciones_no_reconocidas", _codigos(analisis))
        detectadas = {c.nombre for c in analisis.campos if c.detectado}
        self.assertNotIn("Experiencia", detectadas)
        self.assertNotIn("Habilidades", detectadas)

    def test_una_mencion_dentro_de_una_frase_no_cuenta_como_titulo(self):
        """"Tengo experiencia en Python" es una frase, no una sección.

        La coincidencia es por línea completa justamente por esto; aflojarla
        daría por buena una estructura que el ATS no reconoce.
        """
        analisis = analizar(
            _documento(
                "Jorge Condori Maita\njorge@example.com\n+591 71234567\n"
                "Tengo experiencia en Python y habilidades de comunicacion.\n"
            )
        )

        self.assertIn("secciones_no_reconocidas", _codigos(analisis))

    def test_los_titulos_en_ingles_tambien_se_reconocen(self):
        en_ingles = CV_CORRECTO.replace("Experiencia", "Work Experience").replace(
            "Habilidades", "Technical Skills"
        )
        analisis = analizar(_documento(en_ingles))

        self.assertIn("secciones_reconocidas", _codigos(analisis))


class FechasTest(unittest.TestCase):
    def test_un_solo_formato_se_reporta_como_fortaleza(self):
        analisis = analizar(_documento(CV_CORRECTO))

        self.assertIn("fechas_consistentes", _codigos(analisis))
        self.assertNotIn("formatos_de_fecha_mezclados", _codigos(analisis))

    def test_mezclar_formatos_se_detecta(self):
        mezclado = CV_CORRECTO.replace("Ene 2020 - Mar 2023", "Ene 2020 - 03/2023").replace(
            "Feb 2016 - Dic 2021", "2016-02 - dic '21"
        )
        analisis = analizar(_documento(mezclado))

        self.assertIn("formatos_de_fecha_mezclados", _codigos(analisis))

    def test_los_anios_sueltos_no_cuentan_como_segundo_formato(self):
        """«Ene 2020 – Mar 2023» contiene además años sueltos.

        Si "solo_año" contara como formato propio, todo CV bien fechado
        aparecería como si mezclara dos.
        """
        analisis = analizar(_documento(CV_CORRECTO))

        self.assertNotIn("formatos_de_fecha_mezclados", _codigos(analisis))

    def test_sin_rangos_la_antiguedad_no_es_calculable(self):
        sin_fechas = CV_CORRECTO.replace("Ene 2020 - Mar 2023", "").replace(
            "Feb 2016 - Dic 2021", ""
        )
        analisis = analizar(_documento(sin_fechas))

        self.assertIn("antiguedad_no_calculable", _codigos(analisis))

    def test_un_periodo_abierto_cuenta_como_rango(self):
        analisis = analizar(_documento(CV_CORRECTO.replace("Mar 2023", "Actualidad")))

        self.assertNotIn("antiguedad_no_calculable", _codigos(analisis))

    def test_cada_rango_se_cuenta_una_sola_vez(self):
        """El conteo se le muestra al usuario, así que importa que sea exacto.

        Al contar por formato y sumar, un mismo rango se contaba dos veces.
        """
        analisis = analizar(_documento(CV_CORRECTO))

        antiguedad = next(c for c in analisis.campos if c.nombre == "Antigüedad")
        self.assertIn("2 periodos", antiguedad.valor)


class GeometriaTest(unittest.TestCase):
    def test_las_habilidades_en_graficos_se_detectan(self):
        """Imágenes presentes y sección de habilidades ausente: barras de nivel.

        Por separado cada señal es débil; juntas son el patrón de «Python
        ████░░ 80%», que el usuario cree haber declarado y el ATS no ve.
        """
        sin_habilidades = CV_CORRECTO.replace("Habilidades", "Mis superpoderes")
        analisis = analizar(_documento(sin_habilidades, imagenes=4))

        self.assertIn("habilidades_en_graficos", _codigos(analisis))

    def test_con_habilidades_legibles_las_imagenes_son_solo_un_aviso(self):
        analisis = analizar(_documento(CV_CORRECTO, imagenes=2))

        self.assertIn("contiene_imagenes", _codigos(analisis))
        self.assertNotIn("habilidades_en_graficos", _codigos(analisis))

    def test_las_tablas_se_reportan(self):
        analisis = analizar(_documento(CV_CORRECTO, tablas=3))

        self.assertIn("contiene_tablas", _codigos(analisis))


class ExtractorTest(unittest.TestCase):
    """Contra archivos reales: es lo único que demuestra la integración."""

    def _analizar(self, nombre: str):
        ruta = FIXTURES / nombre
        documento = extraer(ruta.read_bytes(), nombre)
        return documento, analizar(documento)

    def test_un_cv_de_una_columna_no_tiene_debilidades(self):
        documento, analisis = self._analizar("una_columna.pdf")

        self.assertTrue(documento.tiene_capa_de_texto)
        self.assertEqual(analisis.debilidades, [])
        self.assertEqual(analisis.parseabilidad, "7/7")

    def test_dos_columnas_se_detectan_por_las_coordenadas(self):
        _, analisis = self._analizar("dos_columnas.pdf")

        self.assertIn("dos_columnas", _codigos(analisis))

    def test_dos_columnas_arrastra_la_perdida_de_las_secciones(self):
        """La cascada completa, que es el hallazgo más demostrativo.

        Las columnas revuelven el texto —sale "Habilidades Optimice consultas
        y"— los títulos dejan de estar solos en su línea y el parser pierde las
        secciones. El CV tiene sus títulos bien escritos y aun así el ATS no los
        reconoce.
        """
        documento, analisis = self._analizar("dos_columnas.pdf")

        self.assertIn("Habilidades", documento.texto)
        self.assertIn("secciones_no_reconocidas", _codigos(analisis))

    def test_una_columna_no_se_confunde_con_dos(self):
        _, analisis = self._analizar("una_columna.pdf")

        self.assertNotIn("dos_columnas", _codigos(analisis))

    def test_un_pdf_escaneado_se_abre_pero_no_tiene_texto(self):
        documento, analisis = self._analizar("escaneado.pdf")

        self.assertFalse(documento.tiene_capa_de_texto)
        self.assertIn("sin_capa_de_texto", _codigos(analisis))

    def test_se_cuentan_las_paginas_y_se_avisa_del_exceso(self):
        documento, analisis = self._analizar("demasiadas_paginas.pdf")

        self.assertEqual(documento.paginas, 4)
        self.assertIn("demasiadas_paginas", _codigos(analisis))

    def test_las_imagenes_no_se_aceptan(self):
        with self.assertRaises(FormatoNoSoportado):
            extraer(b"\xff\xd8\xff\xe0 datos jpeg", "cv.jpg")

    def test_un_pdf_danado_se_distingue_de_uno_escaneado(self):
        """Uno no se puede abrir; el otro se abre y no tiene texto.

        Son casos distintos: el primero es un error del archivo, el segundo es
        el hallazgo que el módulo existe para reportar.
        """
        with self.assertRaises(DocumentoCorrupto):
            extraer(b"%PDF-1.4\nesto no es la estructura de un pdf", "cv.pdf")


if __name__ == "__main__":
    unittest.main()

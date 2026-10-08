"""Reglas de parseabilidad de currículums, sin Django ni base de datos.

Dos niveles de prueba, a propósito:

- Las reglas se prueban construyendo un `DocumentoExtraido` a mano. Es exacto y
  rápido: cada test fija justo la condición que quiere disparar.
- La geometría se prueba contra los PDF de `tests/fixtures/cv/`, porque detectar
  columnas depende de coordenadas reales y un objeto construido a mano no
  demostraría que `pdfplumber` las entrega como se espera.
"""

import unittest
from datetime import date
from pathlib import Path

from integrations.documentos.ats import CAMPOS_DE_LA_FICHA, analizar
from integrations.documentos.exceptions import DocumentoCorrupto, FormatoNoSoportado
from integrations.documentos.extractor import DocumentoExtraido, extraer

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "cv"

HOY = date(2026, 6, 15)

CV_CORRECTO = """Jorge Condori Maita
jorge.condori@example.com
+591 71234567
Cochabamba, Bolivia

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
        self.assertEqual(analisis.parseabilidad, "0/8")

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

    def test_la_antiguedad_es_la_experiencia_calculada_sin_la_carrera(self):
        """El valor se le muestra al usuario: es lo que el ATS calcularía.

        El CV tiene Ene 2020 – Mar 2023 en experiencia y Feb 2016 – Dic 2021 en
        educación; solo lo primero es experiencia laboral.
        """
        analisis = analizar(_documento(CV_CORRECTO), hoy=HOY)

        antiguedad = next(c for c in analisis.campos if c.nombre == "Antigüedad")
        self.assertEqual(antiguedad.valor, "3 años y 3 meses")

    def test_sin_seccion_de_experiencia_la_nota_avisa_que_puede_incluir_estudios(self):
        creativo = CV_CORRECTO.replace("Experiencia", "Mi trayectoria")
        analisis = analizar(_documento(creativo), hoy=HOY)

        antiguedad = next(c for c in analisis.campos if c.nombre == "Antigüedad")
        self.assertTrue(antiguedad.detectado)
        self.assertIn("puede incluir estudios", antiguedad.nota)


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


class FichaTest(unittest.TestCase):
    def test_las_verificaciones_emiten_exactamente_los_campos_de_la_ficha(self):
        """`CAMPOS_DE_LA_FICHA` es la única lista de campos; si una verificación
        añadiera o quitara uno sin tocarla, el caso sin capa de texto y el resto
        dejarían de coincidir."""
        analisis = analizar(_documento(CV_CORRECTO))

        self.assertEqual(tuple(c.nombre for c in analisis.campos), CAMPOS_DE_LA_FICHA)

    def test_un_cv_completo_llena_los_ocho_campos(self):
        self.assertEqual(analizar(_documento(CV_CORRECTO)).parseabilidad, "8/8")


class UbicacionTest(unittest.TestCase):
    def test_la_ciudad_del_encabezado_se_detecta_en_orden(self):
        analisis = analizar(_documento(CV_CORRECTO))

        ubicacion = next(c for c in analisis.campos if c.nombre == "Ubicación")
        self.assertEqual(ubicacion.valor, "Cochabamba, Bolivia")
        self.assertNotIn("sin_ubicacion", _codigos(analisis))

    def test_sin_ciudad_es_una_debilidad_media(self):
        analisis = analizar(_documento(CV_CORRECTO.replace("Cochabamba, Bolivia\n", "")))

        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "sin_ubicacion")
        self.assertEqual(hallazgo.severidad, "media")

    def test_una_ciudad_en_la_experiencia_no_cuenta(self):
        """"Santa Cruz" en una experiencia puede ser una empresa."""
        cv = CV_CORRECTO.replace("Cochabamba, Bolivia\n", "").replace(
            "Desarrollador Backend, Jalasoft", "Desarrollador Backend, Jalasoft, Santa Cruz"
        )

        self.assertIn("sin_ubicacion", _codigos(analizar(_documento(cv))))

    def test_un_apellido_que_es_ciudad_no_cuenta_como_ubicacion(self):
        cv = CV_CORRECTO.replace("Jorge Condori Maita", "Jorge Condori Lima").replace("Cochabamba, Bolivia\n", "")

        self.assertIn("sin_ubicacion", _codigos(analizar(_documento(cv))))


class SiglasTest(unittest.TestCase):
    def test_solo_la_sigla_se_avisa(self):
        analisis = analizar(_documento(CV_CORRECTO.replace("PostgreSQL", "PostgreSQL, AWS")))

        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "solo_sigla_o_solo_nombre")
        self.assertEqual(hallazgo.severidad, "info")
        self.assertIn("Amazon Web Services (AWS)", hallazgo.detalle)

    def test_las_dos_formas_no_se_avisan(self):
        cv = CV_CORRECTO.replace("PostgreSQL", "PostgreSQL, Amazon Web Services (AWS)")

        self.assertNotIn("solo_sigla_o_solo_nombre", _codigos(analizar(_documento(cv))))

    def test_varios_terminos_van_en_un_solo_hallazgo(self):
        cv = CV_CORRECTO.replace("PostgreSQL", "PostgreSQL, AWS, Machine Learning")
        hallazgos = [h for h in analizar(_documento(cv)).hallazgos if h.codigo == "solo_sigla_o_solo_nombre"]

        self.assertEqual(len(hallazgos), 1)
        self.assertIn("Machine Learning (ML)", hallazgos[0].detalle)


class ZonasOcultasTest(unittest.TestCase):
    def test_el_correo_solo_en_el_encabezado_es_un_unico_hallazgo_critico(self):
        sin_correo = CV_CORRECTO.replace("jorge.condori@example.com\n", "")
        analisis = analizar(
            _documento(sin_correo, formato="docx", texto_en_encabezado="jorge.condori@example.com")
        )

        codigos = [h.codigo for h in analisis.hallazgos]
        self.assertNotIn("sin_correo", codigos)
        self.assertEqual(codigos.count("texto_en_encabezado"), 1)
        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "texto_en_encabezado")
        self.assertEqual(hallazgo.severidad, "critica")

        correo = next(c for c in analisis.campos if c.nombre == "Correo")
        self.assertFalse(correo.detectado)
        self.assertIn("encabezado", correo.nota)

    def test_un_encabezado_sin_contacto_es_una_debilidad_media(self):
        analisis = analizar(_documento(CV_CORRECTO, texto_en_encabezado="Curriculum Vitae"))

        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "texto_en_encabezado")
        self.assertEqual(hallazgo.severidad, "media")

    def test_un_cuadro_de_texto_es_una_debilidad_alta(self):
        analisis = analizar(_documento(CV_CORRECTO, texto_en_cuadros="Python, Django"))

        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "texto_en_cuadros")
        self.assertEqual(hallazgo.severidad, "alta")

    def test_sin_zonas_ocultas_no_hay_hallazgo(self):
        codigos = _codigos(analizar(_documento(CV_CORRECTO)))

        self.assertNotIn("texto_en_cuadros", codigos)
        self.assertNotIn("texto_en_encabezado", codigos)


class TextoOcultoTest(unittest.TestCase):
    def test_desde_veinte_caracteres_se_avisa(self):
        analisis = analizar(_documento(CV_CORRECTO, caracteres_ocultos=20))

        self.assertIn("texto_oculto", _codigos(analisis))

    def test_unos_pocos_caracteres_sueltos_no_cuentan(self):
        self.assertNotIn("texto_oculto", _codigos(analizar(_documento(CV_CORRECTO, caracteres_ocultos=3))))


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
        self.assertEqual(analisis.parseabilidad, "8/8")

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

    def test_el_texto_blanco_se_detecta(self):
        documento, analisis = self._analizar("texto_blanco.pdf")

        self.assertGreaterEqual(documento.caracteres_ocultos, 20)
        self.assertIn("texto_oculto", _codigos(analisis))

    def test_el_texto_blanco_sobre_una_banda_de_color_no_es_oculto(self):
        documento, analisis = self._analizar("texto_blanco_sobre_banda.pdf")

        self.assertEqual(documento.caracteres_ocultos, 0)
        self.assertNotIn("texto_oculto", _codigos(analisis))

    def test_un_pie_repetido_en_dos_paginas_sale_del_texto_y_se_informa(self):
        documento, analisis = self._analizar("pie_repetido.pdf")

        self.assertIn("example.com", documento.texto_en_encabezado)
        self.assertNotIn("example.com", documento.texto)
        hallazgo = next(h for h in analisis.hallazgos if h.codigo == "texto_en_encabezado")
        self.assertEqual(hallazgo.severidad, "critica")

    def test_en_un_pdf_de_una_pagina_no_se_buscan_encabezados(self):
        documento, _ = self._analizar("una_columna.pdf")

        self.assertEqual(documento.texto_en_encabezado, "")

    def test_el_cuadro_de_texto_de_un_docx_se_lee_aparte_y_una_sola_vez(self):
        """Word lo guarda dos veces (`mc:Choice` y `mc:Fallback`)."""
        documento, analisis = self._analizar("cuadro_de_texto.docx")

        self.assertEqual(documento.texto_en_cuadros, "Python, Django\nPostgreSQL, Docker")
        self.assertNotIn("Python", documento.texto)
        self.assertIn("texto_en_cuadros", _codigos(analisis))

    def test_el_correo_en_el_encabezado_de_un_docx(self):
        documento, analisis = self._analizar("correo_en_encabezado.docx")

        self.assertIn("example.com", documento.texto_en_encabezado)
        self.assertNotIn("sin_correo", _codigos(analisis))
        correo = next(c for c in analisis.campos if c.nombre == "Correo")
        self.assertIn("encabezado", correo.nota)

    def test_la_huella_distingue_documentos_que_solo_difieren_en_lo_oculto(self):
        base = DocumentoExtraido(texto=CV_CORRECTO, formato="docx", paginas=1)
        con_encabezado = DocumentoExtraido(
            texto=CV_CORRECTO, formato="docx", paginas=1, texto_en_encabezado="jorge@example.com"
        )

        self.assertEqual(base.huella, CV_CORRECTO)
        self.assertNotEqual(base.huella, con_encabezado.huella)

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

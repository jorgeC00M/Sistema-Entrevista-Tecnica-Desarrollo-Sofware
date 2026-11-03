"""Preguntas de filtro (título, idioma, ubicación) y los términos nuevos del diccionario.

Sin Django: texto construido a mano, que es exacto. Lo que se fija aquí es la
regla del módulo —nunca «no cumples», y lo que no se entiende no se informa—.
"""

import unittest

from integrations.documentos.brecha import calcular
from integrations.documentos.extractor import DocumentoExtraido
from integrations.documentos.filtros import CUMPLE, NO_APARECE, NO_VERIFICABLE, preguntas_de_filtro
from integrations.documentos.secciones import segmentar, titulo_de
from integrations.documentos.terminos import encontrar

CV_BASE = """Ana Quispe
ana@example.com
Cochabamba, Bolivia

Experiencia
Desarrollé APIs con Django y PostgreSQL

Educación
{educacion}

{idiomas}
"""


def _cv(educacion: str = "Titulada en Ingeniería de Sistemas, UMSS", idiomas: str = "") -> str:
    return CV_BASE.format(educacion=educacion, idiomas=idiomas)


def _filtro(aviso: str, cv: str, tipo: str):
    encontrados = [f for f in preguntas_de_filtro(aviso, cv) if f.tipo == tipo]
    return encontrados[0] if encontrados else None


class TituloTest(unittest.TestCase):
    AVISO = "Requisitos:\n- Titulado en Ingeniería de Sistemas o afines\n"

    def test_titulado_frente_a_titulado_cumple(self):
        self.assertEqual(_filtro(self.AVISO, _cv(), "titulo").estado, CUMPLE)

    def test_egresado_frente_a_titulado_no_es_un_descarte(self):
        filtro = _filtro(self.AVISO, _cv("Egresado de Ingeniería de Sistemas, UMSS"), "titulo")

        self.assertEqual(filtro.estado, NO_VERIFICABLE)
        self.assertIn("egresado", filtro.nota)

    def test_egresado_cumple_si_el_aviso_acepta_egresados(self):
        aviso = "Requisitos:\n- Egresado o titulado en Informática\n"

        self.assertEqual(_filtro(aviso, _cv("Egresado de Ingeniería Informática"), "titulo").estado, CUMPLE)

    def test_sin_seccion_de_educacion_no_aparece(self):
        cv = "Ana Quispe\nExperiencia\nDesarrollé APIs con Django\n"

        self.assertEqual(_filtro(self.AVISO, cv, "titulo").estado, NO_APARECE)

    def test_carrera_sin_estado_pide_aclararlo(self):
        filtro = _filtro(self.AVISO, _cv("Licenciatura en Ingeniería de Sistemas, UMSS 2018-2023"), "titulo")

        self.assertEqual(filtro.estado, NO_VERIFICABLE)

    def test_una_materia_no_es_un_titulo(self):
        aviso = "Requisitos:\n- Conocimientos de ingeniería de software\n"

        self.assertIsNone(_filtro(aviso, _cv(), "titulo"))

    def test_un_titulo_pedido_solo_como_deseable_no_genera_filtro(self):
        aviso = "Requisitos:\n- Django\nDeseable:\n- Titulado en Ingeniería de Sistemas\n"
        brecha = calcular(aviso, DocumentoExtraido(texto=_cv(), formato="pdf", paginas=1))

        self.assertEqual([f.tipo for f in brecha.filtros], [])


class IdiomaTest(unittest.TestCase):
    AVISO = "Requisitos:\n- Inglés intermedio\n"

    def test_un_nivel_suficiente_cumple(self):
        cv = _cv(idiomas="Idiomas\nInglés: B2")

        self.assertEqual(_filtro(self.AVISO, cv, "idioma").estado, CUMPLE)

    def test_un_nivel_menor_no_es_un_descarte(self):
        filtro = _filtro(self.AVISO, _cv(idiomas="Idiomas\nInglés básico"), "idioma")

        self.assertEqual(filtro.estado, NO_VERIFICABLE)
        self.assertIn("básico", filtro.nota)

    def test_sin_nivel_no_es_verificable(self):
        self.assertEqual(_filtro(self.AVISO, _cv(idiomas="Idiomas\nInglés"), "idioma").estado, NO_VERIFICABLE)

    def test_si_no_lo_menciona_no_aparece(self):
        filtro = _filtro(self.AVISO, _cv(), "idioma")

        self.assertEqual(filtro.estado, NO_APARECE)
        self.assertEqual(filtro.pedido, "Inglés intermedio")

    def test_un_cv_escrito_en_ingles_no_cuenta_como_mencionarlo(self):
        cv = "Ana Quispe\nExperience\nBuilt REST APIs with Django and PostgreSQL\n"

        self.assertEqual(_filtro(self.AVISO, cv, "idioma").estado, NO_APARECE)

    def test_documentacion_en_ingles_no_es_un_requisito_de_idioma(self):
        aviso = "Requisitos:\n- Redactar documentación técnica en inglés\n"

        self.assertIsNone(_filtro(aviso, _cv(), "idioma"))


class UbicacionTest(unittest.TestCase):
    AVISO = "Requisitos:\n- Trabajo presencial en Cochabamba\n"

    def test_la_misma_ciudad_cumple(self):
        filtro = _filtro(self.AVISO, _cv(), "ubicacion")

        self.assertEqual(filtro.estado, CUMPLE)
        self.assertEqual(filtro.pedido, "Presencial en Cochabamba")

    def test_otra_ciudad_no_es_un_descarte(self):
        cv = _cv().replace("Cochabamba, Bolivia", "La Paz, Bolivia")
        filtro = _filtro(self.AVISO, cv, "ubicacion")

        self.assertEqual(filtro.estado, NO_VERIFICABLE)
        self.assertIn("La Paz", filtro.nota)

    def test_sin_ciudad_en_el_cv_no_aparece(self):
        cv = _cv().replace("Cochabamba, Bolivia\n", "")

        self.assertEqual(_filtro(self.AVISO, cv, "ubicacion").estado, NO_APARECE)

    def test_un_aviso_remoto_no_filtra_por_ubicacion(self):
        aviso = "Requisitos:\n- Trabajo 100% remoto desde Bolivia\n"

        self.assertIsNone(_filtro(aviso, _cv(), "ubicacion"))


class BrechaConFiltrosTest(unittest.TestCase):
    AVISO = """Desarrollador Backend
Requisitos:
- Django, PostgreSQL, Docker
- Inglés intermedio
"""

    def test_los_filtros_no_cambian_la_cobertura(self):
        brecha = calcular(self.AVISO, DocumentoExtraido(texto=_cv(), formato="pdf", paginas=1))

        self.assertEqual(brecha.obligatorios.cobertura, "2/3")
        self.assertEqual([f.tipo for f in brecha.filtros], ["idioma"])

    def test_un_aviso_sin_filtros_deja_la_lista_vacia(self):
        brecha = calcular("Requisitos:\n- Django\n", DocumentoExtraido(texto=_cv(), formato="pdf", paginas=1))

        self.assertEqual(brecha.filtros, ())


class SeccionDeIdiomasTest(unittest.TestCase):
    def test_idiomas_es_un_titulo_reconocido(self):
        self.assertEqual(titulo_de("Idiomas"), "idiomas")
        self.assertEqual(titulo_de("Languages:"), "idiomas")

    def test_su_contenido_ya_no_se_suma_a_habilidades(self):
        bloques = segmentar("Habilidades\nPython\nIdiomas\nInglés B2\n")

        self.assertNotIn("Inglés", bloques["habilidades"])
        self.assertIn("Inglés", bloques["idiomas"])


class TerminosNuevosTest(unittest.TestCase):
    def test_reconoce_las_herramientas_frecuentes_en_avisos_locales(self):
        self.assertEqual(
            encontrar("Manejo de PowerBI, Tableau, Excel avanzado, SAP HANA, Jira y Figma"),
            {"Power BI", "Tableau", "Excel", "SAP", "Jira", "Figma"},
        )

    def test_power_bi_con_y_sin_espacio_es_el_mismo(self):
        self.assertEqual(encontrar("Power BI"), encontrar("powerbi"))

    def test_sin_falsos_positivos_dentro_de_otras_palabras(self):
        texto = "Su sapiencia y un trabajo excelente con jirafas y figmatismo"

        self.assertEqual(encontrar(texto) & {"SAP", "Excel", "Jira", "Figma"}, set())


if __name__ == "__main__":
    unittest.main()

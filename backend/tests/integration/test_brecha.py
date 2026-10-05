"""Comparación de un currículum con una convocatoria, sin Django ni base de datos.

Los términos, la lectura de la convocatoria y el mapa de evidencia se prueban con
texto construido a mano, que es exacto. Solo el mapa contra un documento real usa
los PDF de `tests/fixtures/cv/`, porque la segmentación depende de que el extractor
entregue los títulos en líneas propias.
"""

import unittest
from pathlib import Path

from integrations.documentos.brecha import (
    AUSENTE,
    DECLARADO,
    DEMOSTRADO,
    PRESENTE,
    calcular,
)
from integrations.documentos.convocatoria import partir
from integrations.documentos.extractor import DocumentoExtraido, extraer
from integrations.documentos.secciones import segmentar
from integrations.documentos.terminos import encontrar
from integrations.documentos.vinetas import evaluar

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures" / "cv"


def _cv(texto: str) -> DocumentoExtraido:
    """Un documento legible con este texto, para probar las reglas sin un PDF."""
    return DocumentoExtraido(texto=texto, formato="pdf", paginas=1)


class TerminosTest(unittest.TestCase):
    def test_las_variantes_del_mismo_termino_se_reconocen_como_uno(self):
        """"postgres" en la convocatoria y "PostgreSQL" en el CV son lo mismo.

        Devolver el canónico y no la variante encontrada es lo que hace que la
        comparación funcione.
        """
        self.assertEqual(encontrar("Manejo de Postgres"), {"PostgreSQL"})
        self.assertEqual(encontrar("Experiencia en PostgreSQL"), {"PostgreSQL"})
        self.assertEqual(encontrar("Bases psql"), {"PostgreSQL"})

    def test_un_termino_no_encaja_dentro_de_otra_palabra(self):
        """Los tres falsos positivos que importan.

        Sin límites de palabra, "js" encajaría en "jsx", "react" en "reactivo" y
        "java" en "javascript", y el mapa de evidencia reportaría requisitos que el
        CV no menciona.
        """
        self.assertNotIn("JavaScript", encontrar("Componentes en archivos .jsx"))
        self.assertNotIn("React", encontrar("Un sistema reactivo"))
        self.assertNotIn("Java", encontrar("Desarrollo en JavaScript"))

    def test_los_acentos_no_impiden_la_coincidencia(self):
        self.assertIn("POO", encontrar("Programación Orientada a Objetos"))
        self.assertIn("Patrones de diseño", encontrar("Patrones de Diseño aplicados"))

    def test_los_terminos_con_simbolos_se_reconocen(self):
        """`\\b` no funciona junto a un carácter no alfanumérico: `\\bc#\\b` nunca
        encajaría, así que el límite se añade solo donde tiene sentido."""
        encontrados = encontrar("Desarrollo en C# sobre .NET")
        self.assertIn("C#", encontrados)
        self.assertIn(".NET", encontrados)

    def test_un_texto_vacio_no_devuelve_terminos(self):
        self.assertEqual(encontrar(""), set())
        self.assertEqual(encontrar("   \n  "), set())


class ConvocatoriaTest(unittest.TestCase):
    SEPARADA = """Desarrollador Backend

Requisitos:
- Python y Django
- PostgreSQL

Deseable:
- Docker
- AWS
"""

    def test_los_obligatorios_se_separan_de_los_deseables(self):
        convocatoria = partir(self.SEPARADA)

        self.assertTrue(convocatoria.separada)
        self.assertEqual(convocatoria.obligatorios, frozenset({"Python", "Django", "PostgreSQL"}))
        self.assertEqual(convocatoria.deseables, frozenset({"Docker", "AWS"}))

    def test_sin_titulos_todo_cae_en_un_solo_grupo(self):
        """No se inventa una clasificación que el texto no sostiene."""
        convocatoria = partir("Buscamos alguien con Python, Django y Docker.")

        self.assertFalse(convocatoria.separada)
        self.assertEqual(convocatoria.obligatorios, frozenset({"Python", "Django", "Docker"}))
        self.assertEqual(convocatoria.deseables, frozenset())

    def test_el_preambulo_cuenta_como_obligatorio(self):
        """La descripción del puesto antes del primer título es lo que se pide."""
        convocatoria = partir("Backend con Python.\n\nDeseable:\n- Docker\n")

        self.assertIn("Python", convocatoria.obligatorios)
        self.assertEqual(convocatoria.deseables, frozenset({"Docker"}))

    def test_un_termino_en_los_dos_bloques_se_queda_en_obligatorios(self):
        """Evita que la cobertura total sume más requisitos de los que hay."""
        convocatoria = partir("Requisitos:\n- Docker\n\nDeseable:\n- Docker avanzado\n")

        self.assertIn("Docker", convocatoria.obligatorios)
        self.assertNotIn("Docker", convocatoria.deseables)

    def test_una_mencion_dentro_de_una_frase_no_abre_un_bloque(self):
        convocatoria = partir("Tenemos requisitos exigentes. Buscamos Python.")

        self.assertFalse(convocatoria.separada)

    def test_un_texto_sin_terminos_reconocibles_no_tiene_requisitos(self):
        """Pasa con una convocatoria redactada sin nombrar tecnologías.

        Hay que informarlo en lugar de mostrar una cobertura vacía, que se leería
        como que el candidato no cumple nada.
        """
        convocatoria = partir("Buscamos una persona proactiva con ganas de aprender.")

        self.assertFalse(convocatoria.tiene_requisitos)


class SegmentarTest(unittest.TestCase):
    CV = """Jorge Condori
jorge@example.com

Experiencia
Backend en Jalasoft
- Optimice consultas PostgreSQL

Habilidades
Python, Django, Docker
"""

    def test_cada_bloque_contiene_solo_su_seccion(self):
        bloques = segmentar(self.CV)

        self.assertIn("PostgreSQL", bloques["experiencia"])
        self.assertNotIn("PostgreSQL", bloques["habilidades"])
        self.assertIn("Docker", bloques["habilidades"])
        self.assertNotIn("Docker", bloques["experiencia"])

    def test_el_encabezado_no_pertenece_a_ninguna_seccion(self):
        """Nombre y correo van antes del primer título y no son evidencia de nada."""
        bloques = segmentar(self.CV)

        self.assertNotIn("jorge@example.com", "".join(bloques.values()))

    def test_sin_titulos_reconocidos_no_hay_bloques(self):
        """Quien llama debe leerlo como "no se puede precisar dónde", no como
        "no aparece en ninguna parte"."""
        self.assertEqual(segmentar("Mi trayectoria\nBackend\n\nToolkit\nPython\n"), {})

    def test_un_titulo_repetido_concatena_en_vez_de_sobrescribir(self):
        """Algunos CV separan experiencia profesional de académica."""
        bloques = segmentar(
            "Experiencia\nBackend con Django\n\nExperiencia\nAyudante con Python\n"
        )

        self.assertIn("Django", bloques["experiencia"])
        self.assertIn("Python", bloques["experiencia"])


class MapaDeEvidenciaTest(unittest.TestCase):
    CONVOCATORIA = """Requisitos:
- Python
- Django
- Docker
"""

    CV = """Jorge Condori
jorge@example.com

Experiencia
Backend en Jalasoft
- Optimice consultas con Python y reduje la latencia 40%

Habilidades
Python, Django
"""

    def test_un_termino_usado_en_la_experiencia_esta_demostrado(self):
        brecha = calcular(self.CONVOCATORIA, _cv(self.CV))

        estados = {r.termino: r.estado for r in brecha.obligatorios.requisitos}
        self.assertEqual(estados["Python"], DEMOSTRADO)

    def test_un_termino_solo_en_habilidades_esta_declarado(self):
        """El test que fija el aporte del módulo.

        Un CV que lista "Django" en habilidades y nunca lo usa en experiencia no
        debe reportarse igual que uno que lo demuestra. Esa diferencia es la que un
        reclutador valora y la que ninguna comparación binaria da.
        """
        brecha = calcular(self.CONVOCATORIA, _cv(self.CV))

        estados = {r.termino: r.estado for r in brecha.obligatorios.requisitos}
        self.assertEqual(estados["Django"], DECLARADO)
        self.assertNotEqual(estados["Django"], DEMOSTRADO)

    def test_un_termino_que_no_aparece_esta_ausente(self):
        brecha = calcular(self.CONVOCATORIA, _cv(self.CV))

        estados = {r.termino: r.estado for r in brecha.obligatorios.requisitos}
        self.assertEqual(estados["Docker"], AUSENTE)

    def test_declarado_cuenta_como_cubierto(self):
        """Lo que el estado matiza es la fuerza de la evidencia, no su existencia.

        Dos de tres: Python demostrado y Django declarado cuentan; Docker no.
        """
        brecha = calcular(self.CONVOCATORIA, _cv(self.CV))

        self.assertEqual(brecha.obligatorios.cobertura, "2/3")

    def test_la_cobertura_se_publica_en_texto_y_no_en_porcentaje(self):
        """Un número sobre 100 se leería como una probabilidad de contratación."""
        brecha = calcular(self.CONVOCATORIA, _cv(self.CV))

        self.assertEqual(brecha.obligatorios.cobertura, "2/3")
        self.assertNotIn("%", brecha.obligatorios.cobertura)

    def test_los_extras_no_cuentan_ni_a_favor_ni_en_contra(self):
        cv = self.CV.replace("Python, Django", "Python, Django, Java, Spring")
        brecha = calcular(self.CONVOCATORIA, _cv(cv))

        self.assertIn("Java", brecha.extras)
        self.assertIn("Spring", brecha.extras)
        self.assertEqual(brecha.obligatorios.cobertura, "2/3")

    def test_los_requisitos_se_devuelven_en_orden_estable(self):
        """Los conjuntos no garantizan orden: sin esto las filas saltarían de
        sitio al reanalizar el mismo CV."""
        primera = calcular(self.CONVOCATORIA, _cv(self.CV))
        segunda = calcular(self.CONVOCATORIA, _cv(self.CV))

        self.assertEqual(
            [r.termino for r in primera.obligatorios.requisitos],
            [r.termino for r in segunda.obligatorios.requisitos],
        )
        self.assertEqual(
            [r.termino for r in primera.obligatorios.requisitos],
            ["Django", "Docker", "Python"],
        )

    def test_una_convocatoria_sin_requisitos_no_produce_brecha(self):
        """Devolver `None` y no una brecha vacía: "0 de 0" no dice nada y "no
        cumples nada" sería falso."""
        self.assertIsNone(calcular("Buscamos una persona proactiva.", _cv(self.CV)))

    def test_un_cv_ilegible_no_produce_brecha(self):
        """Mostrar "0 de 3 requisitos" sería falso: no es que no cumpla, es que
        nadie puede leerlo.

        El documento trae un artefacto suelto, como un PDF escaneado real, para
        que no baste con comprobar que el texto no esté vacío.
        """
        escaneado = DocumentoExtraido(texto="1", formato="pdf", paginas=1)

        self.assertIsNone(calcular(self.CONVOCATORIA, escaneado))


class DegradacionTest(unittest.TestCase):
    """Cuando no se reconocen las secciones, el mapa pierde precisión y lo dice."""

    CONVOCATORIA = "Requisitos:\n- Python\n- Docker\n"

    def test_sin_secciones_los_estados_caen_a_presente_o_ausente(self):
        cv = "Jorge Condori\n\nMi trayectoria\nBackend con Python\n\nToolkit\nPython\n"
        brecha = calcular(self.CONVOCATORIA, _cv(cv))

        self.assertFalse(brecha.con_evidencia)
        estados = {r.termino: r.estado for r in brecha.obligatorios.requisitos}
        self.assertEqual(estados["Python"], PRESENTE)
        self.assertEqual(estados["Docker"], AUSENTE)

    def test_con_secciones_reconocidas_si_hay_evidencia(self):
        cv = "Experiencia\nBackend con Python\n\nHabilidades\nPython\n"
        brecha = calcular(self.CONVOCATORIA, _cv(cv))

        self.assertTrue(brecha.con_evidencia)


class VinetasTest(unittest.TestCase):
    def test_una_vineta_de_responsabilidad_no_es_un_logro(self):
        vinetas = evaluar("- Encargado del modulo de pagos del sistema principal\n")

        self.assertEqual(vinetas.total, 1)
        self.assertEqual(vinetas.logros, 0)

    def test_una_vineta_con_resultado_medible_si_es_un_logro(self):
        vinetas = evaluar("- Reduje la latencia de consultas 40% optimizando indices\n")

        self.assertEqual(vinetas.logros, 1)

    def test_una_cifra_abriendo_con_un_marco_de_tarea_sigue_sin_ser_logro(self):
        """El criterio es conservador: describe el puesto, no lo conseguido."""
        vinetas = evaluar("- Responsable de los 3 modulos principales del sistema\n")

        self.assertEqual(vinetas.logros, 0)

    def test_un_anio_no_cuenta_como_resultado(self):
        """Los años abundan en las fechas; contarlos daría por bueno casi todo."""
        vinetas = evaluar("- Participe en el proyecto durante el 2023 con el equipo\n")

        self.assertEqual(vinetas.logros, 0)

    def test_las_vinetas_cortas_se_ignoran(self):
        """Son elementos de una lista de habilidades, no descripciones de tareas."""
        vinetas = evaluar("Habilidades\n- Python\n- Docker\n- Git\n")

        self.assertEqual(vinetas.total, 0)

    def test_se_devuelven_las_que_hay_que_reescribir(self):
        """Un conteo sin ejemplos deja al usuario adivinando cuáles son."""
        vinetas = evaluar(
            "- Encargado del modulo de pagos del sistema principal\n"
            "- Reduje la latencia de consultas 40% optimizando indices\n"
        )

        self.assertEqual(len(vinetas.sin_resultado), 1)
        self.assertIn("Encargado", vinetas.sin_resultado[0].texto)

    def test_un_cv_sin_vinetas_da_total_cero(self):
        """Quien presente el resultado debe omitir la sección, no mostrar "0/0"."""
        vinetas = evaluar("Experiencia\nTrabaje en Jalasoft redactando en parrafos.\n")

        self.assertEqual(vinetas.total, 0)


class ContraDocumentoRealTest(unittest.TestCase):
    """Lo único que demuestra que el extractor entrega los títulos como se espera."""

    CONVOCATORIA = "Requisitos:\n- Python\n- PostgreSQL\n- Django\n- Docker\n"

    def _brecha(self, nombre: str):
        ruta = FIXTURES / nombre
        documento = extraer(ruta.read_bytes(), nombre)
        return calcular(self.CONVOCATORIA, documento)

    def test_distingue_lo_demostrado_de_lo_declarado_en_un_pdf(self):
        """`habilidades_declaradas.pdf` usa Python y PostgreSQL en la experiencia,
        y solo lista Django y Docker en habilidades."""
        brecha = self._brecha("habilidades_declaradas.pdf")

        estados = {r.termino: r.estado for r in brecha.obligatorios.requisitos}
        self.assertEqual(estados["Python"], DEMOSTRADO)
        self.assertEqual(estados["PostgreSQL"], DEMOSTRADO)
        self.assertEqual(estados["Django"], DECLARADO)
        self.assertEqual(estados["Docker"], DECLARADO)

    def test_un_cv_con_titulos_creativos_degrada(self):
        brecha = self._brecha("titulos_creativos.pdf")

        self.assertFalse(brecha.con_evidencia)

    def test_un_cv_escaneado_no_produce_brecha(self):
        self.assertIsNone(self._brecha("escaneado.pdf"))


if __name__ == "__main__":
    unittest.main()

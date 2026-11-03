"""Contrato del revisor de CV con IA, sin Django ni red.

Lo central es el parser anclado: lo que el modelo devuelva y no se pueda señalar
en la entrada se descarta. Cada descarte tiene su test, porque cada uno es una
forma distinta en que un modelo inventa.
"""

import unittest

from integrations.ia.base import ProveedorIA, ProveedorIAporJSON, RevisorDeCV
from integrations.ia.exceptions import RespuestaIAInvalida
from integrations.ia.factory import ProveedorNoDisponible, get_proveedor, get_revisor_de_cv
from integrations.ia.prompts.revisor_cv import (
    MAXIMO_CORRECCIONES,
    MAXIMO_PREGUNTAS,
    EntradaDeRevision,
    RequisitoARevisar,
    parsear_revision,
    usuario,
)
from integrations.ia.prompts.schemas import Puesto

ENTRADA = EntradaDeRevision(
    vinetas=("Encargado del mantenimiento de la base de datos",),
    requisitos=(RequisitoARevisar("Docker", "ausente"), RequisitoARevisar("Django", "declarado")),
    secciones="Desarrollador Backend, Jalasoft\nMigré el módulo de pagos a microservicios\nDesarollé una API",
    convocatoria="Buscamos experiencia con Kubernetes en producción",
    demostrados=("Python",),
)


def _respuesta(**cambios) -> dict:
    base = {
        "vinetas": [],
        "requisitos": [],
        "preguntas": [],
        "puesto_sugerido": "ninguno",
        "correcciones": [],
        "lectura": "",
    }
    base.update(cambios)
    return base


class PromptTest(unittest.TestCase):
    def test_el_prompt_lleva_lo_enviado(self):
        texto = usuario(ENTRADA)

        self.assertIn("Encargado del mantenimiento de la base de datos", texto)
        self.assertIn("Docker (ausente)", texto)
        self.assertIn("Migré el módulo de pagos", texto)
        self.assertIn("Kubernetes", texto)
        self.assertIn("sí demuestra:\n- Python", texto)

    def test_sin_convocatoria_se_dice_y_no_queda_vacio(self):
        texto = usuario(EntradaDeRevision(vinetas=(), requisitos=(), secciones="Experiencia"))

        self.assertIn("no se aportó convocatoria", texto)
        self.assertIn("(ninguna)", texto)


class ParserAncladoTest(unittest.TestCase):
    def test_una_vineta_no_enviada_se_descarta(self):
        revision = parsear_revision(
            _respuesta(
                vinetas=[
                    {"original": "Encargado del mantenimiento de la base de datos", "sugerida": "Reduje [cifra]"},
                    {"original": "Lideré un equipo de 10 personas", "sugerida": "Inventada"},
                ]
            ),
            ENTRADA,
        )

        self.assertEqual([v.original for v in revision.vinetas], ["Encargado del mantenimiento de la base de datos"])

    def test_la_vineta_conserva_el_original_enviado_aunque_el_modelo_cambie_espacios(self):
        revision = parsear_revision(
            _respuesta(vinetas=[{"original": "encargado del  mantenimiento de la base de datos", "sugerida": "x"}]),
            ENTRADA,
        )

        self.assertEqual(revision.vinetas[0].original, "Encargado del mantenimiento de la base de datos")

    def test_un_requisito_que_no_se_envio_se_descarta(self):
        revision = parsear_revision(
            _respuesta(
                requisitos=[
                    {"termino": "Docker", "sugerencia": "Haz un proyecto con contenedores"},
                    {"termino": "Rust", "sugerencia": "Inventado"},
                ]
            ),
            ENTRADA,
        )

        self.assertEqual([r.termino for r in revision.requisitos], ["Docker"])

    def test_una_correccion_cuyo_original_no_esta_en_el_cv_se_descarta(self):
        revision = parsear_revision(
            _respuesta(
                correcciones=[
                    {"original": "Desarollé una API", "sugerido": "Desarrollé una API", "tipo": "ortografia"},
                    {"original": "trabaje en equipo", "sugerido": "trabajé en equipo", "tipo": "ortografia"},
                    {"original": "Kubernetes en producción", "sugerido": "x", "tipo": "ortografia"},
                ]
            ),
            ENTRADA,
        )

        # La segunda no aparece; la tercera está en la convocatoria, no en el CV.
        self.assertEqual([c.original for c in revision.correcciones], ["Desarollé una API"])

    def test_una_correccion_de_tipo_desconocido_se_descarta(self):
        revision = parsear_revision(
            _respuesta(correcciones=[{"original": "Desarollé una API", "sugerido": "Desarrollé", "tipo": "estilo"}]),
            ENTRADA,
        )

        self.assertEqual(revision.correcciones, ())

    def test_una_pregunta_sin_motivo_en_los_textos_se_descarta(self):
        revision = parsear_revision(
            _respuesta(
                preguntas=[
                    {"pregunta": "¿Cómo partiste el monolito?", "motivo": "Migré el módulo de pagos a microservicios"},
                    {"pregunta": "¿Y Kubernetes?", "motivo": "experiencia con Kubernetes en producción"},
                    {"pregunta": "¿Inventada?", "motivo": "Lideré la migración a AWS"},
                ]
            ),
            ENTRADA,
        )

        self.assertEqual(len(revision.preguntas), 2)

    def test_un_puesto_fuera_del_catalogo_queda_nulo(self):
        self.assertIsNone(parsear_revision(_respuesta(puesto_sugerido="devops"), ENTRADA).puesto_sugerido)
        self.assertIsNone(parsear_revision(_respuesta(puesto_sugerido="ninguno"), ENTRADA).puesto_sugerido)
        self.assertEqual(parsear_revision(_respuesta(puesto_sugerido="backend"), ENTRADA).puesto_sugerido, Puesto.BACKEND)

    def test_lo_que_reproduce_un_dato_oculto_se_descarta(self):
        revision = parsear_revision(
            _respuesta(requisitos=[{"termino": "Docker", "sugerencia": "Escribe a [CORREO] para pedir referencias"}]),
            ENTRADA,
        )

        self.assertEqual(revision.requisitos, ())

    def test_se_respetan_los_topes(self):
        preguntas = [{"pregunta": f"¿{i}?", "motivo": "Desarrollador Backend"} for i in range(MAXIMO_PREGUNTAS + 3)]
        correcciones = [
            {"original": "Desarollé", "sugerido": f"Desarrollé {i}", "tipo": "ortografia"}
            for i in range(MAXIMO_CORRECCIONES + 3)
        ]
        revision = parsear_revision(_respuesta(preguntas=preguntas, correcciones=correcciones), ENTRADA)

        self.assertEqual(len(revision.preguntas), MAXIMO_PREGUNTAS)
        self.assertEqual(len(revision.correcciones), MAXIMO_CORRECCIONES)

    def test_los_dos_caminos_se_conservan_solo_para_un_ausente(self):
        caminos = {"muestralo": "Nómbralo en un logro", "ejemplo": "Desplegué [cifra] servicios", "aprendelo": "Haz un curso"}
        revision = parsear_revision(
            _respuesta(
                requisitos=[
                    {"termino": "Docker", "sugerencia": "", **caminos},
                    {"termino": "Django", "sugerencia": "Menciónalo en un logro", **caminos},
                ]
            ),
            ENTRADA,
        )

        docker, django = revision.requisitos
        self.assertEqual((docker.muestralo, docker.ejemplo, docker.aprendelo), tuple(caminos.values()))
        # Django está declarado: sus caminos no aplican y se vacían.
        self.assertEqual((django.muestralo, django.ejemplo, django.aprendelo), ("", "", ""))

    def test_un_camino_con_un_dato_oculto_se_vacia_sin_perder_el_resto(self):
        revision = parsear_revision(
            _respuesta(requisitos=[{"termino": "Docker", "sugerencia": "x", "muestralo": "Escribe a [CORREO]", "aprendelo": "Haz un curso"}]),
            ENTRADA,
        )

        self.assertEqual(revision.requisitos[0].muestralo, "")
        self.assertEqual(revision.requisitos[0].aprendelo, "Haz un curso")


class LecturaTest(unittest.TestCase):
    def _lectura(self, texto: str, entrada: EntradaDeRevision = ENTRADA) -> str:
        return parsear_revision(_respuesta(lectura=texto), entrada).lectura

    def test_una_lectura_que_solo_resume_se_conserva(self):
        texto = "Tu CV muestra Python con evidencia y no se detectó Docker."
        self.assertEqual(self._lectura(texto), texto)

    def test_una_lectura_que_juzga_la_aptitud_se_descarta(self):
        for texto in (
            "Eres apto para el puesto.",
            "Tienes un 80% de compatibilidad.",
            "Pareces una candidata idónea.",
            "Estás calificado para postular.",
            "Tu probabilidad de pasar el filtro es alta.",
            "Deberías postular sin dudar.",
        ):
            with self.subTest(texto=texto):
                self.assertEqual(self._lectura(texto), "")

    def test_aptitudes_no_es_un_juicio(self):
        texto = "Tu CV describe aptitudes de trabajo en equipo y no se detectó Docker."
        self.assertEqual(self._lectura(texto), texto)

    def test_sin_convocatoria_la_lectura_queda_vacia(self):
        sin_convocatoria = EntradaDeRevision(vinetas=(), requisitos=(), secciones="Experiencia")
        self.assertEqual(self._lectura("Tu CV muestra Python.", sin_convocatoria), "")

    def test_una_respuesta_sin_lectura_no_es_una_forma_rota(self):
        datos = _respuesta()
        del datos["lectura"]
        self.assertEqual(parsear_revision(datos, ENTRADA).lectura, "")

    def test_una_forma_rota_es_un_error(self):
        with self.assertRaises(RespuestaIAInvalida):
            parsear_revision({"vinetas": []}, ENTRADA)


class _JSONFalso(ProveedorIAporJSON):
    nombre = "json-falso"
    modelo = "json-falso-1"

    def __init__(self, respuesta: dict):
        self.respuesta = respuesta
        self.pedidos: list[tuple[str, str]] = []

    def _pedir_json(self, sistema, entrada, esquema):
        self.pedidos.append((sistema, entrada))
        return self.respuesta


class ContratoTest(unittest.TestCase):
    def test_los_proveedores_por_json_revisan_cv_sin_codigo_propio(self):
        proveedor = _JSONFalso(_respuesta(requisitos=[{"termino": "Docker", "sugerencia": "Úsalo en un proyecto"}]))

        revision = proveedor.revisar_cv(ENTRADA)

        self.assertIsInstance(proveedor, RevisorDeCV)
        self.assertEqual(revision.requisitos[0].sugerencia, "Úsalo en un proyecto")
        self.assertEqual(len(proveedor.pedidos), 1)

    def test_el_fake_cumple_el_contrato_y_su_salida_sobrevive_al_parser(self):
        revisor = get_revisor_de_cv("fake")
        revision = revisor.revisar_cv(ENTRADA)

        self.assertEqual(len(revision.vinetas), 1)
        self.assertEqual({r.termino for r in revision.requisitos}, {"Docker", "Django"})
        self.assertTrue(revision.preguntas)
        por_termino = {r.termino: r for r in revision.requisitos}
        self.assertTrue(por_termino["Docker"].muestralo and por_termino["Docker"].aprendelo)
        self.assertEqual(por_termino["Django"].muestralo, "")
        self.assertIn("Python", revision.lectura)
        # La salida del fake debe sobrevivir al mismo guardián que la de un proveedor real.
        self.assertEqual(parsear_revision(_respuesta(lectura=revision.lectura), ENTRADA).lectura, revision.lectura)

    def test_un_proveedor_que_no_revisa_cv_se_rechaza(self):
        class SoloEntrevistas(ProveedorIA):
            nombre = "solo-entrevistas"
            modelo = "x"

            def generar_preguntas_iniciales(self, contexto, areas):
                return []

            def generar_pregunta(self, contexto, area, numero, previas):
                raise NotImplementedError

            def evaluar_respuesta(self, contexto, area, pregunta, respuesta):
                raise NotImplementedError

        self.assertNotIsInstance(SoloEntrevistas(), RevisorDeCV)
        self.assertIsInstance(get_proveedor("fake"), RevisorDeCV)
        with self.assertRaises(ProveedorNoDisponible):
            get_revisor_de_cv("inexistente")

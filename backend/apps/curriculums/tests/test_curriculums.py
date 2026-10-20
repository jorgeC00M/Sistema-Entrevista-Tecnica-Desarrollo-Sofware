"""Recorre el análisis de un currículum por HTTP, como lo haría el frontend.

Las dos rutas del módulo se prueban por separado: solo el CV, y el CV contra una
convocatoria. Lo que cambia entre ellas es una sección del resultado, no si el
análisis sirve.
"""

import io
from datetime import date
from pathlib import Path
from unittest import mock

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase
from docx import Document
from rest_framework import status
from rest_framework.test import APITestCase

from apps.curriculums.models import AnalisisATS, Curriculum
from apps.curriculums.services import construir_analisis
from integrations.documentos.ats import VERSION_DE_REGLAS
from integrations.documentos.extractor import DocumentoExtraido
from integrations.ia.exceptions import ErrorTransitorio

Usuario = get_user_model()

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "cv"

TIPO_DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

CONVOCATORIA_BACKEND = """Desarrollador Backend — Jalasoft

Requisitos:
- Python y Django
- PostgreSQL
- Docker

Deseable:
- AWS
"""


def _subida(nombre: str) -> SimpleUploadedFile:
    return SimpleUploadedFile(nombre, (FIXTURES / nombre).read_bytes(), "application/pdf")


class BaseDeCurriculums(APITestCase):
    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )
        self.client.force_authenticate(self.usuario)

    def subir(self, nombre: str, **extra):
        return self.client.post(
            "/api/curriculums/", {"archivo": _subida(nombre), **extra}, format="multipart"
        )

    def pedir_revision(self, pk: int):
        return self.client.post(f"/api/curriculums/{pk}/revision/")


class SoloElCurriculumTest(BaseDeCurriculums):
    """La ruta sin convocatoria, que no debe sentirse como una versión recortada."""

    def test_no_se_exige_nada_mas_que_el_archivo(self):
        """Antes se pedía un puesto que no afectaba al análisis."""
        respuesta = self.subir("una_columna.pdf")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertFalse(respuesta.data["con_convocatoria"])

    def test_el_espejo_se_entrega_completo(self):
        respuesta = self.subir("una_columna.pdf")

        analisis = respuesta.data["analisis"]
        self.assertEqual(analisis["parseabilidad"], "8/8")
        self.assertEqual(analisis["debilidades"], [])
        self.assertTrue(analisis["fortalezas"])
        campos = [campo["nombre"] for campo in analisis["campos"]]
        self.assertEqual(
            campos,
            ["Nombre", "Correo", "Teléfono", "Ubicación", "Experiencia", "Educación", "Habilidades", "Antigüedad"],
        )

    def test_sin_convocatoria_no_hay_brecha_pero_si_inventario(self):
        """El inventario ocupa el lugar de la brecha: qué encontraría un
        reclutador al buscar por tecnología."""
        respuesta = self.subir("una_columna.pdf")

        analisis = respuesta.data["analisis"]
        self.assertIsNone(analisis["brecha"])
        self.assertIn("Python", analisis["inventario"])
        self.assertIn("PostgreSQL", analisis["inventario"])

    def test_el_inventario_de_un_cv_ilegible_queda_vacio(self):
        """No puede contradecir al espejo: si el ATS no lee nada, no lee tecnologías."""
        respuesta = self.subir("escaneado.pdf")

        self.assertEqual(respuesta.data["analisis"]["inventario"], [])

    def test_se_informan_las_vinetas_sin_resultado_medible(self):
        """Va aparte de los hallazgos de ATS: a un ATS le da igual si hay métricas."""
        respuesta = self.subir("habilidades_declaradas.pdf")

        vinetas = respuesta.data["analisis"]["vinetas"]
        self.assertIsNotNone(vinetas)
        self.assertGreater(vinetas["total"], 0)
        self.assertIn("proporcion", vinetas)

    def test_un_cv_sin_vinetas_no_trae_la_seccion(self):
        """`None` y no "0/0": permite a la interfaz omitirla en vez de mostrar un
        conteo vacío a quien redacta en párrafos."""
        respuesta = self.subir("una_columna.pdf")

        self.assertIsNone(respuesta.data["analisis"]["vinetas"])


class ContraUnaConvocatoriaTest(BaseDeCurriculums):
    def test_la_convocatoria_pegada_produce_el_mapa_de_evidencia(self):
        respuesta = self.subir("habilidades_declaradas.pdf", convocatoria=CONVOCATORIA_BACKEND)

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertTrue(respuesta.data["con_convocatoria"])
        brecha = respuesta.data["analisis"]["brecha"]
        self.assertTrue(brecha["separada"])
        self.assertTrue(brecha["con_evidencia"])

    def test_distingue_lo_demostrado_de_lo_solo_declarado(self):
        """El aporte del módulo, por HTTP.

        `habilidades_declaradas.pdf` usa Python y PostgreSQL en la experiencia, y
        solo lista Django y Docker en habilidades.
        """
        respuesta = self.subir("habilidades_declaradas.pdf", convocatoria=CONVOCATORIA_BACKEND)

        brecha = respuesta.data["analisis"]["brecha"]
        estados = {r["termino"]: r["estado"] for r in brecha["obligatorios"]["requisitos"]}
        self.assertEqual(estados["Python"], "demostrado")
        self.assertEqual(estados["PostgreSQL"], "demostrado")
        self.assertEqual(estados["Django"], "declarado")
        self.assertEqual(estados["Docker"], "declarado")

    def test_los_deseables_se_reportan_aparte(self):
        respuesta = self.subir("habilidades_declaradas.pdf", convocatoria=CONVOCATORIA_BACKEND)

        brecha = respuesta.data["analisis"]["brecha"]
        deseables = {r["termino"] for r in brecha["deseables"]["requisitos"]}
        self.assertEqual(deseables, {"AWS"})
        self.assertEqual(brecha["deseables"]["cobertura"], "0/1")

    def test_se_publican_los_requisitos_del_puesto(self):
        convocatoria = CONVOCATORIA_BACKEND.replace("- Docker", "- Docker\n- Mínimo 5 años de experiencia")
        respuesta = self.subir("habilidades_declaradas.pdf", convocatoria=convocatoria)

        brecha = respuesta.data["analisis"]["brecha"]
        self.assertEqual(brecha["cargo"], {"termino": "Desarrollador Backend", "estado": "demostrado"})
        self.assertEqual(brecha["experiencia"]["requeridos"], 5)
        self.assertEqual(brecha["experiencia"]["estado"], "no_alcanza")
        self.assertEqual(brecha["experiencia"]["calculados"], "3 años y 3 meses")
        self.assertFalse(brecha["idioma_distinto"])

    def test_la_cobertura_se_publica_en_texto(self):
        """Un porcentaje se leería como probabilidad de contratación."""
        respuesta = self.subir("habilidades_declaradas.pdf", convocatoria=CONVOCATORIA_BACKEND)

        cobertura = respuesta.data["analisis"]["brecha"]["obligatorios"]["cobertura"]
        self.assertEqual(cobertura, "4/4")
        self.assertNotIn("%", cobertura)

    def test_una_convocatoria_sin_terminos_reconocibles_no_produce_brecha(self):
        """Mostrar una cobertura vacía se leería como que no cumple nada."""
        respuesta = self.subir(
            "una_columna.pdf", convocatoria="Buscamos una persona proactiva y con ganas."
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(respuesta.data["analisis"]["brecha"])
        # Pero la ruta sí fue la de convocatoria, y el cliente lo necesita saber
        # para explicar por qué no hay mapa.
        self.assertTrue(respuesta.data["con_convocatoria"])

    def test_un_cv_ilegible_con_convocatoria_no_produce_brecha(self):
        """"0 de 4 requisitos" sería falso: no es que no cumpla, es que nadie
        puede leer el documento."""
        respuesta = self.subir("escaneado.pdf", convocatoria=CONVOCATORIA_BACKEND)

        self.assertIsNone(respuesta.data["analisis"]["brecha"])
        debilidades = respuesta.data["analisis"]["debilidades"]
        self.assertEqual(debilidades[0]["codigo"], "sin_capa_de_texto")

    def test_un_cv_con_titulos_creativos_degrada_el_mapa(self):
        """Una debilidad de formato degrada el análisis de contenido, y se informa."""
        respuesta = self.subir("titulos_creativos.pdf", convocatoria=CONVOCATORIA_BACKEND)

        brecha = respuesta.data["analisis"]["brecha"]
        self.assertFalse(brecha["con_evidencia"])

    def test_la_convocatoria_como_archivo_tambien_vale(self):
        respuesta = self.client.post(
            "/api/curriculums/",
            {
                "archivo": _subida("una_columna.pdf"),
                "archivo_convocatoria": _subida("habilidades_declaradas.pdf"),
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertTrue(respuesta.data["con_convocatoria"])

    def test_no_se_admiten_las_dos_vias_a_la_vez(self):
        """Aceptar ambas obligaría a elegir una en silencio."""
        respuesta = self.client.post(
            "/api/curriculums/",
            {
                "archivo": _subida("una_columna.pdf"),
                "convocatoria": CONVOCATORIA_BACKEND,
                "archivo_convocatoria": _subida("habilidades_declaradas.pdf"),
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_una_convocatoria_escaneada_se_rechaza_con_su_motivo(self):
        respuesta = self.client.post(
            "/api/curriculums/",
            {
                "archivo": _subida("una_columna.pdf"),
                "archivo_convocatoria": _subida("escaneado.pdf"),
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("imagen", str(respuesta.data).lower())


class _RevisorQueFalla:
    nombre = "caido"
    modelo = "caido-1"

    def __init__(self):
        self.llamadas = 0

    def revisar_cv(self, entrada):
        self.llamadas += 1
        raise ErrorTransitorio("Proveedor caído (simulado)")


class RevisionConIATest(BaseDeCurriculums):
    """La IA es complementaria y va en otra petición: nunca retrasa ni tumba el
    diagnóstico."""

    def test_el_alta_devuelve_el_diagnostico_sin_llamar_a_la_ia(self):
        espia = _RevisorQueFalla()

        with mock.patch("apps.curriculums.revision.get_revisor_de_cv", return_value=espia):
            respuesta = self.subir("una_columna.pdf")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(espia.llamadas, 0)
        self.assertEqual(respuesta.data["analisis"]["parseabilidad"], "8/8")
        self.assertIsNone(respuesta.data["analisis"]["revision_ia"])

    def test_con_el_proveedor_por_defecto_llegan_sugerencias_rotuladas(self):
        pk = self.subir("una_columna.pdf", convocatoria=CONVOCATORIA_BACKEND).data["id"]

        revision_ia = self.pedir_revision(pk).data["revision_ia"]

        self.assertEqual(revision_ia["estado"], "ok")
        self.assertEqual(revision_ia["puesto_sugerido"], "backend")
        self.assertTrue(revision_ia["preguntas"])
        # Queda guardada: abrir el análisis la trae sin pedirla otra vez.
        detalle = self.client.get(f"/api/curriculums/{pk}/").data
        self.assertEqual(detalle["analisis"]["revision_ia"]["estado"], "ok")

    def test_un_proveedor_caido_no_impide_el_diagnostico(self):
        pk = self.subir("una_columna.pdf").data["id"]

        with (
            mock.patch("apps.curriculums.revision.get_revisor_de_cv", return_value=_RevisorQueFalla()),
            self.assertLogs("apps.curriculums.revision", level="ERROR"),
        ):
            respuesta = self.pedir_revision(pk)

        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        self.assertEqual(respuesta.data["revision_ia"]["estado"], "no_disponible")
        self.assertTrue(respuesta.data["revision_ia"]["motivo"])

    def test_pedirla_otra_vez_reintenta_solo_si_fallo(self):
        pk = self.subir("una_columna.pdf").data["id"]
        with (
            mock.patch("apps.curriculums.revision.get_revisor_de_cv", return_value=_RevisorQueFalla()),
            self.assertLogs("apps.curriculums.revision", level="ERROR"),
        ):
            self.pedir_revision(pk)

        segunda = self.pedir_revision(pk)

        self.assertEqual(segunda.data["revision_ia"]["estado"], "ok")
        self.assertEqual(AnalisisATS.objects.count(), 1)

    def test_sugerencias_ya_obtenidas_no_vuelven_a_pedirse(self):
        pk = self.subir("una_columna.pdf").data["id"]
        self.pedir_revision(pk)
        caido = _RevisorQueFalla()

        with mock.patch("apps.curriculums.revision.get_revisor_de_cv", return_value=caido):
            segunda = self.pedir_revision(pk)

        self.assertEqual(caido.llamadas, 0)
        self.assertEqual(segunda.data["revision_ia"]["estado"], "ok")

    def test_la_revision_de_otro_usuario_es_404(self):
        pk = self.subir("una_columna.pdf").data["id"]
        otro = Usuario.objects.create_user(email="otro@example.com", password="clave-segura-123")
        self.client.force_authenticate(otro)

        self.assertEqual(self.pedir_revision(pk).status_code, status.HTTP_404_NOT_FOUND)


class CacheTest(BaseDeCurriculums):
    def test_resubir_el_mismo_cv_no_crea_un_segundo_analisis(self):
        """El caché es por texto, no por bytes."""
        primera = self.subir("una_columna.pdf")
        segunda = self.subir("una_columna.pdf")

        self.assertEqual(primera.data["id"], segunda.data["id"])
        self.assertEqual(Curriculum.objects.count(), 1)
        self.assertEqual(AnalisisATS.objects.count(), 1)

    def test_el_mismo_cv_con_otra_convocatoria_si_es_un_analisis_nuevo(self):
        """La referencia es parte de lo que se analizó."""
        self.subir("una_columna.pdf", convocatoria=CONVOCATORIA_BACKEND)
        self.subir("una_columna.pdf", convocatoria="Requisitos:\n- React\n- TypeScript\n")

        self.assertEqual(Curriculum.objects.count(), 2)

    def test_el_mismo_cv_con_y_sin_convocatoria_son_analisis_distintos(self):
        """Sin convocatoria se guarda el hash de la cadena vacía, no NULL: con
        NULL la restricción de unicidad no distinguiría estos dos casos."""
        self.subir("una_columna.pdf")
        self.subir("una_columna.pdf", convocatoria=CONVOCATORIA_BACKEND)

        self.assertEqual(Curriculum.objects.count(), 2)

    def test_un_analisis_de_reglas_anteriores_se_recalcula_sin_duplicarse(self):
        """Sin la versión, el caché seguiría mostrando el diagnóstico viejo."""
        primera = self.subir("una_columna.pdf")
        AnalisisATS.objects.update(version_reglas=VERSION_DE_REGLAS - 1, campos_intentados=7, campos=[])

        segunda = self.subir("una_columna.pdf")

        self.assertEqual(primera.data["id"], segunda.data["id"])
        self.assertEqual(segunda.data["analisis"]["parseabilidad"], "8/8")
        self.assertEqual(Curriculum.objects.count(), 1)
        self.assertEqual(AnalisisATS.objects.count(), 1)
        self.assertEqual(AnalisisATS.objects.get().version_reglas, VERSION_DE_REGLAS)

    def test_un_analisis_vigente_no_se_recalcula(self):
        self.subir("una_columna.pdf")
        AnalisisATS.objects.update(campos_detectados=0)

        segunda = self.subir("una_columna.pdf")

        # Si se hubiera recalculado, volvería a decir 8/8.
        self.assertEqual(segunda.data["analisis"]["parseabilidad"], "0/8")

    def test_dos_docx_que_solo_difieren_en_el_encabezado_son_documentos_distintos(self):
        self.subir_docx("correo_en_encabezado.docx")
        self.subir_docx("correo_en_encabezado.docx", encabezado="otro@example.com")

        self.assertEqual(Curriculum.objects.count(), 2)

    def subir_docx(self, nombre: str, encabezado: str | None = None):
        contenido = (FIXTURES / nombre).read_bytes()
        if encabezado is not None:
            documento = Document(io.BytesIO(contenido))
            documento.sections[0].header.paragraphs[0].text = encabezado
            salida = io.BytesIO()
            documento.save(salida)
            contenido = salida.getvalue()
        archivo = SimpleUploadedFile(nombre, contenido, TIPO_DOCX)
        return self.client.post("/api/curriculums/", {"archivo": archivo}, format="multipart")


class ValidacionDeEntradaTest(BaseDeCurriculums):
    def test_una_imagen_se_rechaza_con_su_motivo(self):
        respuesta = self.client.post(
            "/api/curriculums/",
            {"archivo": SimpleUploadedFile("cv.jpg", b"\xff\xd8\xff\xe0 jpeg", "image/jpeg")},
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("PDF", str(respuesta.data))

    def test_un_pdf_danado_devuelve_400_y_no_500(self):
        """Lo traduce el manejador central, no la vista."""
        respuesta = self.client.post(
            "/api/curriculums/",
            {
                "archivo": SimpleUploadedFile(
                    "cv.pdf", b"%PDF-1.4\nesto no es un pdf", "application/pdf"
                )
            },
            format="multipart",
        )

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_el_texto_extraido_no_se_publica(self):
        """Es el CV entero de una persona real y el cliente ya tiene el original."""
        respuesta = self.subir("una_columna.pdf", convocatoria=CONVOCATORIA_BACKEND)

        self.assertNotIn("texto", respuesta.data)
        self.assertNotIn("convocatoria", respuesta.data)

    def test_sin_autenticar_se_rechaza(self):
        self.client.force_authenticate(None)

        respuesta = self.client.get("/api/curriculums/")

        self.assertEqual(respuesta.status_code, status.HTTP_401_UNAUTHORIZED)


class HistorialTest(BaseDeCurriculums):
    def test_lista_los_analisis_del_usuario_con_su_metrica(self):
        self.subir("una_columna.pdf")
        self.subir("titulos_creativos.pdf", convocatoria=CONVOCATORIA_BACKEND)

        historial = self.client.get("/api/curriculums/")

        self.assertEqual(historial.status_code, status.HTTP_200_OK)
        self.assertEqual(len(historial.data), 2)
        self.assertIn("parseabilidad", historial.data[0])
        self.assertIn("con_convocatoria", historial.data[0])


class PertenenciaTest(APITestCase):
    """El CV de otra persona no existe, no está prohibido."""

    def setUp(self):
        self.propietaria = Usuario.objects.create_user(
            email="propietaria@example.com", password="clave-segura-123"
        )
        self.ajeno = Usuario.objects.create_user(
            email="ajeno@example.com", password="clave-segura-123"
        )
        self.client.force_authenticate(self.propietaria)
        creado = self.client.post(
            "/api/curriculums/", {"archivo": _subida("una_columna.pdf")}, format="multipart"
        )
        self.pk = creado.data["id"]

    def test_pedir_el_curriculum_de_otro_devuelve_404(self):
        self.client.force_authenticate(self.ajeno)

        respuesta = self.client.get(f"/api/curriculums/{self.pk}/")

        # 404 y no 403: un 403 confirmaría que ese currículum existe.
        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)

    def test_el_historial_solo_muestra_lo_propio(self):
        self.client.force_authenticate(self.ajeno)

        historial = self.client.get("/api/curriculums/")

        self.assertEqual(historial.data, [])


class ConstruirAnalisisTest(SimpleTestCase):
    """El contenido del análisis, sin base de datos: es una función pura."""

    CV = (
        "Jorge Condori Maita\njorge@example.com\n+591 71234567\nCochabamba, Bolivia\n\n"
        "Experiencia\nDesarrollador Backend, Jalasoft\nEne 2020 - Mar 2023\n"
        "Desarrollador con experiencia en el diseño de APIs y en la optimización de "
        "consultas para una base de datos. Trabajé durante dos años como parte de un "
        "equipo de desarrollo con metodologías ágiles.\n\n"
        "Habilidades\nPython, Django\n"
    )
    CONVOCATORIA = (
        "We are looking for a Backend Developer with experience in the design of "
        "APIs. You will work with our team on the migration of services to the "
        "cloud and the optimization of queries.\nRequirements:\n- Python\n"
    )

    def _construir(self, convocatoria: str) -> dict:
        documento = DocumentoExtraido(texto=self.CV, formato="pdf", paginas=1)
        return construir_analisis(documento, convocatoria, date(2026, 6, 15))

    def test_idiomas_distintos_agregan_su_hallazgo(self):
        codigos = {h["codigo"] for h in self._construir(self.CONVOCATORIA)["hallazgos"]["debilidades"]}

        self.assertIn("idioma_distinto", codigos)

    def test_sin_convocatoria_no_hay_brecha_ni_aviso_de_idioma(self):
        valores = self._construir("")

        self.assertIsNone(valores["brecha"])
        self.assertNotIn("idioma_distinto", {h["codigo"] for h in valores["hallazgos"]["debilidades"]})

    def test_se_guarda_la_version_de_las_reglas(self):
        self.assertEqual(self._construir("")["version_reglas"], VERSION_DE_REGLAS)

"""Recorre el análisis de un currículum por HTTP, como lo haría el frontend.

Las dos rutas del módulo se prueban por separado: solo el CV, y el CV contra una
convocatoria. Lo que cambia entre ellas es una sección del resultado, no si el
análisis sirve.
"""

from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.curriculums.models import AnalisisATS, Curriculum

Usuario = get_user_model()

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "cv"

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
        self.assertEqual(analisis["parseabilidad"], "7/7")
        self.assertEqual(analisis["debilidades"], [])
        self.assertTrue(analisis["fortalezas"])
        campos = {campo["nombre"] for campo in analisis["campos"]}
        self.assertEqual(
            campos,
            {"Nombre", "Correo", "Teléfono", "Experiencia", "Educación", "Habilidades", "Antigüedad"},
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

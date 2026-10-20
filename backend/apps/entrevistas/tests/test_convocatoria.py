"""Entrevista desde una convocatoria: analizarla, usarla y que oriente las preguntas.

La IA va simulada: `FakeProveedorIA` detecta el perfil con reglas fijas y un
espía registra lo que recibe cada operación.
"""

import io
from pathlib import Path
from unittest import mock

import docx
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from apps.entrevistas import services as servicio
from apps.entrevistas.convocatorias import analizar_convocatoria
from apps.entrevistas.models import Convocatoria, Entrevista
from integrations.ia.fake import FakeProveedorIA
from tests.conftest import crear_usuario, nivel_de, puesto_de, tecnologia_de

URL = "/api/entrevistas/convocatoria/"
FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "cv"

AVISO_BACKEND = (
    "Empresa de software en Cochabamba busca Desarrollador Backend Junior. Requisitos: "
    "experiencia con Python y Django, diseño de APIs REST, PostgreSQL y control de versiones "
    "con Git. Deseable: Docker y AWS. Enviar CV a rrhh@empresa.com o al 71234567."
)
AVISO_CONTADOR = "Se busca contador público con experiencia en tributación y balances para empresa comercial."


class Espia(FakeProveedorIA):
    """Registra lo que recibe el analizador y lo que recibe cada prompt."""

    def __init__(self):
        super().__init__()
        self.entradas = []
        self.contextos_de_preguntas = []
        self.contextos_de_evaluacion = []

    def analizar_convocatoria(self, entrada):
        self.entradas.append(entrada)
        return super().analizar_convocatoria(entrada)

    def generar_preguntas_iniciales(self, contexto, areas):
        self.contextos_de_preguntas.append(contexto)
        return super().generar_preguntas_iniciales(contexto, areas)

    def evaluar_respuesta(self, contexto, area, pregunta, respuesta):
        self.contextos_de_evaluacion.append(contexto)
        return super().evaluar_respuesta(contexto, area, pregunta, respuesta)


def _docx(texto: str) -> SimpleUploadedFile:
    documento = docx.Document()
    for parrafo in texto.split(". "):
        documento.add_paragraph(parrafo)
    salida = io.BytesIO()
    documento.save(salida)
    return SimpleUploadedFile(
        "aviso.docx",
        salida.getvalue(),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


class AnalizarConvocatoriaServicioTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.espia = Espia()

    def test_enmascara_lo_guardado_y_lo_enviado(self):
        convocatoria = analizar_convocatoria(self.usuario, AVISO_BACKEND, analizador=self.espia)

        for texto in (convocatoria.texto, self.espia.entradas[0].texto):
            with self.subTest(texto=texto[:30]):
                self.assertNotIn("rrhh@empresa.com", texto)
                self.assertNotIn("71234567", texto)

    def test_el_mismo_aviso_no_vuelve_a_llamar_a_la_ia(self):
        primera = analizar_convocatoria(self.usuario, AVISO_BACKEND, analizador=self.espia)
        segunda = analizar_convocatoria(self.usuario, AVISO_BACKEND, analizador=self.espia)

        self.assertEqual(primera.pk, segunda.pk)
        self.assertEqual(len(self.espia.entradas), 1)

    def test_otro_usuario_no_comparte_la_cache(self):
        analizar_convocatoria(self.usuario, AVISO_BACKEND, analizador=self.espia)
        otro = crear_usuario(email="otro@example.com")
        analizar_convocatoria(otro, AVISO_BACKEND, analizador=self.espia)

        self.assertEqual(len(self.espia.entradas), 2)
        self.assertEqual(Convocatoria.objects.count(), 2)

    def test_lleva_el_catalogo_y_las_pistas_a_la_ia(self):
        analizar_convocatoria(self.usuario, AVISO_BACKEND, analizador=self.espia)
        entrada = self.espia.entradas[0]

        self.assertIn("backend", [p.codigo for p in entrada.puestos])
        self.assertEqual([n.codigo for n in entrada.niveles], ["junior", "semi_senior", "senior"])
        self.assertIn("PostgreSQL", entrada.terminos)

    def test_no_identificado_tambien_se_guarda(self):
        convocatoria = analizar_convocatoria(self.usuario, AVISO_CONTADOR, analizador=self.espia)

        self.assertFalse(convocatoria.perfil["identificado"])
        analizar_convocatoria(self.usuario, AVISO_CONTADOR, analizador=self.espia)
        self.assertEqual(len(self.espia.entradas), 1)


class AnalizarConvocatoriaAPITest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.enterContext(
            mock.patch("apps.entrevistas.convocatorias.get_analizador_de_convocatoria", return_value=Espia())
        )

    def test_texto_pegado_devuelve_el_perfil(self):
        respuesta = self.client.post(URL, {"texto": AVISO_BACKEND}, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        perfil = respuesta.data["perfil"]
        self.assertEqual((perfil["puesto"], perfil["tecnologias"], perfil["nivel"]), ("backend", ["backend_django"], "junior"))
        self.assertEqual(perfil["puesto_nombre"], "Desarrollador Backend")
        self.assertEqual(perfil["tecnologias_nombres"], ["Django"])
        self.assertNotIn("tecnologia", perfil)
        self.assertIn("PostgreSQL", perfil["requisitos"])

    def test_full_stack_trae_frontend_y_backend(self):
        aviso = "Startup busca Desarrollador Full Stack Junior con React y Express, APIs REST y Git."

        perfil = self.client.post(URL, {"texto": aviso}, format="json").data["perfil"]

        self.assertEqual(perfil["tecnologias"], ["full_stack_react", "full_stack_express"])
        self.assertEqual(perfil["tecnologias_nombres"], ["React", "Express"])

    def test_un_perfil_guardado_con_el_formato_anterior_se_sigue_leyendo(self):
        """Antes de las capas el perfil guardaba `tecnologia`: se lee como lista."""
        from apps.entrevistas.serializers import ConvocatoriaSerializer

        convocatoria = Convocatoria.objects.create(
            usuario=self.usuario,
            hash="anterior",
            texto="Aviso anterior",
            perfil={"identificado": True, "puesto": "backend", "tecnologia": "backend_django", "nivel": "junior"},
        )

        perfil = ConvocatoriaSerializer(convocatoria).data["perfil"]

        self.assertEqual(perfil["tecnologias"], ["backend_django"])
        self.assertEqual(perfil["tecnologias_nombres"], ["Django"])
        self.assertNotIn("tecnologia", perfil)

    def test_archivo_docx(self):
        respuesta = self.client.post(URL, {"archivo": _docx(AVISO_BACKEND)}, format="multipart")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(respuesta.data["perfil"]["puesto"], "backend")

    def test_pdf_escaneado(self):
        archivo = SimpleUploadedFile("aviso.pdf", (FIXTURES / "escaneado.pdf").read_bytes(), "application/pdf")

        respuesta = self.client.post(URL, {"archivo": archivo}, format="multipart")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Pega el texto", str(respuesta.data))

    def test_texto_y_archivo_a_la_vez(self):
        respuesta = self.client.post(URL, {"texto": AVISO_BACKEND, "archivo": _docx(AVISO_BACKEND)}, format="multipart")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_texto_demasiado_corto(self):
        respuesta = self.client.post(URL, {"texto": "Backend"}, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)

    def test_aviso_que_no_es_de_software(self):
        respuesta = self.client.post(URL, {"texto": AVISO_CONTADOR}, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn("No pudimos identificar el puesto", respuesta.data["detail"])

    def test_requiere_sesion(self):
        self.client.force_authenticate(None)

        self.assertEqual(self.client.post(URL, {"texto": AVISO_BACKEND}, format="json").status_code, 401)


class IniciarConConvocatoriaTest(APITestCase):
    def setUp(self):
        self.usuario = crear_usuario()
        self.client.force_authenticate(self.usuario)
        self.espia = Espia()
        self.enterContext(mock.patch("apps.entrevistas.services.get_proveedor", return_value=self.espia))
        self.convocatoria = analizar_convocatoria(self.usuario, AVISO_BACKEND, analizador=FakeProveedorIA())

    def _iniciar(self, **extra):
        cuerpo = {"puesto": "backend", "tecnologia": "backend_django", "nivel": "junior", **extra}
        return self.client.post("/api/entrevistas/", cuerpo, format="json")

    def test_los_requisitos_llegan_al_entrevistador_y_no_al_evaluador(self):
        respuesta = self._iniciar(convocatoria=self.convocatoria.pk)

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertTrue(respuesta.data["entrevista"]["desde_convocatoria"])
        self.assertIn("PostgreSQL", self.espia.contextos_de_preguntas[0].requisitos)

        entrevista = Entrevista.objects.get()
        servicio.responder(entrevista, "Una respuesta", proveedor=self.espia)
        # El contexto llega al evaluador (es el mismo objeto), pero su prompt no
        # usa los requisitos: lo fija `test_prompts.RequisitosDeConvocatoriaTest`.
        from integrations.ia.prompts import evaluador

        prompt = evaluador.sistema(self.espia.contextos_de_evaluacion[0], entrevista.intercambios.first().area_enum)
        self.assertNotIn("PostgreSQL", prompt)

    def test_convocatoria_ajena_es_404(self):
        otro = crear_usuario(email="otro@example.com")
        ajena = analizar_convocatoria(otro, AVISO_BACKEND, analizador=FakeProveedorIA())

        respuesta = self._iniciar(convocatoria=ajena.pk)

        self.assertEqual(respuesta.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(Entrevista.objects.exists())

    def test_sin_convocatoria_es_como_siempre(self):
        respuesta = self._iniciar()

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertFalse(respuesta.data["entrevista"]["desde_convocatoria"])
        self.assertEqual(self.espia.contextos_de_preguntas[0].requisitos, ())

    def test_el_servicio_tambien_acepta_la_convocatoria(self):
        entrevista = servicio.iniciar(
            self.usuario,
            puesto_de("backend"),
            nivel_de("junior"),
            tecnologia_de("backend_django"),
            proveedor=self.espia,
            convocatoria=self.convocatoria,
        )

        self.assertEqual(entrevista.convocatoria, self.convocatoria)

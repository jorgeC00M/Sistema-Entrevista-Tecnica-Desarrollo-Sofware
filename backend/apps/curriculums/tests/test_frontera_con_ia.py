"""Qué del currículum puede salir hacia un proveedor de IA, y por dónde.

**Si este test está en rojo, no se relaja: se arregla la fuga.**
`Curriculum.texto` contiene el documento completo de una persona real —nombre,
correo, teléfono y a veces dirección—. Desde que el módulo pide sugerencias a una
IA, lo que hay que garantizar ya no es que nada salga, sino **qué** sale y **por
dónde**:

- **Por dónde.** Solo `apps/curriculums/revision.py` puede importar la capa de
  IA. Concentrarlo es lo que permite auditar en un solo archivo todo lo que sale.
- **Qué.** Un proveedor espía, como el de `apps/entrevistas/tests/test_privacidad.py`,
  registra cada texto que recibe; el test comprueba que no lleva el nombre, el
  correo, el teléfono ni el encabezado del CV.
- **Cuándo no.** Sin secciones reconocidas o sin capa de texto el proveedor no
  se llama: no hay forma segura de separar los datos personales del resto.

Esta es la reescritura que pedía la versión anterior de este archivo, que
prohibía cualquier import: "llegó la fase de revisión de contenido con IA; en ese
caso este archivo se reescribe con un proveedor espía, no se borra". Entonces no
había nada que observar y el espía habría pasado por vacío; ahora sí lo hay.

Dos lecciones de la versión anterior siguen aquí. La comprobación estática
recorre el árbol sintáctico completo, así que ve también un import dentro de una
función. Y el guardia de ejecución usa un finder en `sys.meta_path`, no un parche
sobre `get_proveedor`: un módulo que hizo `from ... import get_proveedor` ya copió
la referencia y el parche no interceptaba nada. Ambas cosas se verificaron
inyectando la violación, no se supusieron.
"""

import ast
import contextlib
import sys
from importlib.abc import MetaPathFinder
from pathlib import Path

from django.contrib.auth import get_user_model
from django.test import SimpleTestCase, TestCase

from apps.curriculums import revision, services
from integrations.documentos.extractor import DocumentoExtraido
from integrations.ia.prompts.revisor_cv import RevisionDeCV

Usuario = get_user_model()

#: Los módulos de la app, sin sus tests: un test sí puede nombrar la capa de IA
#: para vigilarla, como hace este mismo archivo.
PAQUETE = Path(__file__).resolve().parent.parent
MODULOS = sorted(p for p in PAQUETE.glob("*.py") if p.name != "__init__.py")

CAPA_DE_IA = "integrations.ia"
#: El único módulo de la app autorizado a importarla.
FRONTERA = "revision.py"

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "cv"

# Lo que trae el encabezado de `una_columna.pdf`.
NOMBRE = "Jorge Condori Maita"
CORREO = "jorge.condori@example.com"
TELEFONO = "71234567"
CIUDAD = "Cochabamba"


def _importa_la_capa_de_ia(arbol: ast.AST) -> bool:
    """Busca el import en el árbol sintáctico, no en el texto del archivo.

    Con una búsqueda de texto esta prueba fallaría por los docstrings, que nombran
    `integrations.ia` para explicar la frontera. Un comentario que la documenta no
    es una violación.
    """
    for nodo in ast.walk(arbol):
        if isinstance(nodo, ast.Import):
            if any(alias.name.startswith(CAPA_DE_IA) for alias in nodo.names):
                return True
        elif isinstance(nodo, ast.ImportFrom):
            if nodo.module and nodo.module.startswith(CAPA_DE_IA):
                return True
    return False


def _arbol(ruta: Path) -> ast.AST:
    return ast.parse(ruta.read_text(encoding="utf-8"), filename=str(ruta))


class FronteraEstaticaTest(SimpleTestCase):
    def test_solo_revision_importa_la_capa_de_ia(self):
        culpables = [ruta.name for ruta in MODULOS if ruta.name != FRONTERA and _importa_la_capa_de_ia(_arbol(ruta))]

        self.assertEqual(
            culpables,
            [],
            f"Estos módulos de apps/curriculums importan {CAPA_DE_IA}: {culpables}. "
            f"Todo lo que sale hacia la IA pasa por {FRONTERA}, que minimiza y enmascara. "
            "Ver el docstring de este archivo.",
        )

    def test_la_frontera_existe_donde_se_dice(self):
        """Si `revision.py` dejara de importar la capa de IA, la frontera se habría
        movido a otro sitio sin que este test se enterara."""
        self.assertTrue(_importa_la_capa_de_ia(_arbol(PAQUETE / FRONTERA)))

    def test_la_comprobacion_detectaria_una_violacion(self):
        """Que el test pase no basta: hay que saber que sabría fallar, también con
        un import escondido dentro de una función."""
        self.assertTrue(_importa_la_capa_de_ia(ast.parse("from integrations.ia.factory import get_proveedor")))
        self.assertTrue(_importa_la_capa_de_ia(ast.parse("import integrations.ia.factory")))
        self.assertTrue(
            _importa_la_capa_de_ia(ast.parse("def f():\n    from integrations.ia import factory\n"))
        )
        self.assertFalse(_importa_la_capa_de_ia(ast.parse("from integrations.documentos.ats import analizar")))


class RevisorEspia:
    """Registra todo lo que recibiría un proveedor externo."""

    nombre = "espia"
    modelo = "espia-1"

    def __init__(self):
        self.textos: list[str] = []
        self.llamadas = 0

    def revisar_cv(self, entrada):
        self.llamadas += 1
        self.textos.extend([entrada.secciones, entrada.convocatoria, *entrada.vinetas])
        self.textos.extend(f"{r.termino} {r.estado}" for r in entrada.requisitos)
        return RevisionDeCV(vinetas=(), requisitos=(), preguntas=(), puesto_sugerido=None, correcciones=())

    @property
    def todo(self) -> str:
        return "\n".join(self.textos)


class _ProhibeLaCapaDeIA(MetaPathFinder):
    """Falla si alguien intenta importar la capa de IA mientras está puesto."""

    def find_spec(self, fullname, path=None, target=None):
        if fullname == CAPA_DE_IA or fullname.startswith(f"{CAPA_DE_IA}."):
            raise AssertionError(f"Se importó {fullname} durante el análisis con un revisor inyectado.")
        return None


@contextlib.contextmanager
def _sin_acceso_a_la_capa_de_ia():
    """Impide cargar módulos de la capa de IA dentro del bloque.

    Se vacía `sys.modules` además de instalar el finder, porque un módulo ya
    cacheado se devuelve sin consultar `meta_path`; al salir se reponen tal cual,
    porque otros tests de la suite dependen de ellos.
    """
    cacheados = {
        nombre: modulo
        for nombre, modulo in sys.modules.items()
        if nombre == CAPA_DE_IA or nombre.startswith(f"{CAPA_DE_IA}.")
    }
    for nombre in cacheados:
        del sys.modules[nombre]

    finder = _ProhibeLaCapaDeIA()
    sys.meta_path.insert(0, finder)
    try:
        yield
    finally:
        sys.meta_path.remove(finder)
        sys.modules.update(cacheados)


class LoQueSaleTest(TestCase):
    """Por HTTP no: por el servicio, con el espía inyectado como lo haría la vista."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(email="egresado@example.com", password="clave-segura-123")
        self.espia = RevisorEspia()

    def _analizar(self, fixture: str, **extra):
        return services.analizar(
            usuario=self.usuario,
            contenido=(FIXTURES / fixture).read_bytes(),
            nombre_archivo=fixture,
            revisor=self.espia,
            **extra,
        )

    def test_el_encabezado_no_sale(self):
        self._analizar("una_columna.pdf", convocatoria="Requisitos:\n- Docker\n- Python\n")

        self.assertEqual(self.espia.llamadas, 1)
        for dato in (NOMBRE, "Condori", CORREO, TELEFONO, CIUDAD):
            self.assertNotIn(dato, self.espia.todo)

    def test_lo_que_sale_si_sirve_para_sugerir(self):
        """Un espía que no recibe nada pasaría siempre: hay que ver qué sí llega."""
        self._analizar("una_columna.pdf", convocatoria="Requisitos:\n- Docker\n- Kubernetes\n")

        self.assertIn("Jalasoft", self.espia.todo)
        # Docker está solo en la lista de habilidades; Kubernetes no aparece.
        self.assertIn("Docker declarado", self.espia.todo)
        self.assertIn("Kubernetes ausente", self.espia.todo)

    def test_sin_secciones_reconocidas_no_se_llama_al_proveedor(self):
        curriculum = self._analizar("titulos_creativos.pdf")

        self.assertEqual(self.espia.llamadas, 0)
        self.assertEqual(curriculum.analisis.revision_ia["estado"], revision.OMITIDA)

    def test_un_cv_escaneado_no_llama_al_proveedor(self):
        self._analizar("escaneado.pdf")

        self.assertEqual(self.espia.llamadas, 0)

    def test_con_un_revisor_inyectado_nada_mas_carga_la_capa_de_ia(self):
        """Lo que la estática no ve: un import que ocurriera fuera de la app, en
        cualquier punto de la cadena de llamadas. Con el revisor inyectado no
        debe cargarse ningún módulo de la capa de IA."""
        with _sin_acceso_a_la_capa_de_ia():
            self._analizar("una_columna.pdf", convocatoria="Requisitos:\n- Docker\n")

        self.assertEqual(self.espia.llamadas, 1)


class EnmascaradoDentroDeLasSeccionesTest(SimpleTestCase):
    """Lo que se cuela dentro de una sección, donde la minimización no alcanza."""

    CV = (
        "Jorge Condori Maita\njorge@example.com\n\n"
        "Experiencia\nDesarrollador Backend, Jalasoft\nEne 2020 - Mar 2023\n"
        "- Encargado del soporte; contacto de referencia: jorge.condori@example.com, +591 76543210\n"
        "- Portafolio en https://github.com/jcondori\n"
        "- Proyecto de Condori premiado\n\n"
        "Habilidades\nPython, Django\n"
    )

    def test_correo_telefono_enlace_y_nombre_se_tapan(self):
        espia = RevisorEspia()
        documento = DocumentoExtraido(texto=self.CV, formato="pdf", paginas=1)
        vinetas = {"sin_resultado": ["Encargado del soporte; contacto de referencia: jorge.condori@example.com, +591 76543210"]}

        resultado = revision.revisar(documento, vinetas, None, "", revisor=espia)

        self.assertEqual(resultado["estado"], revision.OK)
        for dato in ("example.com", "76543210", "github.com", "Condori"):
            self.assertNotIn(dato, espia.todo)
        self.assertIn("[CORREO]", espia.todo)

    def test_el_guardia_sabe_fallar(self):
        with self.assertRaises(AssertionError):
            with _sin_acceso_a_la_capa_de_ia():
                import integrations.ia.factory  # noqa: F401

    def test_el_guardia_deja_pasar_lo_demas_y_repone_los_modulos(self):
        with _sin_acceso_a_la_capa_de_ia():
            import integrations.documentos.ats  # noqa: F401

        from integrations.ia.factory import get_proveedor  # noqa: F401

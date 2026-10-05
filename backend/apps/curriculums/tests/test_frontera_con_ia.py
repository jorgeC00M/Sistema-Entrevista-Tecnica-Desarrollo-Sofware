"""El texto de un currículum no puede salir hacia un proveedor de IA.

**Si este test está en rojo, una de dos cosas pasó.**

La primera: alguien conectó el módulo de currículums con la capa de IA y el CV se
está enviando tal cual. `Curriculum.texto` contiene el documento completo de una
persona real —nombre, correo, teléfono y a veces dirección—, así que eso es una
fuga de datos personales hacia un tercero. La solución es enmascararlos antes de
enviar, no relajar esta prueba.

La segunda: llegó la fase de revisión de contenido con IA, que es trabajo previsto.
En ese caso este archivo **se reescribe**, no se borra: el reemplazo es un proveedor
espía como el de `apps/entrevistas/tests/test_privacidad.py`, que registra cada
texto recibido y comprueba que no contiene los datos identificatorios. Borrar el
test en silencio es exactamente cómo se pierde una garantía.

**Por qué es una prueba de frontera y no de comportamiento.** Lo natural sería el
proveedor espía desde ya. Pero hoy nada envía el CV, así que ese test no tendría
nada que observar: pasaría por vacío y daría una falsa sensación de cobertura, que
es peor que no tenerlo. Lo que sí se puede verificar ahora es que el acoplamiento
no existe, y eso falla en el instante en que alguien lo crea — que es justo cuando
hay que detenerse a pensar.

Son dos comprobaciones porque cada una ve lo que la otra no:

- la **estática** lee los imports escritos en los archivos de `apps/curriculums/`,
  anidados o no: recorre el árbol sintáctico completo;
- la de **ejecución** detecta el import que ocurre fuera de esos archivos, en
  cualquier punto de la cadena de llamadas del análisis, que la estática no lee.
"""

import ast
import contextlib
import sys
from importlib.abc import MetaPathFinder
from pathlib import Path

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.curriculums import services

Usuario = get_user_model()

#: Los módulos del módulo de currículums, sin sus tests: un test sí puede nombrar
#: la capa de IA para vigilarla, como hace este mismo archivo.
PAQUETE = Path(__file__).resolve().parent.parent
MODULOS = sorted(p for p in PAQUETE.glob("*.py") if p.name != "__init__.py")

CAPA_PROHIBIDA = "integrations.ia"

FIXTURES = Path(__file__).resolve().parents[3] / "tests" / "fixtures" / "cv"

CONVOCATORIA = "Requisitos:\n- Python\n- Django\n"


def _importa_la_capa_de_ia(ruta: Path) -> bool:
    """Busca el import en el árbol sintáctico, no en el texto del archivo.

    Con una búsqueda de texto esta prueba estaría en rojo desde el primer día: los
    docstrings de `models.py` y `services.py` mencionan `integrations.ia` varias
    veces para explicar por qué el CV **no** se envía. Un comentario que documenta
    la frontera no es una violación de la frontera.
    """
    arbol = ast.parse(ruta.read_text(encoding="utf-8"), filename=str(ruta))

    for nodo in ast.walk(arbol):
        if isinstance(nodo, ast.Import):
            if any(alias.name.startswith(CAPA_PROHIBIDA) for alias in nodo.names):
                return True
        elif isinstance(nodo, ast.ImportFrom):
            if nodo.module and nodo.module.startswith(CAPA_PROHIBIDA):
                return True
    return False


class FronteraEstaticaTest(TestCase):
    def test_ningun_modulo_de_curriculums_importa_la_capa_de_ia(self):
        culpables = [ruta.name for ruta in MODULOS if _importa_la_capa_de_ia(ruta)]

        self.assertEqual(
            culpables,
            [],
            "Estos módulos de apps/curriculums importan integrations.ia: "
            f"{culpables}. El texto del CV lleva datos personales; si hay que "
            "enviarlo a un proveedor, antes tiene que pasar por la anonimización. "
            "Ver el docstring de este archivo.",
        )

    def test_la_comprobacion_detectaria_una_violacion(self):
        """Que el test pase no basta: hay que saber que sabría fallar.

        Un detector de imports con un error tonto —el prefijo mal escrito, el tipo
        de nodo equivocado— pasaría siempre y no vigilaría nada. Esto fija que la
        función reconoce las dos formas de importar.
        """
        with_import_from = ast.parse("from integrations.ia.factory import get_proveedor")
        with_import = ast.parse("import integrations.ia.factory")
        sin_import = ast.parse("from integrations.documentos.ats import analizar")

        # Se reutiliza la lógica del recorrido sobre árboles ya construidos.
        def detecta(arbol) -> bool:
            for nodo in ast.walk(arbol):
                if isinstance(nodo, ast.Import):
                    if any(a.name.startswith(CAPA_PROHIBIDA) for a in nodo.names):
                        return True
                elif isinstance(nodo, ast.ImportFrom):
                    if nodo.module and nodo.module.startswith(CAPA_PROHIBIDA):
                        return True
            return False

        self.assertTrue(detecta(with_import_from))
        self.assertTrue(detecta(with_import))
        self.assertFalse(detecta(sin_import))


class _ProhibeLaCapaDeIA(MetaPathFinder):
    """Falla si alguien intenta importar `integrations.ia` mientras está puesto."""

    def find_spec(self, fullname, path=None, target=None):
        if fullname == CAPA_PROHIBIDA or fullname.startswith(f"{CAPA_PROHIBIDA}."):
            raise AssertionError(
                f"apps.curriculums importó {fullname} durante el análisis. El "
                "texto del CV lleva datos personales: antes de enviarlo a un "
                "proveedor hay que enmascararlos. Ver el docstring de este archivo."
            )
        # `None` significa "no me toca resolverlo"; el resto de los finders siguen.
        return None


@contextlib.contextmanager
def _sin_acceso_a_la_capa_de_ia():
    """Impide importar `integrations.ia` dentro del bloque.

    Se hace con un finder en `sys.meta_path` y no parcheando `get_proveedor`, y la
    diferencia importa. `patch("integrations.ia.factory.get_proveedor")` sustituye
    el nombre en su módulo de origen, pero un módulo que hizo
    `from ... import get_proveedor` ya copió la referencia y el parche no la toca:
    el test pasaba sin vigilar nada. Esto se verificó inyectando la llamada a mano.

    El finder no depende de cómo se obtuvo la referencia ni de cuántos adaptadores
    existan. Hay que vaciar `sys.modules` además de instalarlo, porque un módulo ya
    cacheado se devuelve sin consultar `meta_path` — y en una corrida completa de
    la suite otros tests ya importaron la capa de IA.

    **Qué aporta sobre la comprobación estática.** No es el import diferido: se
    comprobó, y `ast.walk` recorre también los cuerpos de las funciones, así que la
    estática ve cualquier import escrito en los archivos de la app, anidado o no.
    Lo que esta añade es el import que ocurre **fuera** de `apps/curriculums/`: si
    un módulo de `integrations/documentos/` o un ayudante cualquiera de la cadena de
    llamadas importara la capa de IA, la estática no lo vería porque solo lee los
    archivos de la app.

    Lo que no ve: un `from ... import` en el nivel superior de un módulo ya
    cargado, que se ejecuta mucho antes de que este bloque empiece. Ese es
    justamente el caso que la estática sí lee.
    """
    cacheados = {
        nombre: modulo
        for nombre, modulo in sys.modules.items()
        if nombre == CAPA_PROHIBIDA or nombre.startswith(f"{CAPA_PROHIBIDA}.")
    }
    for nombre in cacheados:
        del sys.modules[nombre]

    finder = _ProhibeLaCapaDeIA()
    sys.meta_path.insert(0, finder)
    try:
        yield
    finally:
        sys.meta_path.remove(finder)
        # Se reponen los módulos tal como estaban: otros tests de la suite
        # dependen de ellos y volver a importarlos daría objetos distintos.
        sys.modules.update(cacheados)


class FronteraEnEjecucionTest(TestCase):
    """Cubre el import que ocurre fuera de `apps/curriculums/`.

    La comprobación estática solo lee los archivos de la app. Si algún módulo de
    la cadena de llamadas —`integrations/documentos/`, un ayudante compartido—
    importara la capa de IA, no lo vería. Esta sí.
    """

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123"
        )
        self.contenido = (FIXTURES / "una_columna.pdf").read_bytes()

    def _analizar(self, **extra):
        with _sin_acceso_a_la_capa_de_ia():
            return services.analizar(
                usuario=self.usuario,
                contenido=self.contenido,
                nombre_archivo="una_columna.pdf",
                **extra,
            )

    def test_analizar_sin_convocatoria_no_importa_la_capa_de_ia(self):
        curriculum = self._analizar()

        self.assertIsNotNone(curriculum.analisis)

    def test_analizar_con_convocatoria_no_importa_la_capa_de_ia(self):
        """La ruta con convocatoria es la que la fase de IA va a tocar primero."""
        curriculum = self._analizar(convocatoria=CONVOCATORIA)

        self.assertIsNotNone(curriculum.analisis.brecha)

    def test_el_guardia_sabe_fallar(self):
        """Que los dos tests de arriba pasen no basta: hay que saber que el
        guardia sabría fallar.

        Es la lección de la primera versión de este archivo, que parcheaba
        `integrations.ia.factory.get_proveedor` y **pasaba siempre**: el módulo que
        hace `from ... import get_proveedor` ya copió la referencia, así que
        sustituirla en su origen no interceptaba nada. Un guardia que no se prueba a
        sí mismo no es un guardia.
        """
        with self.assertRaises(AssertionError) as capturado:
            with _sin_acceso_a_la_capa_de_ia():
                import integrations.ia.factory  # noqa: F401

        self.assertIn("integrations.ia", str(capturado.exception))

    def test_el_guardia_deja_pasar_los_demas_imports(self):
        """Un guardia que bloquee de más sería igual de inútil: rompería el
        análisis y el fallo se confundiría con una violación de la frontera."""
        with _sin_acceso_a_la_capa_de_ia():
            import integrations.documentos.ats  # noqa: F401

    def test_la_capa_de_ia_sigue_importable_despues(self):
        """El bloque vacía `sys.modules`, así que tiene que reponerlo: si no, el
        siguiente test de la suite que use la capa de IA recibiría otro objeto."""
        with _sin_acceso_a_la_capa_de_ia():
            pass

        from integrations.ia.factory import get_proveedor  # noqa: F401

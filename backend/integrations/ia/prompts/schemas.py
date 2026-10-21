"""Contrato de datos que todo proveedor de IA debe cumplir."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from ..exceptions import RespuestaIAInvalida

PREGUNTAS_POR_ENTREVISTA = 5

# Cuántas preguntas se piden de una sola vez al empezar, antes de que exista
# cualquier respuesta.
#
# Ninguna pregunta anterior a la primera respuesta puede ser adaptativa: no hay
# puntaje del que adaptarse. Y la segunda, si se generara después de la primera
# respuesta, se adaptaría a un único dato — ruido, porque el candidato pudo
# trabarse en algo que domina o acertar por casualidad. Un entrevistador humano
# tampoco recalibra tras una sola respuesta. Así que estas dos son el
# calentamiento y la adaptación empieza en la tercera, cuando ya hay base.
PREGUNTAS_DE_CALENTAMIENTO = 2


class AreaTecnica(str, Enum):
    """Tema de una pregunta. Ya no se elige: lo decide el puesto (ver
    `PLAN_POR_PUESTO`). Sigue siendo el eje de las estadísticas y de la
    retroalimentación acumulada, que es donde sirve de verdad."""

    PROGRAMACION = "programacion"
    BASES_DE_DATOS = "bases_de_datos"
    ESTRUCTURAS_DE_DATOS = "estructuras_de_datos"
    DESARROLLO_WEB = "desarrollo_web"
    POO = "poo"
    APIS = "apis"
    CONTROL_VERSIONES = "control_versiones"
    PRUEBAS = "pruebas"
    DESARROLLO_MOVIL = "desarrollo_movil"
    DESARROLLO_ESCRITORIO = "desarrollo_escritorio"
    DESARROLLO_VIDEOJUEGOS = "desarrollo_videojuegos"

    @property
    def etiqueta(self) -> str:
        return {
            AreaTecnica.PROGRAMACION: "Fundamentos de Programación",
            AreaTecnica.BASES_DE_DATOS: "Bases de Datos",
            AreaTecnica.ESTRUCTURAS_DE_DATOS: "Estructuras de Datos",
            AreaTecnica.DESARROLLO_WEB: "Desarrollo Web Frontend",
            AreaTecnica.POO: "Programación Orientada a Objetos",
            AreaTecnica.APIS: "APIs y Servicios Web",
            AreaTecnica.CONTROL_VERSIONES: "Control de Versiones",
            AreaTecnica.PRUEBAS: "Pruebas de Software",
            AreaTecnica.DESARROLLO_MOVIL: "Desarrollo Móvil",
            AreaTecnica.DESARROLLO_ESCRITORIO: "Desarrollo de Escritorio",
            AreaTecnica.DESARROLLO_VIDEOJUEGOS: "Desarrollo de Videojuegos",
        }[self]


class Puesto(str, Enum):
    """El rol al que postula el candidato: lo que se elige al empezar."""

    BACKEND = "backend"
    FRONTEND = "frontend"
    FULL_STACK = "full_stack"
    MOVIL = "movil"
    ESCRITORIO = "escritorio"
    QA = "qa"
    VIDEOJUEGOS = "videojuegos"

    @property
    def etiqueta(self) -> str:
        return {
            Puesto.BACKEND: "Desarrollador Backend",
            Puesto.FRONTEND: "Desarrollador Frontend",
            Puesto.FULL_STACK: "Desarrollador Full Stack",
            Puesto.MOVIL: "Desarrollador Móvil",
            Puesto.ESCRITORIO: "Desarrollador de Escritorio",
            Puesto.QA: "QA Tester / Automatizador",
            Puesto.VIDEOJUEGOS: "Desarrollador de Videojuegos",
        }[self]


class Nivel(str, Enum):
    """Nivel del puesto, con los nombres que usan las convocatorias.

    Equivalen a inicial, intermedio y avanzado. El perfil de grado aprobado
    hablaba de "básico e intermedio" y excluía el avanzado; incluir Senior es
    una ampliación del alcance que el documento debe recoger.
    """

    JUNIOR = "junior"
    SEMI_SENIOR = "semi_senior"
    SENIOR = "senior"

    @property
    def etiqueta(self) -> str:
        """El mismo nombre que ve el candidato en la pantalla."""
        return {Nivel.JUNIOR: "Junior", Nivel.SEMI_SENIOR: "Semi-Senior", Nivel.SENIOR: "Senior"}[self]

    @property
    def con_experiencia(self) -> str:
        """Lo que lee el modelo: la etiqueta más el grado de exigencia, que es
        lo que de verdad calibra las preguntas y la evaluación."""
        return {
            Nivel.JUNIOR: "Junior (nivel inicial)",
            Nivel.SEMI_SENIOR: "Semi-Senior (nivel intermedio)",
            Nivel.SENIOR: "Senior (nivel avanzado)",
        }[self]


@dataclass(frozen=True)
class ContextoDeEntrevista:
    """Lo que no cambia a lo largo de una entrevista: a qué puesto se postula,
    con qué experiencia y sobre qué tecnología.

    La tecnología llega por su **nombre** ("React", "Kotlin (Android)") y no
    como enum: hay más de cincuenta, se dan de alta con `cargar_catalogos`, y la IA
    solo necesita leerla. `None` solo en entrevistas anteriores al catálogo por
    puesto, que no la tenían. El área queda fuera a propósito: es lo único que
    varía de una pregunta a otra.
    """

    puesto: Puesto
    nivel: Nivel
    tecnologia: str | None = None
    #: Requisitos de la convocatoria con que se inició, si hubo una. Solo los
    #: lee el entrevistador: el evaluador califica con la misma rúbrica haya o
    #: no convocatoria, para que las notas sigan siendo comparables.
    requisitos: tuple[str, ...] = ()


def linea_de_tecnologia(contexto: ContextoDeEntrevista) -> str:
    """La línea del prompt que nombra la tecnología, para el entrevistador y el
    evaluador por igual.

    Se omite entera cuando no hay: decir "ninguna" invitaría al modelo a
    comentar la ausencia en vez de ignorarla.
    """
    if contexto.tecnologia is None:
        return ""
    return f"\nTecnología elegida por el candidato: {contexto.tecnologia}"


class Enfoque(str, Enum):
    """Qué se busca con una pregunta, independiente del tema."""

    FUNDAMENTOS = "fundamentos"
    TECNOLOGIA = "tecnologia"
    DATOS = "datos"
    PROFUNDIDAD = "profundidad"
    CASO_PRACTICO = "caso_practico"

    def instruccion(self, tecnologia: str | None) -> str:
        """Lo que el entrevistador debe pedir en una pregunta de este enfoque."""
        con = f" con {tecnologia}" if tecnologia else ""
        return {
            Enfoque.FUNDAMENTOS: "fundamentos de programación que todo candidato al puesto debe dominar, "
            "independientes de la tecnología",
            Enfoque.TECNOLOGIA: f"el uso práctico de la tecnología del puesto{con}",
            Enfoque.DATOS: "cómo se guardan, consultan u organizan los datos en el trabajo de este puesto",
            Enfoque.PROFUNDIDAD: f"un aspecto más profundo o una buena práctica de la tecnología del puesto{con}",
            Enfoque.CASO_PRACTICO: f"un escenario realista del trabajo diario de este puesto{con}: "
            "describe la situación y pide cómo la resolvería",
        }[self]


@dataclass(frozen=True)
class PasoDelPlan:
    enfoque: Enfoque
    area: AreaTecnica


def _plan(tecnologia: AreaTecnica, datos: AreaTecnica, profundidad: AreaTecnica, caso: AreaTecnica):
    return (
        PasoDelPlan(Enfoque.FUNDAMENTOS, AreaTecnica.PROGRAMACION),
        PasoDelPlan(Enfoque.TECNOLOGIA, tecnologia),
        PasoDelPlan(Enfoque.DATOS, datos),
        PasoDelPlan(Enfoque.PROFUNDIDAD, profundidad),
        PasoDelPlan(Enfoque.CASO_PRACTICO, caso),
    )


# Composición de cada puesto: qué enfoque y qué área toca cada una de las
# preguntas, en orden. Toda entrevista recorre los mismos cinco enfoques
# —fundamentos, la tecnología elegida, datos, profundidad en la tecnología y un
# caso práctico—; lo que cambia por puesto es el área con que se registra cada
# pregunta, que es el eje de las estadísticas y del reporte.
#
# "Datos" son bases de datos donde el puesto vive de ellas (backend, full stack
# y QA, que valida datos con SQL) y estructuras de datos donde el estado vive en
# memoria (frontend, móvil, escritorio y videojuegos, cuyas entidades, escenas y
# colas de eventos viven en memoria durante la partida).
#
# Determinista a propósito, no aleatorio: así la entrevista es reproducible,
# explicable ante un tribunal y verificable por un test. Vive aquí y no en la
# base de datos porque es diseño de la simulación, no un dato de referencia.
_A = AreaTecnica
PLAN_POR_PUESTO: dict[Puesto, tuple[PasoDelPlan, ...]] = {
    Puesto.FRONTEND: _plan(_A.DESARROLLO_WEB, _A.ESTRUCTURAS_DE_DATOS, _A.DESARROLLO_WEB, _A.DESARROLLO_WEB),
    Puesto.BACKEND: _plan(_A.APIS, _A.BASES_DE_DATOS, _A.APIS, _A.APIS),
    Puesto.FULL_STACK: _plan(_A.DESARROLLO_WEB, _A.BASES_DE_DATOS, _A.APIS, _A.APIS),
    Puesto.MOVIL: _plan(
        _A.DESARROLLO_MOVIL, _A.ESTRUCTURAS_DE_DATOS, _A.DESARROLLO_MOVIL, _A.DESARROLLO_MOVIL
    ),
    Puesto.ESCRITORIO: _plan(
        _A.DESARROLLO_ESCRITORIO,
        _A.ESTRUCTURAS_DE_DATOS,
        _A.DESARROLLO_ESCRITORIO,
        _A.DESARROLLO_ESCRITORIO,
    ),
    Puesto.QA: _plan(_A.PRUEBAS, _A.BASES_DE_DATOS, _A.PRUEBAS, _A.PRUEBAS),
    Puesto.VIDEOJUEGOS: _plan(
        _A.DESARROLLO_VIDEOJUEGOS,
        _A.ESTRUCTURAS_DE_DATOS,
        _A.DESARROLLO_VIDEOJUEGOS,
        _A.DESARROLLO_VIDEOJUEGOS,
    ),
}
del _A


def paso_de_la_pregunta(puesto: Puesto, numero: int) -> PasoDelPlan:
    """Enfoque y área de la pregunta `numero` (1-indexada) para ese puesto."""
    plan = PLAN_POR_PUESTO[puesto]
    if not 1 <= numero <= len(plan):
        raise ValueError(
            f"La pregunta {numero} está fuera del plan de {puesto.value}, "
            f"que tiene {len(plan)} preguntas"
        )
    return plan[numero - 1]


def area_de_la_pregunta(puesto: Puesto, numero: int) -> AreaTecnica:
    """Área que toca la pregunta `numero` (1-indexada) para ese puesto."""
    return paso_de_la_pregunta(puesto, numero).area


def areas_que_cubre(puesto: Puesto) -> tuple[AreaTecnica, ...]:
    """Las áreas del puesto, sin repetir y en el orden en que aparecen.

    La pantalla de selección las muestra para el puesto elegido: es lo que
    mantiene a la vista qué temas entran, en vez de pedir que el usuario lo
    adivine.
    """
    return tuple(dict.fromkeys(paso.area for paso in PLAN_POR_PUESTO[puesto]))


@dataclass(frozen=True)
class Pregunta:
    texto: str
    numero: int


# Escala de cada criterio de la rúbrica: cinco niveles descritos, de 0 a 4.
# El modelo solo clasifica en uno de ellos; la nota de 0 a 100 la calcula la
# aplicación con `apps.evaluaciones.rubricas.puntuacion_de`. Una escala corta y
# descrita es lo que un modelo puede aplicar con fiabilidad — escribir un 0-100
# libre le pide una precisión que no tiene.
NIVEL_MAXIMO = 4

# Cuántos puntos clave devuelve el evaluador por respuesta. Menos de dos no
# orienta a nadie; más de cuatro deja de ser una lista que se lee de un vistazo,
# así que se recorta en vez de rechazar.
PUNTOS_CLAVE_MINIMOS = 2
PUNTOS_CLAVE_MAXIMOS = 4

CRITERIOS = ("correccion", "completitud", "claridad")


@dataclass(frozen=True)
class Niveles:
    """El nivel (0-4) que el evaluador asignó a cada criterio de la rúbrica."""

    correccion: int
    completitud: int
    claridad: int

    def como_dict(self) -> dict[str, int]:
        return {criterio: getattr(self, criterio) for criterio in CRITERIOS}


@dataclass(frozen=True)
class Evaluacion:
    """Lo que devuelve el evaluador: niveles y retroalimentación, sin nota.

    No hay campo `puntuacion` a propósito: si el modelo escribiera la nota, la
    respuesta a "¿por qué 74 y no 76?" sería "porque lo dijo la IA".
    """

    niveles: Niveles
    fortalezas: str
    debilidades: str
    sugerencias: str
    # Lo que una respuesta completa debía cubrir para ese nivel. Es lo que
    # convierte la nota en algo que estudiar para la próxima entrevista.
    puntos_clave: tuple[str, ...]


@dataclass(frozen=True)
class TemaEvaluado:
    """Resumen comprimido de un turno ya respondido.

    Es lo que recibe el entrevistador para no repetir temas y, si quiere,
    adaptar el enfoque — en lugar del historial completo de preguntas y
    respuestas, que haría crecer el prompt con la longitud de la entrevista.
    """

    pregunta: str
    puntuacion: int


def _texto_obligatorio(datos: dict[str, Any], clave: str) -> str:
    valor = datos.get(clave)
    if not isinstance(valor, str) or not valor.strip():
        raise RespuestaIAInvalida(f"Campo '{clave}' ausente o vacío en la respuesta del proveedor")
    return valor.strip()


def parsear_pregunta(datos: dict[str, Any], numero: int) -> Pregunta:
    return Pregunta(texto=_texto_obligatorio(datos, "pregunta"), numero=numero)


def parsear_preguntas(datos: dict[str, Any], desde_numero: int, cuantas: int) -> list[Pregunta]:
    """Varias preguntas de una sola respuesta, numeradas desde `desde_numero`.

    Se exige la cantidad exacta y no se acepta una lista corta: el orquestador
    cuenta con una pregunta por cada área del plan, y quedarse sin la segunda
    dejaría la entrevista sin pregunta pendiente tras la primera respuesta. Si el
    modelo devuelve menos, el contrato se rompió y hay que decirlo.
    """
    lista = datos.get("preguntas")
    if not isinstance(lista, list):
        raise RespuestaIAInvalida(
            f"Campo 'preguntas' ausente o no es una lista: se recibió {type(lista).__name__}"
        )
    if len(lista) != cuantas:
        raise RespuestaIAInvalida(
            f"Se esperaban {cuantas} preguntas y llegaron {len(lista)}"
        )

    return [
        parsear_pregunta(item if isinstance(item, dict) else {}, numero=desde_numero + indice)
        for indice, item in enumerate(lista)
    ]


def _nivel(niveles: dict[str, Any], criterio: str) -> int:
    valor = niveles.get(criterio)
    if isinstance(valor, str) and valor.strip().isdigit():
        valor = int(valor)
    if not isinstance(valor, int) or isinstance(valor, bool) or not 0 <= valor <= NIVEL_MAXIMO:
        raise RespuestaIAInvalida(
            f"Nivel inválido para '{criterio}': {niveles.get(criterio)!r} (se espera entero 0-{NIVEL_MAXIMO})"
        )
    return valor


def parsear_evaluacion(datos: dict[str, Any]) -> Evaluacion:
    """Valida y normaliza la evaluación devuelta por el proveedor.

    El esquema JSON enviado al proveedor ya restringe la forma de la
    respuesta (decodificación restringida), pero no garantiza el rango de cada
    nivel ni que los textos no vengan vacíos — eso es lo que se valida aquí.

    Si el modelo añade por su cuenta una `puntuacion`, se ignora: la nota es
    una fórmula sobre los niveles, no una opinión del modelo.
    """
    if not isinstance(datos, dict):
        raise RespuestaIAInvalida(f"Se esperaba un objeto JSON, se recibió {type(datos).__name__}")

    niveles = datos.get("niveles")
    if not isinstance(niveles, dict):
        raise RespuestaIAInvalida(f"Campo 'niveles' ausente o mal formado: {niveles!r}")

    return Evaluacion(
        niveles=Niveles(**{criterio: _nivel(niveles, criterio) for criterio in CRITERIOS}),
        fortalezas=_texto_obligatorio(datos, "fortalezas"),
        debilidades=_texto_obligatorio(datos, "debilidades"),
        sugerencias=_texto_obligatorio(datos, "sugerencias"),
        puntos_clave=_puntos_clave(datos),
    )


def _puntos_clave(datos: dict[str, Any]) -> tuple[str, ...]:
    puntos = datos.get("puntos_clave")
    if not isinstance(puntos, list):
        raise RespuestaIAInvalida(f"Campo 'puntos_clave' ausente o mal formado: {puntos!r}")
    if any(not isinstance(p, str) or not p.strip() for p in puntos):
        raise RespuestaIAInvalida("Un punto clave vino vacío o no es texto")
    if len(puntos) < PUNTOS_CLAVE_MINIMOS:
        raise RespuestaIAInvalida(
            f"Se esperaban al menos {PUNTOS_CLAVE_MINIMOS} puntos clave, llegaron {len(puntos)}"
        )
    return tuple(p.strip() for p in puntos[:PUNTOS_CLAVE_MAXIMOS])

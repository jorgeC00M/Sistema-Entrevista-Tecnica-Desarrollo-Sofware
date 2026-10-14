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
        }[self]


class Puesto(str, Enum):
    """El rol al que postula el candidato: lo que se elige al empezar."""

    BACKEND = "backend"
    FRONTEND = "frontend"
    FULL_STACK = "full_stack"

    @property
    def etiqueta(self) -> str:
        return {
            Puesto.BACKEND: "Desarrollador Backend",
            Puesto.FRONTEND: "Desarrollador Frontend",
            Puesto.FULL_STACK: "Desarrollador Full-stack",
        }[self]


class Tecnologia(str, Enum):
    """Stack sobre el que gira la entrevista. Opcional: la ausencia se
    representa con `None`, no con un miembro "indiferente"."""

    PYTHON_DJANGO = "python_django"
    JAVASCRIPT_REACT = "javascript_react"
    JAVA_SPRING = "java_spring"

    @property
    def etiqueta(self) -> str:
        return {
            Tecnologia.PYTHON_DJANGO: "Python / Django",
            Tecnologia.JAVASCRIPT_REACT: "JavaScript / React",
            Tecnologia.JAVA_SPRING: "Java / Spring",
        }[self]


class Nivel(str, Enum):
    BASICO = "basico"
    INTERMEDIO = "intermedio"

    @property
    def etiqueta(self) -> str:
        return "Básico" if self is Nivel.BASICO else "Intermedio"


@dataclass(frozen=True)
class ContextoDeEntrevista:
    """Lo que no cambia a lo largo de una entrevista: a qué puesto se postula,
    con qué exigencia y sobre qué stack.

    Existe para que las dos operaciones del contrato no acaben con seis
    parámetros sueltos —entre ellos dos enums de forma parecida, fáciles de
    intercambiar por error— y para que agregar un dato de encuadre más adelante
    no obligue a tocar cada firma. El área queda fuera a propósito: es lo único
    que varía de una pregunta a otra.
    """

    puesto: Puesto
    nivel: Nivel
    tecnologia: Tecnologia | None = None


# Composición de cada puesto: qué área toca cada una de las preguntas, en
# orden. El área de la pregunta `n` es `PLAN_POR_PUESTO[puesto][n - 1]`.
#
# Es lo que hace que la simulación se parezca a una entrevista real: nadie
# recibe cinco preguntas del mismo tema. Todas abren por fundamentos, como un
# calentamiento, y cargan el peso en lo propio del puesto.
#
# Determinista a propósito, no aleatorio: así la entrevista es reproducible,
# explicable ante un tribunal y verificable por un test. Vive aquí y no en la
# base de datos porque es diseño de la simulación, no un dato de referencia que
# el usuario dé de alta — y porque `AreaTecnica` ya vive aquí.
PLAN_POR_PUESTO: dict[Puesto, tuple[AreaTecnica, ...]] = {
    Puesto.BACKEND: (
        AreaTecnica.PROGRAMACION,
        AreaTecnica.BASES_DE_DATOS,
        AreaTecnica.APIS,
        AreaTecnica.ESTRUCTURAS_DE_DATOS,
        AreaTecnica.BASES_DE_DATOS,
    ),
    Puesto.FRONTEND: (
        AreaTecnica.PROGRAMACION,
        AreaTecnica.DESARROLLO_WEB,
        AreaTecnica.POO,
        AreaTecnica.DESARROLLO_WEB,
        AreaTecnica.CONTROL_VERSIONES,
    ),
    Puesto.FULL_STACK: (
        AreaTecnica.PROGRAMACION,
        AreaTecnica.BASES_DE_DATOS,
        AreaTecnica.DESARROLLO_WEB,
        AreaTecnica.APIS,
        AreaTecnica.PRUEBAS,
    ),
}


def area_de_la_pregunta(puesto: Puesto, numero: int) -> AreaTecnica:
    """Área que toca la pregunta `numero` (1-indexada) para ese puesto."""
    plan = PLAN_POR_PUESTO[puesto]
    if not 1 <= numero <= len(plan):
        raise ValueError(
            f"La pregunta {numero} está fuera del plan de {puesto.value}, "
            f"que tiene {len(plan)} preguntas"
        )
    return plan[numero - 1]


def areas_que_cubre(puesto: Puesto) -> tuple[AreaTecnica, ...]:
    """Las áreas del puesto, sin repetir y en el orden en que aparecen.

    La pantalla de selección las muestra en la tarjeta del puesto: es lo que
    mantiene a la vista qué temas entran, en vez de pedir que el usuario lo
    adivine.
    """
    return tuple(dict.fromkeys(PLAN_POR_PUESTO[puesto]))


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

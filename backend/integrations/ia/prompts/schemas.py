"""Contrato de datos que todo proveedor de IA debe cumplir."""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from ..exceptions import RespuestaIAInvalida

PREGUNTAS_POR_ENTREVISTA = 5


class AreaTecnica(str, Enum):
    PROGRAMACION = "programacion"
    BASES_DE_DATOS = "bases_de_datos"
    ESTRUCTURAS_DE_DATOS = "estructuras_de_datos"
    DESARROLLO_WEB = "desarrollo_web"

    @property
    def etiqueta(self) -> str:
        return {
            AreaTecnica.PROGRAMACION: "Programación",
            AreaTecnica.BASES_DE_DATOS: "Bases de Datos",
            AreaTecnica.ESTRUCTURAS_DE_DATOS: "Estructuras de Datos",
            AreaTecnica.DESARROLLO_WEB: "Desarrollo Web",
        }[self]


class Nivel(str, Enum):
    BASICO = "basico"
    INTERMEDIO = "intermedio"

    @property
    def etiqueta(self) -> str:
        return "Básico" if self is Nivel.BASICO else "Intermedio"


@dataclass(frozen=True)
class Pregunta:
    texto: str
    numero: int


@dataclass(frozen=True)
class Evaluacion:
    puntuacion: int
    fortalezas: str
    debilidades: str
    sugerencias: str


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


def parsear_evaluacion(datos: dict[str, Any]) -> Evaluacion:
    """Valida y normaliza la evaluación devuelta por el proveedor.

    El esquema JSON enviado al proveedor ya restringe la forma de la
    respuesta (decodificación restringida), pero no garantiza el rango
    numérico ni que los textos no vengan vacíos — eso es lo que se valida aquí.
    """
    if not isinstance(datos, dict):
        raise RespuestaIAInvalida(f"Se esperaba un objeto JSON, se recibió {type(datos).__name__}")

    puntuacion = datos.get("puntuacion")
    if isinstance(puntuacion, str) and puntuacion.strip().isdigit():
        puntuacion = int(puntuacion)
    if not isinstance(puntuacion, int) or isinstance(puntuacion, bool) or not 0 <= puntuacion <= 100:
        raise RespuestaIAInvalida(f"Puntuación inválida: {datos.get('puntuacion')!r} (se espera entero 0-100)")

    return Evaluacion(
        puntuacion=puntuacion,
        fortalezas=_texto_obligatorio(datos, "fortalezas"),
        debilidades=_texto_obligatorio(datos, "debilidades"),
        sugerencias=_texto_obligatorio(datos, "sugerencias"),
    )

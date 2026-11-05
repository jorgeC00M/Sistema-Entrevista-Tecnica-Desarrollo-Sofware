"""Prompt del redactor del veredicto: resume en palabras una entrevista ya calificada.

Es un rol aparte del evaluador, y la separación es lo que lo hace defendible:
- **No califica.** Recibe las evaluaciones ya guardadas —tema, nota, niveles,
  fortalezas y debilidades de cada respuesta— y nunca el texto de las respuestas,
  así que no tiene con qué volver a juzgarlas. La nota la calcula el sistema y se
  muestra al lado.
- **No toca al evaluador.** El evaluador sigue siendo una función pura de
  (contexto, área, pregunta, respuesta); el redactor se llama una sola vez, al
  final, y lo que escriba no cambia ninguna nota, nivel ni banda.

**El parser descarta el texto entero** si da una nota o un porcentaje, o si
concluye que la persona es apta (`guardas.py`): un párrafo que se contradice con
la nota de al lado, o que juzga la aptitud, es peor que el respaldo por reglas
que muestra la pantalla.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..exceptions import RespuestaIAInvalida
from .evaluador import NOMBRES_DE_CRITERIOS
from .guardas import CONCLUYE_APTITUD, MENCIONA_NOTA, comparable
from .schemas import CRITERIOS, NIVEL_MAXIMO, AreaTecnica, ContextoDeEntrevista, Niveles, linea_de_tecnologia

MAXIMO_CARACTERES = 600


@dataclass(frozen=True)
class RespuestaEvaluada:
    """Lo que el redactor sabe de una respuesta: su evaluación, no su texto."""

    numero: int
    area: AreaTecnica
    puntuacion: int
    #: `None` en evaluaciones anteriores a la rúbrica por niveles.
    niveles: Niveles | None
    fortalezas: str
    debilidades: str


@dataclass(frozen=True)
class EntradaDeVeredicto:
    contexto: ContextoDeEntrevista
    respuestas: tuple[RespuestaEvaluada, ...]


def sistema(contexto: ContextoDeEntrevista) -> str:
    return f"""\
Eres un mentor que resume, en español, cómo le fue a un egresado de Ingeniería de \
Sistemas en una entrevista técnica simulada que ya fue calificada.

Puesto al que postula: {contexto.puesto.etiqueta}
Experiencia del candidato: {contexto.nivel.con_experiencia}{linea_de_tecnologia(contexto)}

Recibirás la evaluación de cada respuesta: su tema, su nivel de 0 a {NIVEL_MAXIMO} en \
cada criterio, sus fortalezas y sus debilidades.

Reglas:
- Escribe un solo párrafo de 2 a 3 oraciones, en segunda persona.
- Di qué hizo bien y qué le faltó, nombrando los temas. Usa solo lo que dicen las \
evaluaciones: no agregues nada que no esté en ellas.
- No escribas notas, puntajes, porcentajes ni probabilidades: la nota la calcula el sistema.
- No digas si es apto, idóneo o está calificado para el puesto.
- No incluyas saludos ni cierres. Responde solo con el objeto json pedido."""


def _niveles(niveles: Niveles | None) -> str:
    if niveles is None:
        return "sin niveles por criterio"
    valores = niveles.como_dict()
    return ", ".join(f"{NOMBRES_DE_CRITERIOS[c]} {valores[c]}/{NIVEL_MAXIMO}" for c in CRITERIOS)


def usuario(entrada: EntradaDeVeredicto) -> str:
    bloques = [
        f"Pregunta {r.numero} · {r.area.etiqueta} · {_niveles(r.niveles)}\n"
        f"Fortalezas: {r.fortalezas}\n"
        f"Debilidades: {r.debilidades}"
        for r in entrada.respuestas
    ]
    return "\n\n".join(bloques) + "\n\nResume la entrevista."


ESQUEMA_VEREDICTO = {
    "type": "object",
    "properties": {
        "veredicto": {
            "type": "string",
            "description": "Un párrafo de 2 a 3 oraciones que resume el desempeño, sin notas",
        },
    },
    "required": ["veredicto"],
    "additionalProperties": False,
}


def parsear_veredicto(datos: dict[str, Any]) -> str:
    """El párrafo, o `RespuestaIAInvalida` si no se puede mostrar al lado de la nota."""
    valor = datos.get("veredicto")
    texto = " ".join(valor.split()) if isinstance(valor, str) else ""
    if not texto:
        raise RespuestaIAInvalida("El veredicto llegó vacío")
    if len(texto) > MAXIMO_CARACTERES:
        raise RespuestaIAInvalida(f"El veredicto supera {MAXIMO_CARACTERES} caracteres")
    sin_acentos = comparable(texto)
    if MENCIONA_NOTA.search(sin_acentos):
        raise RespuestaIAInvalida("El veredicto escribe una nota o un porcentaje")
    if CONCLUYE_APTITUD.search(sin_acentos):
        raise RespuestaIAInvalida("El veredicto juzga la aptitud para el puesto")
    return texto

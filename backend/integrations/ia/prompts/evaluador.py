"""Prompt del evaluador: califica una respuesta según una rúbrica fija.

Es una función pura respecto a la entrevista: solo necesita la pregunta y la
respuesta de este turno. No recibe historial porque no lo necesita — evaluar
la respuesta 4 no depende de lo que ocurrió en las preguntas 1 a 3. Por eso su
costo es plano y no crece con el avance de la entrevista.
"""

from __future__ import annotations

from .schemas import AreaTecnica, Nivel

RUBRICA = """\
Evalúa la respuesta con tres criterios de igual peso:
1. Corrección técnica: si lo afirmado es cierto y preciso.
2. Completitud: si cubre los puntos esperados para el nivel indicado.
3. Claridad: si la explicación es ordenada y comunica bien el razonamiento.

Bandas de puntuación:
- 0-40: respuesta incorrecta, vacía o fuera de tema.
- 41-60: idea parcialmente correcta con vacíos importantes.
- 61-80: respuesta correcta pero incompleta o poco clara.
- 81-100: respuesta correcta, completa y bien comunicada."""


def sistema(area: AreaTecnica, nivel: Nivel) -> str:
    return f"""\
Eres un evaluador técnico que califica respuestas de una entrevista simulada en \
español para un egresado de Ingeniería de Sistemas.

Área evaluada: {area.etiqueta}
Nivel de dificultad: {nivel.etiqueta}

{RUBRICA}

Dirígete al candidato en segunda persona. No incluyas saludos, cierres ni texto \
fuera del formato solicitado."""


def usuario(pregunta: str, respuesta: str) -> str:
    return f"Pregunta: {pregunta}\n\nRespuesta del candidato: {respuesta}\n\nEvalúa esta respuesta."


ESQUEMA_EVALUACION = {
    "type": "object",
    "properties": {
        "puntuacion": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100,
            "description": "Puntuación de 0 a 100 según la rúbrica",
        },
        "fortalezas": {"type": "string", "description": "Aspectos positivos detectados"},
        "debilidades": {"type": "string", "description": "Aspectos a mejorar"},
        "sugerencias": {"type": "string", "description": "Recomendación concreta de mejora"},
    },
    "required": ["puntuacion", "fortalezas", "debilidades", "sugerencias"],
    "additionalProperties": False,
}

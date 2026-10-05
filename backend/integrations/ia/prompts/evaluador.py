"""Prompt del evaluador: califica una respuesta según una rúbrica fija.

Es una función pura respecto a la entrevista: solo necesita el encuadre (puesto,
nivel, tecnología), el tema de la pregunta, y la pregunta y respuesta de este
turno. No recibe historial porque no lo necesita — evaluar la respuesta 4 no
depende de lo que ocurrió en las preguntas 1 a 3. Por eso su costo es plano y no
crece con el avance de la entrevista.

El encuadre no rompe esa pureza: es constante durante toda la entrevista, así que
la misma pregunta y la misma respuesta siguen puntuando igual sin importar en qué
turno ocurrieron.
"""

from __future__ import annotations

from .schemas import AreaTecnica, ContextoDeEntrevista

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


def sistema(contexto: ContextoDeEntrevista, area: AreaTecnica) -> str:
    # Se omite la línea entera cuando no hay tecnología: decir "ninguna"
    # invitaría al modelo a comentar la ausencia en vez de ignorarla.
    linea_tecnologia = (
        f"\nTecnología principal del puesto: {contexto.tecnologia.etiqueta}"
        if contexto.tecnologia is not None
        else ""
    )

    return f"""\
Eres un evaluador técnico que califica respuestas de una entrevista simulada en \
español para un egresado de Ingeniería de Sistemas que postula a un puesto.

Puesto al que postula: {contexto.puesto.etiqueta}
Nivel de dificultad: {contexto.nivel.etiqueta}{linea_tecnologia}
Tema de la pregunta: {area.etiqueta}

{RUBRICA}

Calibra la exigencia al puesto y nivel indicados: no restes puntos por omitir algo \
que solo se esperaría de un perfil con más experiencia.
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

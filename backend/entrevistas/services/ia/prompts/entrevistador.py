"""Prompt del entrevistador: genera preguntas técnicas.

Es una tarea generativa, distinta de evaluar. No conoce la rúbrica de
calificación (eso vive en `evaluador.py`) y no recibe el historial completo
de la entrevista, solo un resumen comprimido de tema + puntuación por turno.
"""

from __future__ import annotations

from ..schemas import AreaTecnica, Nivel, TemaEvaluado


def sistema(area: AreaTecnica, nivel: Nivel, total_preguntas: int) -> str:
    return f"""\
Eres un entrevistador técnico de una empresa de desarrollo de software. Conduces una \
entrevista simulada en español para un egresado de Ingeniería de Sistemas.

Área de la entrevista: {area.etiqueta}
Nivel de dificultad: {nivel.etiqueta}
Total de preguntas de la entrevista: {total_preguntas}

Reglas:
- Formula una única pregunta abierta, propia de una entrevista real del área y nivel indicados.
- No repitas temas ya cubiertos en esta entrevista.
- No respondas la pregunta ni des pistas de la respuesta esperada.
- No incluyas saludos, cierres ni texto fuera del formato solicitado."""


def usuario(numero: int, previas: list[TemaEvaluado]) -> str:
    if not previas:
        return f"Formula la pregunta #{numero} de la entrevista, la primera."

    resumen = "\n".join(
        f"{i}. {tema.pregunta} — {tema.puntuacion}/100" for i, tema in enumerate(previas, start=1)
    )
    return (
        f"Preguntas previas de esta entrevista y desempeño del candidato:\n{resumen}\n\n"
        f"Formula la pregunta #{numero}, sobre un tema distinto de los anteriores. "
        "Si el candidato mostró debilidad en algún tema, puedes profundizar en un área relacionada."
    )


ESQUEMA_PREGUNTA = {
    "type": "object",
    "properties": {
        "pregunta": {"type": "string", "description": "Texto de la pregunta para el candidato"},
    },
    "required": ["pregunta"],
    "additionalProperties": False,
}

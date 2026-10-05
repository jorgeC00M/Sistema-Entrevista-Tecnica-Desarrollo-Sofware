"""Prompt del entrevistador: genera preguntas técnicas.

Es una tarea generativa, distinta de evaluar. No conoce la rúbrica de
calificación (eso vive en `evaluador.py`) y no recibe el historial completo
de la entrevista, solo un resumen comprimido de tema + puntuación por turno.

El encuadre es el de una postulación real: el candidato aspira a un puesto
concreto, con un nivel de exigencia y —si la indicó— una tecnología. El tema de
cada pregunta lo decide el puesto (`PLAN_POR_PUESTO`), no el candidato, igual
que en una entrevista de verdad.
"""

from __future__ import annotations

from collections.abc import Sequence

from .schemas import AreaTecnica, ContextoDeEntrevista, TemaEvaluado


def _linea_tecnologia(contexto: ContextoDeEntrevista) -> str:
    """La tecnología se omite entera cuando no hay: decir "ninguna" invitaría al
    modelo a comentar la ausencia en vez de ignorarla."""
    if contexto.tecnologia is None:
        return ""
    return f"\nTecnología principal del puesto: {contexto.tecnologia.etiqueta}"


def sistema_de_calentamiento(
    contexto: ContextoDeEntrevista, areas: Sequence[AreaTecnica], total_preguntas: int
) -> str:
    """Prompt de las primeras preguntas, pedidas todas de una vez.

    No recibe desempeño previo porque todavía no existe ninguna respuesta. Pedirlas
    juntas en lugar de una por una tiene además una ventaja de calidad: el modelo
    las ve a la vez y puede hacerlas complementarias, en vez de arriesgarse a que
    la segunda repita el enfoque de la primera.
    """
    temas = "\n".join(
        f"- Pregunta {indice}: {area.etiqueta}" for indice, area in enumerate(areas, start=1)
    )

    return f"""\
Eres un entrevistador técnico de una empresa de desarrollo de software. Conduces una \
entrevista simulada en español para un egresado de Ingeniería de Sistemas que postula a \
un puesto.

Puesto al que postula: {contexto.puesto.etiqueta}
Nivel de dificultad: {contexto.nivel.etiqueta}{_linea_tecnologia(contexto)}
Total de preguntas de la entrevista: {total_preguntas}

Vas a formular las primeras {len(areas)} preguntas, que abren la entrevista:
{temas}

Reglas:
- Una única pregunta abierta por cada tema indicado, en ese mismo orden.
- Son las preguntas de apertura: empieza por lo accesible, sin exigir todavía el \
máximo del nivel indicado.
- Las preguntas deben ser complementarias entre sí; que ninguna repita el enfoque \
de otra.
- Si hay una tecnología principal y el tema lo permite, aterriza la pregunta en ella; \
si el tema es independiente de la tecnología, no la fuerces.
- No respondas las preguntas ni des pistas de las respuestas esperadas.
- No incluyas saludos, cierres ni texto fuera del formato solicitado."""


def usuario_de_calentamiento(areas: Sequence[AreaTecnica]) -> str:
    return (
        f"Formula las primeras {len(areas)} preguntas de la entrevista, "
        "una por cada tema indicado y en ese orden."
    )


def sistema(contexto: ContextoDeEntrevista, area: AreaTecnica, total_preguntas: int) -> str:
    linea_tecnologia = _linea_tecnologia(contexto)

    return f"""\
Eres un entrevistador técnico de una empresa de desarrollo de software. Conduces una \
entrevista simulada en español para un egresado de Ingeniería de Sistemas que postula a \
un puesto.

Puesto al que postula: {contexto.puesto.etiqueta}
Nivel de dificultad: {contexto.nivel.etiqueta}{linea_tecnologia}
Tema de esta pregunta: {area.etiqueta}
Total de preguntas de la entrevista: {total_preguntas}

Reglas:
- Formula una única pregunta abierta, de las que se hacen de verdad en una entrevista \
para ese puesto y nivel.
- La pregunta debe ser del tema indicado arriba, no de otro.
- Calibra la exigencia según el desempeño previo del candidato: si viene flojo, \
formula el tema en su versión más accesible; si viene sólido, exige más profundidad. \
El tema no cambia, lo que cambia es cuánto pides.
- Si hay una tecnología principal y el tema lo permite, aterriza la pregunta en ella; si \
el tema es independiente de la tecnología, no la fuerces.
- No repitas el enfoque de una pregunta ya hecha en esta entrevista.
- No respondas la pregunta ni des pistas de la respuesta esperada.
- No incluyas saludos, cierres ni texto fuera del formato solicitado."""


def usuario(numero: int, previas: list[TemaEvaluado]) -> str:
    """Pide una pregunta concreta, con el desempeño previo como única guía.

    El tema ya viene decidido por el puesto (`PLAN_POR_PUESTO`), así que aquí no
    se le pide al modelo que elija área — solo que ajuste la exigencia. Antes la
    instrucción decía "puedes profundizar en un área relacionada", que pedía algo
    que el modelo no podía hacer desde que el plan fija los temas.
    """
    if not previas:
        return f"Formula la pregunta #{numero} de la entrevista."

    resumen = "\n".join(
        f"{i}. {tema.pregunta} — {tema.puntuacion}/100" for i, tema in enumerate(previas, start=1)
    )
    return (
        f"Preguntas previas de esta entrevista y desempeño del candidato:\n{resumen}\n\n"
        f"Formula la pregunta #{numero}, calibrando la exigencia según ese desempeño."
    )


ESQUEMA_PREGUNTA = {
    "type": "object",
    "properties": {
        "pregunta": {"type": "string", "description": "Texto de la pregunta para el candidato"},
    },
    "required": ["pregunta"],
    "additionalProperties": False,
}


def esquema_de_preguntas(cuantas: int) -> dict:
    """Esquema para pedir varias preguntas en una sola respuesta.

    `minItems`/`maxItems` fijan la cantidad en el propio esquema, así el modelo
    recibe la restricción en vez de depender de que la cumpla por cortesía; aun
    así `parsear_preguntas` la vuelve a verificar, porque un esquema no es una
    garantía.
    """
    return {
        "type": "object",
        "properties": {
            "preguntas": {
                "type": "array",
                "minItems": cuantas,
                "maxItems": cuantas,
                "items": ESQUEMA_PREGUNTA,
                "description": f"Las {cuantas} preguntas, en el orden de los temas pedidos",
            },
        },
        "required": ["preguntas"],
        "additionalProperties": False,
    }

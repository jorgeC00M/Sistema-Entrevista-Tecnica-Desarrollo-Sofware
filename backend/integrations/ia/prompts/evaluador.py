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

from .schemas import (
    CRITERIOS,
    NIVEL_MAXIMO,
    PUNTOS_CLAVE_MAXIMOS,
    PUNTOS_CLAVE_MINIMOS,
    AreaTecnica,
    ContextoDeEntrevista,
)

# Rúbrica analítica: tres criterios de igual peso, cada uno con cinco niveles
# descritos. Es dato, no prosa suelta: el mismo diccionario arma el texto que
# recibe el modelo y lo que la API publica en "¿Cómo se calcula?", así que el
# candidato lee exactamente los descriptores con los que fue calificado.
NOMBRES_DE_CRITERIOS = {
    "correccion": "Corrección técnica",
    "completitud": "Completitud",
    "claridad": "Claridad",
}

DESCRIPTORES: dict[str, tuple[str, ...]] = {
    "correccion": (
        "Incorrecta, vacía o fuera de tema.",
        "Contiene errores conceptuales importantes.",
        "La idea central es correcta, con errores menores.",
        "Correcta, sin errores relevantes.",
        "Correcta y precisa, con la terminología adecuada.",
    ),
    "completitud": (
        "No cubre lo que se esperaba.",
        "Cubre una parte mínima de lo esperado.",
        "Cubre lo esencial pero deja vacíos importantes.",
        "Cubre casi todo lo esperado para el nivel.",
        "Cubre todo lo esperado para el nivel.",
    ),
    "claridad": (
        "Incomprensible o sin estructura.",
        "Difícil de seguir; las ideas están desordenadas.",
        "Se entiende, aunque con saltos o ambigüedades.",
        "Ordenada y fácil de seguir.",
        "Ordenada, con el razonamiento explícito paso a paso.",
    ),
}


def _texto_de_rubrica() -> str:
    bloques = []
    for criterio in CRITERIOS:
        niveles = "\n".join(
            f"  {nivel}: {descriptor}" for nivel, descriptor in enumerate(DESCRIPTORES[criterio])
        )
        bloques.append(f"{NOMBRES_DE_CRITERIOS[criterio]} ({criterio}):\n{niveles}")
    return (
        "Evalúa la respuesta con tres criterios de igual peso. Para cada uno elige "
        f"UN nivel entero de 0 a {NIVEL_MAXIMO} según su descriptor:\n\n"
        + "\n\n".join(bloques)
        + "\n\nNo calcules ninguna nota: la nota de 0 a 100 se obtiene de los niveles."
    )


RUBRICA = _texto_de_rubrica()


def sistema(contexto: ContextoDeEntrevista, area: AreaTecnica) -> str:
    # Se omite la línea entera cuando no hay tecnología: decir "ninguna"
    # invitaría al modelo a comentar la ausencia en vez de ignorarla.
    linea_tecnologia = (
        f"\nTecnología elegida por el candidato: {contexto.tecnologia}"
        if contexto.tecnologia is not None
        else ""
    )

    return f"""\
Eres un evaluador técnico que califica respuestas de una entrevista simulada en \
español para un egresado de Ingeniería de Sistemas que postula a un puesto.

Puesto al que postula: {contexto.puesto.etiqueta}
Experiencia del candidato: {contexto.nivel.con_experiencia}{linea_tecnologia}
Tema de la pregunta: {area.etiqueta}

{RUBRICA}

Calibra la exigencia al puesto y nivel indicados: no bajes un nivel por omitir algo \
que solo se esperaría de un perfil con más experiencia.
En `puntos_clave` indica, en {PUNTOS_CLAVE_MINIMOS} a {PUNTOS_CLAVE_MAXIMOS} frases cortas, \
lo que una respuesta completa debía cubrir para este nivel. Describe lo esperado: no \
repitas ni corrijas la respuesta del candidato.
Dirígete al candidato en segunda persona. No incluyas saludos, cierres ni texto \
fuera del formato solicitado."""


def usuario(pregunta: str, respuesta: str) -> str:
    return f"Pregunta: {pregunta}\n\nRespuesta del candidato: {respuesta}\n\nEvalúa esta respuesta."


_NIVEL = {"type": "integer", "minimum": 0, "maximum": NIVEL_MAXIMO}

ESQUEMA_EVALUACION = {
    "type": "object",
    "properties": {
        "niveles": {
            "type": "object",
            "description": f"Nivel de 0 a {NIVEL_MAXIMO} de cada criterio, según su descriptor",
            "properties": {criterio: _NIVEL for criterio in CRITERIOS},
            "required": list(CRITERIOS),
            "additionalProperties": False,
        },
        "fortalezas": {"type": "string", "description": "Aspectos positivos detectados"},
        "debilidades": {"type": "string", "description": "Aspectos a mejorar"},
        "sugerencias": {"type": "string", "description": "Recomendación concreta de mejora"},
        "puntos_clave": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": PUNTOS_CLAVE_MINIMOS,
            "maxItems": PUNTOS_CLAVE_MAXIMOS,
            "description": "Lo que una respuesta completa debía cubrir para este nivel",
        },
    },
    "required": ["niveles", "fortalezas", "debilidades", "sugerencias", "puntos_clave"],
    "additionalProperties": False,
}

"""Escrituras de la calificación de una respuesta.

Las lecturas agregadas (estadísticas y retroalimentación acumulada) viven en
`selectors.py`, siguiendo la misma separación que el resto del proyecto:
services escribe, selectors lee.
"""

from __future__ import annotations

from integrations.ia.base import ProveedorIA
from integrations.ia.prompts.schemas import AreaTecnica, ContextoDeEntrevista
from integrations.ia.prompts.schemas import Evaluacion as EvaluacionIA

from .models import Evaluacion
from .rubricas import PESOS, VERSION_DE_RUBRICA, puntuacion_de


def calificar(
    contexto: ContextoDeEntrevista,
    area: AreaTecnica,
    pregunta: str,
    respuesta: str,
    proveedor: ProveedorIA,
) -> EvaluacionIA:
    """Pide la calificación al proveedor. Solo red, no toca la base de datos.

    Está separada de `guardar` a propósito: el llamador hace esta llamada
    fuera de la transacción, para no mantener una abierta durante los segundos
    que tarda el proveedor en responder.

    `area` es el tema de esa pregunta concreta, no de la entrevista: el puesto
    reparte varios temas entre las preguntas.
    """
    return proveedor.evaluar_respuesta(contexto, area, pregunta, respuesta)


def guardar(intercambio, resultado: EvaluacionIA, proveedor: ProveedorIA) -> Evaluacion:
    """Persiste la calificación. Solo base de datos, no hace red.

    La nota no viene del proveedor: se calcula aquí con `puntuacion_de` sobre
    los niveles que eligió. `evaluacion_json` guarda niveles, pesos y versión
    de la rúbrica para que cualquier nota se pueda recalcular a mano.
    """
    niveles = resultado.niveles.como_dict()
    return Evaluacion.objects.create(
        intercambio=intercambio,
        puntuacion=puntuacion_de(niveles, PESOS),
        fortalezas=resultado.fortalezas,
        debilidades=resultado.debilidades,
        sugerencias=resultado.sugerencias,
        evaluacion_json={
            "niveles": niveles,
            "pesos": dict(PESOS),
            "version_rubrica": VERSION_DE_RUBRICA,
            "fortalezas": resultado.fortalezas,
            "debilidades": resultado.debilidades,
            "sugerencias": resultado.sugerencias,
            "puntos_clave": list(resultado.puntos_clave),
        },
        proveedor_ia=proveedor.nombre,
        modelo_ia=proveedor.modelo,
    )

"""Escrituras de la calificación de una respuesta.

Las lecturas agregadas (estadísticas y retroalimentación acumulada) viven en
`selectors.py`, siguiendo la misma separación que el resto del proyecto:
services escribe, selectors lee.
"""

from __future__ import annotations

from integrations.ia.base import ProveedorIA
from integrations.ia.prompts.schemas import AreaTecnica
from integrations.ia.prompts.schemas import Evaluacion as EvaluacionIA
from integrations.ia.prompts.schemas import Nivel

from .models import Evaluacion


def calificar(
    area: AreaTecnica,
    nivel: Nivel,
    pregunta: str,
    respuesta: str,
    proveedor: ProveedorIA,
) -> EvaluacionIA:
    """Pide la calificación al proveedor. Solo red, no toca la base de datos.

    Está separada de `guardar` a propósito: el llamador hace esta llamada
    fuera de la transacción, para no mantener una abierta durante los segundos
    que tarda el proveedor en responder.
    """
    return proveedor.evaluar_respuesta(area, nivel, pregunta, respuesta)


def guardar(intercambio, resultado: EvaluacionIA, proveedor: ProveedorIA) -> Evaluacion:
    """Persiste la calificación. Solo base de datos, no hace red."""
    return Evaluacion.objects.create(
        intercambio=intercambio,
        puntuacion=resultado.puntuacion,
        fortalezas=resultado.fortalezas,
        debilidades=resultado.debilidades,
        sugerencias=resultado.sugerencias,
        evaluacion_json={
            "puntuacion": resultado.puntuacion,
            "fortalezas": resultado.fortalezas,
            "debilidades": resultado.debilidades,
            "sugerencias": resultado.sugerencias,
        },
        proveedor_ia=proveedor.nombre,
        modelo_ia=proveedor.modelo,
    )

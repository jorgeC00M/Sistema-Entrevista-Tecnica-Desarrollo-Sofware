"""Calificación de respuestas y estadísticas de progreso.

`calcular_estadisticas` resuelve todo con agregaciones de la base de datos
(`Avg`, `Count`), nunca sumando listas en Python — es lo que sostiene el verbo
"mejorar" del objetivo general con datos reales.

El promedio general y el promedio por área se calculan sobre `Evaluacion`
directamente (una fila por pregunta respondida), no promediando los
`puntuacion_promedio` ya promediados de cada entrevista: promediar promedios
pondera mal cuando las entrevistas no tienen el mismo número de preguntas
evaluadas.
"""

from __future__ import annotations

from django.db.models import Avg, Count

from apps.entrevistas.models import Entrevista
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


def calcular_estadisticas(usuario) -> dict:
    finalizadas = Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.FINALIZADA)

    promedio_general = Evaluacion.objects.filter(
        intercambio__entrevista__usuario=usuario,
        intercambio__entrevista__estado=Entrevista.Estado.FINALIZADA,
    ).aggregate(promedio=Avg("puntuacion"))["promedio"]

    por_area = [
        {
            "area": fila["area__codigo"],
            "area_display": fila["area__nombre"],
            "promedio": fila["promedio"],
            "entrevistas": fila["entrevistas"],
        }
        for fila in finalizadas.values("area__codigo", "area__nombre")
        .annotate(
            promedio=Avg("intercambios__evaluacion__puntuacion"),
            entrevistas=Count("id", distinct=True),
        )
        .order_by("area__codigo")
    ]

    evolucion = [
        {
            "entrevista_id": fila["id"],
            "area": fila["area__codigo"],
            "area_display": fila["area__nombre"],
            "fecha_fin": fila["fecha_fin"],
            "puntuacion_promedio": fila["puntuacion_promedio"],
        }
        for fila in finalizadas.order_by("fecha_fin").values(
            "id", "area__codigo", "area__nombre", "fecha_fin", "puntuacion_promedio"
        )
    ]

    return {
        "entrevistas_completadas": finalizadas.count(),
        "promedio_general": promedio_general,
        "promedio_por_area": por_area,
        "evolucion": evolucion,
    }

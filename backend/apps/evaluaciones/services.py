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

from django.db.models import Avg, Count, Q

from apps.entrevistas.models import Entrevista
from integrations.ia.base import ProveedorIA
from integrations.ia.prompts.schemas import AreaTecnica
from integrations.ia.prompts.schemas import Evaluacion as EvaluacionIA
from integrations.ia.prompts.schemas import Nivel

from .models import Evaluacion
from .rubricas import BANDAS, banda_de

# Cuántas observaciones devuelve la retroalimentación acumulada. Cubre cuatro
# entrevistas completas, que es más de lo que se revisa de una sentada; si
# alguna vez hace falta el histórico entero, entonces se pagina.
MAXIMO_OBSERVACIONES = 20


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


def calcular_retroalimentacion(usuario) -> dict:
    """Reúne lo que las evaluaciones dijeron del usuario en todas sus entrevistas.

    A diferencia de `calcular_estadisticas`, esto NO filtra por entrevistas
    finalizadas, y es deliberado: una media solo es comparable entre entrevistas
    completas, pero una debilidad detectada en la pregunta 3 de una entrevista
    que se dejó a medias sigue siendo una debilidad real que conviene mostrar.

    Las preguntas todavía sin responder quedan fuera por construcción: se
    consulta `Evaluacion`, y un intercambio sin calificar no tiene fila aquí.
    """
    evaluaciones = Evaluacion.objects.filter(intercambio__entrevista__usuario=usuario)

    # Las bandas viven en rubricas.py, no en la base de datos. Se cuentan con un
    # filtro por rango para que los umbrales sigan estando en un solo sitio.
    conteo_por_banda = {
        banda.codigo: Count(
            "id", filter=Q(puntuacion__gte=banda.minimo, puntuacion__lte=banda.maximo)
        )
        for banda in BANDAS
    }

    por_area = [
        {
            "area": fila["intercambio__entrevista__area__codigo"],
            "area_display": fila["intercambio__entrevista__area__nombre"],
            "total_respuestas": fila["total_respuestas"],
            "promedio": fila["promedio"],
            "bandas": {banda.codigo: fila[banda.codigo] for banda in BANDAS},
        }
        for fila in evaluaciones.values(
            "intercambio__entrevista__area__codigo",
            "intercambio__entrevista__area__nombre",
        )
        .annotate(
            total_respuestas=Count("id"),
            promedio=Avg("puntuacion"),
            **conteo_por_banda,
        )
        .order_by("intercambio__entrevista__area__codigo")
    ]

    recientes = (
        evaluaciones.select_related(
            "intercambio", "intercambio__entrevista", "intercambio__entrevista__area"
        )
        .order_by("-creado_en")[:MAXIMO_OBSERVACIONES]
    )

    observaciones = [
        {
            "entrevista_id": evaluacion.intercambio.entrevista_id,
            "area": evaluacion.intercambio.entrevista.area.codigo,
            "area_display": evaluacion.intercambio.entrevista.area.nombre,
            "numero": evaluacion.intercambio.numero,
            "pregunta": evaluacion.intercambio.pregunta,
            "puntuacion": evaluacion.puntuacion,
            "banda": banda_de(evaluacion.puntuacion).codigo,
            "debilidades": evaluacion.debilidades,
            "sugerencias": evaluacion.sugerencias,
            "fecha": evaluacion.creado_en,
        }
        for evaluacion in recientes
    ]

    return {
        "total_respuestas_evaluadas": evaluaciones.count(),
        "por_area": por_area,
        "observaciones": observaciones,
    }

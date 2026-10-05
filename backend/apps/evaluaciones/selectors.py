"""Lecturas agregadas sobre las evaluaciones de un usuario.

Todo se resuelve con agregaciones de la base de datos (`Avg`, `Count`), nunca
sumando listas en Python — es lo que sostiene el verbo "mejorar" del objetivo
general con datos reales.

El promedio general y el promedio por área se calculan sobre `Evaluacion`
directamente (una fila por pregunta respondida), no promediando los
`puntuacion_promedio` ya promediados de cada entrevista: promediar promedios
pondera mal cuando las entrevistas no tienen el mismo número de preguntas
evaluadas.

El área se lee del intercambio, no de la entrevista. Antes la entrevista tenía
una sola área y las cinco respuestas heredaban esa etiqueta; hoy cada pregunta
lleva la suya, así que agrupar por `intercambio__area` describe de verdad en qué
temas le fue bien o mal al usuario. La evolución en el tiempo, en cambio, es por
entrevista, y lo que la identifica ahí es el puesto.
"""

from __future__ import annotations

from django.db.models import Avg, Count, Q

from apps.entrevistas.models import Entrevista

from .models import Evaluacion
from .rubricas import BANDAS, banda_de

# Cuántas observaciones devuelve la retroalimentación acumulada. Cubre cuatro
# entrevistas completas, que es más de lo que se revisa de una sentada; si
# alguna vez hace falta el histórico entero, entonces se pagina.
MAXIMO_OBSERVACIONES = 20


def calcular_estadisticas(usuario) -> dict:
    finalizadas = Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.FINALIZADA)

    promedio_general = Evaluacion.objects.filter(
        intercambio__entrevista__usuario=usuario,
        intercambio__entrevista__estado=Entrevista.Estado.FINALIZADA,
    ).aggregate(promedio=Avg("puntuacion"))["promedio"]

    # Se agrupa desde `Evaluacion` y no desde `Entrevista` porque el área vive
    # ahora en el intercambio: una entrevista aporta respuestas a varias áreas.
    # `entrevistas` sigue contando entrevistas distintas, para que la cifra
    # responda "en cuántas entrevistas toqué este tema".
    por_area = [
        {
            "area": fila["intercambio__area__codigo"],
            "area_display": fila["intercambio__area__nombre"],
            "promedio": fila["promedio"],
            "entrevistas": fila["entrevistas"],
        }
        for fila in Evaluacion.objects.filter(
            intercambio__entrevista__in=finalizadas,
        )
        .values("intercambio__area__codigo", "intercambio__area__nombre")
        .annotate(
            promedio=Avg("puntuacion"),
            entrevistas=Count("intercambio__entrevista", distinct=True),
        )
        .order_by("intercambio__area__codigo")
    ]

    evolucion = [
        {
            "entrevista_id": fila["id"],
            "puesto": fila["puesto__codigo"],
            "puesto_display": fila["puesto__nombre"],
            "fecha_fin": fila["fecha_fin"],
            "puntuacion_promedio": fila["puntuacion_promedio"],
        }
        for fila in finalizadas.order_by("fecha_fin").values(
            "id", "puesto__codigo", "puesto__nombre", "fecha_fin", "puntuacion_promedio"
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
            "area": fila["intercambio__area__codigo"],
            "area_display": fila["intercambio__area__nombre"],
            "total_respuestas": fila["total_respuestas"],
            "promedio": fila["promedio"],
            "bandas": {banda.codigo: fila[banda.codigo] for banda in BANDAS},
        }
        for fila in evaluaciones.values(
            "intercambio__area__codigo",
            "intercambio__area__nombre",
        )
        .annotate(
            total_respuestas=Count("id"),
            promedio=Avg("puntuacion"),
            **conteo_por_banda,
        )
        .order_by("intercambio__area__codigo")
    ]

    recientes = evaluaciones.select_related("intercambio", "intercambio__area").order_by(
        "-creado_en"
    )[:MAXIMO_OBSERVACIONES]

    observaciones = [
        {
            "entrevista_id": evaluacion.intercambio.entrevista_id,
            "area": evaluacion.intercambio.area.codigo,
            "area_display": evaluacion.intercambio.area.nombre,
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

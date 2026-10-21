"""Lecturas agregadas sobre las evaluaciones de un usuario.

Todo se resuelve con agregaciones de la base de datos (`Avg`, `Count`), nunca
sumando listas en Python — es lo que sostiene el verbo "mejorar" del objetivo
general con datos reales.

Los promedios se calculan sobre `Evaluacion` directamente (una fila por
pregunta respondida), no promediando los `puntuacion_promedio` ya promediados
de cada entrevista: promediar promedios pondera mal cuando las entrevistas no
tienen el mismo número de preguntas evaluadas.

El desglose por área vive solo en la retroalimentación acumulada, y se lee del
intercambio, no de la entrevista: cada pregunta lleva su área, así que agrupar
por `intercambio__area` describe de verdad en qué temas le fue bien o mal al
usuario. La evolución en el tiempo no sale de aquí: la pantalla la arma con el
historial de entrevistas (`GET /api/entrevistas/`), el mismo que filtra la
tabla, para que el gráfico muestre exactamente lo que se ve en ella.
"""

from __future__ import annotations

from django.db.models import Avg, Count, Q

from .models import Evaluacion
from .rubricas import BANDAS, banda_de

# Cuántas observaciones devuelve la retroalimentación acumulada. Cubre cuatro
# entrevistas completas, que es más de lo que se revisa de una sentada; si
# alguna vez hace falta el histórico entero, entonces se pagina.
MAXIMO_OBSERVACIONES = 20


def calcular_retroalimentacion(usuario) -> dict:
    """Reúne lo que las evaluaciones dijeron del usuario en todas sus entrevistas.

    NO filtra por entrevistas finalizadas, y es deliberado: una debilidad
    detectada en la pregunta 3 de una entrevista que se dejó a medias sigue
    siendo una debilidad real que conviene mostrar.

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

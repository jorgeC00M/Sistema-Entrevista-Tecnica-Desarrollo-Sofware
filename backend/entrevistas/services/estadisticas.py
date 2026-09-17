"""Estadísticas de progreso del usuario: promedio general, promedio por área
y evolución cronológica de sus entrevistas finalizadas.

Todo se calcula con agregaciones de la base de datos (`Avg`, `Count`), nunca
sumando listas en Python — es lo que sostiene el verbo "mejorar" del objetivo
general del proyecto con datos reales, no con una aproximación.

El promedio general y el promedio por área se calculan sobre `Evaluacion`
directamente (una fila por pregunta respondida), no promediando los
`puntuacion_promedio` ya promediados de cada `Entrevista`: promediar promedios
pondera mal cuando las entrevistas no tienen el mismo número de preguntas
evaluadas, y aquí sí lo tienen, pero calcularlo así es correcto en general y
no cuesta nada adicional.
"""

from __future__ import annotations

from django.db.models import Avg, Count

from entrevistas.models import Entrevista, Evaluacion

from .ia.schemas import AreaTecnica


def calcular(usuario) -> dict:
    finalizadas = Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.FINALIZADA)

    promedio_general = Evaluacion.objects.filter(
        intercambio__entrevista__usuario=usuario,
        intercambio__entrevista__estado=Entrevista.Estado.FINALIZADA,
    ).aggregate(promedio=Avg("puntuacion"))["promedio"]

    por_area = [
        {
            "area": fila["area"],
            "area_display": AreaTecnica(fila["area"]).etiqueta,
            "promedio": fila["promedio"],
            "entrevistas": fila["entrevistas"],
        }
        for fila in finalizadas.values("area")
        .annotate(
            promedio=Avg("intercambios__evaluacion__puntuacion"),
            entrevistas=Count("id", distinct=True),
        )
        .order_by("area")
    ]

    evolucion = [
        {
            "entrevista_id": fila["id"],
            "area": fila["area"],
            "area_display": AreaTecnica(fila["area"]).etiqueta,
            "fecha_fin": fila["fecha_fin"],
            "puntuacion_promedio": fila["puntuacion_promedio"],
        }
        for fila in finalizadas.order_by("fecha_fin").values(
            "id", "area", "fecha_fin", "puntuacion_promedio"
        )
    ]

    return {
        "entrevistas_completadas": finalizadas.count(),
        "promedio_general": promedio_general,
        "promedio_por_area": por_area,
        "evolucion": evolucion,
    }

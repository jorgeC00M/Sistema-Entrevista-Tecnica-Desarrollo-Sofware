"""Evaluación de un intercambio (sección 3.4.1 del perfil: resultados por pregunta).

Vive en su propia app porque la calificación es un dominio distinto al de
conducir la entrevista: cambia con la rúbrica, no con el flujo. La relación
sigue siendo uno a uno con Intercambio, respaldada por la base de datos —
un intercambio no puede terminar con dos calificaciones aunque se reintente
la petición que falló a mitad de camino.
"""

from __future__ import annotations

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from integrations.ia.prompts.schemas import CRITERIOS


class Evaluacion(models.Model):
    intercambio = models.OneToOneField(
        "entrevistas.Intercambio", on_delete=models.CASCADE, related_name="evaluacion"
    )
    puntuacion = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    fortalezas = models.TextField()
    debilidades = models.TextField()
    sugerencias = models.TextField()
    evaluacion_json = models.JSONField(
        help_text="Respuesta cruda del proveedor de IA, para auditoría y trazabilidad."
    )
    proveedor_ia = models.CharField(max_length=30)
    modelo_ia = models.CharField(max_length=50)
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Sin índice por `creado_en`: lo usaba la retroalimentación acumulada,
        # que se retiró; ninguna consulta ordena ni filtra por esa fecha.
        verbose_name = "evaluación"
        verbose_name_plural = "evaluaciones"

    def __str__(self) -> str:
        return f"Evaluación de {self.intercambio_id}: {self.puntuacion}/100"

    @property
    def niveles(self) -> dict[str, int] | None:
        """Los niveles por criterio guardados en `evaluacion_json`, o `None`.

        Las evaluaciones anteriores a la rúbrica por niveles no los tienen; un
        único lugar decide qué cuenta como "tiene niveles" para que el reporte y
        el resumen no puedan discrepar.
        """
        niveles = (self.evaluacion_json or {}).get("niveles")
        if not isinstance(niveles, dict) or not all(isinstance(niveles.get(c), int) for c in CRITERIOS):
            return None
        return {criterio: niveles[criterio] for criterio in CRITERIOS}

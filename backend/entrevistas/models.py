"""Modelos de la sección 3.4.1 del perfil de grado (estructura de datos):
Entrevista (cabecera), Intercambio (pregunta-respuesta) y Evaluación.

`area` y `nivel` reutilizan los enums `AreaTecnica` y `Nivel` de
`services/ia/schemas.py` como `choices`, para que el dominio y la base de
datos no puedan desincronizarse.
"""

from __future__ import annotations

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from .services.ia.schemas import AreaTecnica, Nivel


class Entrevista(models.Model):
    class Estado(models.TextChoices):
        EN_PROGRESO = "en_progreso", "En progreso"
        FINALIZADA = "finalizada", "Finalizada"
        ABANDONADA = "abandonada", "Abandonada"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="entrevistas"
    )
    area = models.CharField(max_length=30, choices=[(a.value, a.etiqueta) for a in AreaTecnica])
    nivel = models.CharField(max_length=20, choices=[(n.value, n.etiqueta) for n in Nivel])
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.EN_PROGRESO)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    puntuacion_promedio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["-fecha_inicio"]
        indexes = [models.Index(fields=["usuario", "fecha_inicio"])]
        verbose_name = "entrevista"
        verbose_name_plural = "entrevistas"

    def __str__(self) -> str:
        return f"{self.usuario} — {self.get_area_display()} ({self.get_estado_display()})"

    @property
    def area_enum(self) -> AreaTecnica:
        return AreaTecnica(self.area)

    @property
    def nivel_enum(self) -> Nivel:
        return Nivel(self.nivel)


class Intercambio(models.Model):
    entrevista = models.ForeignKey(Entrevista, on_delete=models.CASCADE, related_name="intercambios")
    numero = models.PositiveSmallIntegerField()
    pregunta = models.TextField()
    respuesta = models.TextField(blank=True, default="")
    creado_en = models.DateTimeField(auto_now_add=True)
    respondido_en = models.DateTimeField(null=True, blank=True)
    tiempo_respuesta = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Segundos entre mostrar la pregunta y recibir la respuesta, medidos en el servidor.",
    )

    class Meta:
        ordering = ["numero"]
        constraints = [
            models.UniqueConstraint(fields=["entrevista", "numero"], name="unico_numero_por_entrevista")
        ]
        verbose_name = "intercambio"
        verbose_name_plural = "intercambios"

    def __str__(self) -> str:
        return f"Pregunta {self.numero} de la entrevista {self.entrevista_id}"


class Evaluacion(models.Model):
    intercambio = models.OneToOneField(
        Intercambio, on_delete=models.CASCADE, related_name="evaluacion"
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
        verbose_name = "evaluación"
        verbose_name_plural = "evaluaciones"

    def __str__(self) -> str:
        return f"Evaluación de {self.intercambio_id}: {self.puntuacion}/100"

"""Modelos de la sección 3.4.1 del perfil de grado: Entrevista (cabecera) e
Intercambio (pregunta-respuesta). La Evaluación vive en `apps.evaluaciones`.

`area` y `nivel` son claves foráneas a `apps.catalogos`, no texto libre: es lo
que permite dar de alta un área nueva desde el admin sin migrar datos. El
puente con la capa de IA es el campo `codigo` del catálogo, que coincide con
los enums de `integrations.ia`.
"""

from __future__ import annotations

from django.conf import settings
from django.db import models

from integrations.ia.prompts.schemas import AreaTecnica, Nivel


class Entrevista(models.Model):
    class Estado(models.TextChoices):
        EN_PROGRESO = "en_progreso", "En progreso"
        FINALIZADA = "finalizada", "Finalizada"
        ABANDONADA = "abandonada", "Abandonada"

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="entrevistas"
    )
    # PROTECT: un área con entrevistas hechas no se borra, se desactiva. Si no,
    # el historial del usuario perdería el dato que da sentido a su puntuación.
    area = models.ForeignKey(
        "catalogos.Area", on_delete=models.PROTECT, related_name="entrevistas"
    )
    nivel = models.ForeignKey(
        "catalogos.Nivel", on_delete=models.PROTECT, related_name="entrevistas"
    )
    estado = models.CharField(max_length=20, choices=Estado.choices, default=Estado.EN_PROGRESO)
    fecha_inicio = models.DateTimeField(auto_now_add=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    puntuacion_promedio = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ["-fecha_inicio"]
        indexes = [
            # Sirve al listado del historial, que ordena por fecha.
            models.Index(fields=["usuario", "fecha_inicio"]),
            # El filtro realmente caliente: `marcar_abandonadas` y las
            # estadísticas filtran por usuario + estado en cada consulta del
            # historial, no por usuario + fecha.
            models.Index(fields=["usuario", "estado"]),
        ]
        verbose_name = "entrevista"
        verbose_name_plural = "entrevistas"

    def __str__(self) -> str:
        return f"{self.usuario} — {self.area.nombre} ({self.get_estado_display()})"

    @property
    def area_enum(self) -> AreaTecnica:
        return AreaTecnica(self.area.codigo)

    @property
    def nivel_enum(self) -> Nivel:
        return Nivel(self.nivel.codigo)


class Intercambio(models.Model):
    entrevista = models.ForeignKey(
        Entrevista, on_delete=models.CASCADE, related_name="intercambios"
    )
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
            models.UniqueConstraint(
                fields=["entrevista", "numero"], name="unico_numero_por_entrevista"
            )
        ]
        verbose_name = "intercambio"
        verbose_name_plural = "intercambios"

    def __str__(self) -> str:
        return f"Pregunta {self.numero} de la entrevista {self.entrevista_id}"

"""Tablas de referencia: puestos, tecnologías, áreas técnicas y niveles.

El perfil de grado (sección 3.4.1) modela `area_tecnica` y `nivel` como campos
de texto dentro de Entrevista. Aquí se normalizan a tablas propias para poder
darlas de alta o de baja sin tocar código ni migrar datos, y para que el
frontend las lea de la API en lugar de duplicarlas.

`codigo` es el puente con la capa de IA: sus valores coinciden con los de los
enums `AreaTecnica`, `Nivel`, `Puesto` y `Tecnologia` de `integrations.ia`, que
siguen siendo el contrato con el proveedor — esa capa no conoce Django ni la
base de datos.

Qué elige el usuario y qué es interno:

- `Puesto` y `Nivel` son lo que se elige al iniciar una entrevista, y `Tecnologia`
  lo que se elige opcionalmente. Es el encuadre de una postulación real: se
  postula a "Desarrollador Backend", no a "Bases de Datos".
- `Area` dejó de elegirse directamente. Ahora el puesto determina qué áreas
  recorren las preguntas (`PLAN_POR_PUESTO`, en la capa de IA) y cada
  intercambio guarda la suya. Sigue siendo el eje con el que se agrupan las
  estadísticas y la retroalimentación, que es donde de verdad sirve.
"""

from __future__ import annotations

from django.db import models

from apps.common.models import ModeloDeCatalogo


class Puesto(ModeloDeCatalogo):
    """Rol al que postula el candidato: lo que de verdad se elige al empezar."""

    # Nombre de un icono de `components/ui/Icono.tsx`. Vive aquí y no en el
    # frontend para que un puesto nuevo no exija tocar la interfaz.
    icono = models.CharField(max_length=30, blank=True, default="")

    @property
    def tiene_capas(self) -> bool:
        """Si se practica con una tecnología por capa (Full Stack) en vez de una
        sola. Lo decide el catálogo: basta que una tecnología activa tenga capa."""
        return self.tecnologias.filter(activo=True).exclude(capa=Tecnologia.Capa.NINGUNA).exists()

    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "puesto"
        verbose_name_plural = "puestos"

    def __str__(self) -> str:
        return self.nombre


class Tecnologia(ModeloDeCatalogo):
    """Tecnología con la que trabaja el candidato, propia de un puesto.

    Cada fila pertenece a un solo puesto: "C# .NET" de Backend y de Escritorio
    son dos filas, porque el puesto cambia lo que se pregunta sobre ella.

    `puesto` solo es nulo en las tres combinaciones transversales anteriores al
    catálogo por puesto (Python/Django, JavaScript/React, Java/Spring), que se
    conservan inactivas porque hay entrevistas que las usaron. Una restricción
    impide una tecnología **activa** sin puesto.

    `capa` divide las tecnologías de un puesto que se eligen de a dos: en Full
    Stack, una de frontend y una de backend. Un puesto "tiene capas" si alguna de
    sus tecnologías activas la tiene; el código no pregunta por el puesto.
    """

    class Capa(models.TextChoices):
        NINGUNA = "", "Sin capa"
        FRONTEND = "frontend", "Frontend"
        BACKEND = "backend", "Backend"

    #: Las capas de un puesto que las tiene, en el orden en que se eligen y se
    #: nombran: "React + Node.js".
    CAPAS_EN_ORDEN = (Capa.FRONTEND, Capa.BACKEND)

    puesto = models.ForeignKey(
        Puesto,
        on_delete=models.PROTECT,
        related_name="tecnologias",
        null=True,
        blank=True,
    )
    capa = models.CharField(max_length=10, choices=Capa.choices, blank=True, default=Capa.NINGUNA)
    # Rótulo con que se agrupa en pantalla: el lenguaje de un framework
    # ("Python" para Django) o el tipo de prueba en QA. Solo presentación: no se
    # valida ni llega a la IA. Vacío si el puesto no agrupa.
    grupo = models.CharField(max_length=40, blank=True, default="")

    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "tecnología"
        verbose_name_plural = "tecnologías"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(activo=False) | models.Q(puesto__isnull=False),
                name="tecnologia_activa_con_puesto",
            )
        ]

    def __str__(self) -> str:
        return self.nombre


class Area(ModeloDeCatalogo):
    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "área técnica"
        verbose_name_plural = "áreas técnicas"

    def __str__(self) -> str:
        return self.nombre


class Nivel(ModeloDeCatalogo):
    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "nivel de dificultad"
        verbose_name_plural = "niveles de dificultad"

    def __str__(self) -> str:
        return self.nombre

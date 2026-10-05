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

    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "puesto"
        verbose_name_plural = "puestos"

    def __str__(self) -> str:
        return self.nombre


class Tecnologia(ModeloDeCatalogo):
    """Stack sobre el que gira la entrevista. Opcional: en una entrevista real
    las preguntas se adaptan al stack de la empresa, pero un egresado puede no
    tener preferencia, y entonces `Entrevista.tecnologia` queda en NULL en vez
    de forzar una fila "indiferente" que no es una tecnología."""

    class Meta:
        ordering = ["orden", "nombre"]
        verbose_name = "tecnología"
        verbose_name_plural = "tecnologías"

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

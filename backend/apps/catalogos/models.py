"""Tablas de referencia: áreas técnicas y niveles de dificultad.

El perfil de grado (sección 3.4.1) modela `area_tecnica` y `nivel` como campos
de texto dentro de Entrevista. Aquí se normalizan a tablas propias para poder
darlas de alta o de baja sin tocar código ni migrar datos, y para que el
frontend las lea de la API en lugar de duplicarlas.

`codigo` es el puente con la capa de IA: sus valores coinciden con los de los
enums `AreaTecnica` y `Nivel` de `integrations.ia`, que siguen siendo el
contrato con el proveedor — esa capa no conoce Django ni la base de datos.
"""

from __future__ import annotations

from django.db import models

from apps.common.models import ModeloDeCatalogo


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

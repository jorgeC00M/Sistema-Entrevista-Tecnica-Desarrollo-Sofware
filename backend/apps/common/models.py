"""Bases abstractas reutilizables por las apps del dominio."""

from __future__ import annotations

from django.db import models


class ModeloConMarcaDeTiempo(models.Model):
    """Añade creado_en / actualizado_en sin crear tabla propia."""

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class ModeloDeCatalogo(ModeloConMarcaDeTiempo):
    """Base de las tablas de referencia (áreas, niveles).

    `codigo` es la clave estable que consume el resto del sistema: la capa de
    IA trabaja con esos valores y la API los expone tal cual, de modo que
    renombrar `nombre` nunca rompe un cliente ni un prompt.
    """

    codigo = models.SlugField(max_length=30, unique=True)
    nombre = models.CharField(max_length=60)
    descripcion = models.TextField(blank=True, default="")
    orden = models.PositiveSmallIntegerField(default=0)
    activo = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ["orden", "nombre"]

    def __str__(self) -> str:
        return self.nombre

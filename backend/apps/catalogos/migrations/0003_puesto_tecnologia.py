"""Tablas de Puesto y Tecnología: lo que el usuario elige al iniciar.

Mismo molde que Area y Nivel (`ModeloDeCatalogo`), para que el admin, la API y
el puente por `codigo` con la capa de IA funcionen igual sin casos especiales.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0002_datos_iniciales")]

    operations = [
        migrations.CreateModel(
            name="Puesto",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                ("codigo", models.SlugField(max_length=30, unique=True)),
                ("nombre", models.CharField(max_length=60)),
                ("descripcion", models.TextField(blank=True, default="")),
                ("orden", models.PositiveSmallIntegerField(default=0)),
                ("activo", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "puesto",
                "verbose_name_plural": "puestos",
                "ordering": ["orden", "nombre"],
            },
        ),
        migrations.CreateModel(
            name="Tecnologia",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("creado_en", models.DateTimeField(auto_now_add=True)),
                ("actualizado_en", models.DateTimeField(auto_now=True)),
                ("codigo", models.SlugField(max_length=30, unique=True)),
                ("nombre", models.CharField(max_length=60)),
                ("descripcion", models.TextField(blank=True, default="")),
                ("orden", models.PositiveSmallIntegerField(default=0)),
                ("activo", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "tecnología",
                "verbose_name_plural": "tecnologías",
                "ordering": ["orden", "nombre"],
            },
        ),
    ]

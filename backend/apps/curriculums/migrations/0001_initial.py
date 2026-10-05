"""Currículums analizados contra los filtros de un ATS.

No hay `FileField`: el archivo se parsea en memoria y no se guarda. Se conserva
solo el texto extraído, su huella y el resultado del análisis. Ver el docstring
de `apps/curriculums/models.py` para las tres razones.
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("catalogos", "0003_puesto_tecnologia"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Curriculum",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("nombre_archivo", models.CharField(max_length=255)),
                ("formato", models.CharField(max_length=10)),
                ("paginas", models.PositiveSmallIntegerField()),
                ("texto", models.TextField()),
                ("hash_texto", models.CharField(db_index=True, max_length=64)),
                ("fecha", models.DateTimeField(auto_now_add=True)),
                (
                    "puesto",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="curriculums",
                        to="catalogos.puesto",
                    ),
                ),
                (
                    "usuario",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="curriculums",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-fecha"]},
        ),
        migrations.CreateModel(
            name="AnalisisATS",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("campos", models.JSONField()),
                ("hallazgos", models.JSONField()),
                ("campos_detectados", models.PositiveSmallIntegerField()),
                ("campos_intentados", models.PositiveSmallIntegerField()),
                ("fecha", models.DateTimeField(auto_now_add=True)),
                (
                    "curriculum",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="analisis",
                        to="curriculums.curriculum",
                    ),
                ),
            ],
            options={
                "verbose_name": "análisis ATS",
                "verbose_name_plural": "análisis ATS",
            },
        ),
        migrations.AddIndex(
            model_name="curriculum",
            index=models.Index(
                fields=["usuario", "fecha"], name="curriculums_usuario_610894_idx"
            ),
        ),
        migrations.AddConstraint(
            model_name="curriculum",
            constraint=models.UniqueConstraint(
                fields=("usuario", "puesto", "hash_texto"),
                name="curriculum_unico_por_usuario_puesto_y_texto",
            ),
        ),
    ]

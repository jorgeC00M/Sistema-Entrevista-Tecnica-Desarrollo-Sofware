"""Añade las sugerencias de IA a cada análisis.

Columna JSON nulable: NULL es lo que tienen todos los análisis existentes, y se
completa la próxima vez que el usuario vuelva a subir ese CV. No hay backfill: no
se va a llamar a un proveedor externo desde una migración.

Reversible y sin pérdida del diagnóstico: revertirla solo quita las sugerencias.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("curriculums", "0006_analisisats_version_reglas"),
    ]

    operations = [
        migrations.AddField(
            model_name="analisisats",
            name="revision_ia",
            field=models.JSONField(blank=True, null=True),
        ),
    ]

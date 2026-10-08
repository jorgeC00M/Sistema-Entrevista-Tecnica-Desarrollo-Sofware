"""Añade a cada análisis la versión de las reglas con que se hizo.

Sin ella, el caché devolvía un análisis guardado aunque las reglas hubieran
cambiado, y el usuario seguía viendo un diagnóstico que ya no es el vigente.

El valor por defecto es 1 porque es lo que son todos los análisis existentes: se
recalculan la próxima vez que el usuario vuelva a subir ese CV. No hay backfill
que hacer.

Reversible y sin pérdida: un `ADD COLUMN` con default, sin clave foránea ni
borrado de filas, así que no repite los problemas de orden de la `0002`.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("curriculums", "0005_quitar_indice_redundante_de_hash_texto"),
    ]

    operations = [
        migrations.AddField(
            model_name="analisisats",
            name="version_reglas",
            field=models.PositiveSmallIntegerField(default=1),
        ),
    ]

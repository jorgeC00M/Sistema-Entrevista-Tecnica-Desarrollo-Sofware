"""La restricción de unicidad nueva, en su propia migración.

Va aparte de la `0002` por una limitación de Postgres: no admite un `ALTER TABLE`
sobre una tabla que tiene eventos de trigger pendientes, y el `DELETE` de
deduplicación de la `0002` los deja. Como una migración es la unidad de
atomicidad, la única forma de que la limpieza quede confirmada antes de crear el
índice es que sean dos migraciones.

Separar el dato del esquema es además la práctica recomendada, precisamente por
este tipo de interacción.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("curriculums", "0002_convocatoria_en_lugar_de_puesto"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="curriculum",
            constraint=models.UniqueConstraint(
                fields=("usuario", "hash_texto", "hash_convocatoria"),
                name="curriculum_unico_por_usuario_texto_y_convocatoria",
            ),
        ),
    ]

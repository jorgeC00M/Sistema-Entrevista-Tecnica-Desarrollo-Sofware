"""Quita el índice de columna única de `hash_texto`.

Es redundante desde que la restricción de unicidad pasó a ser
`(usuario, hash_texto, hash_convocatoria)`: la única consulta que busca por el
hash del texto filtra por las tres columnas a la vez, y el índice compuesto de esa
restricción la sirve por prefijo. Uno de columna única nunca se elegiría para esa
consulta, así que solo costaba mantenerlo en cada escritura.

Reversible y sin pérdida de datos: revertirla recrea el índice.

A diferencia de la `0002`, aquí no hay riesgo de chocar con eventos de trigger
pendientes: es un `DROP INDEX` y no se elimina ninguna clave foránea ni se borran
filas en la misma transacción.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("curriculums", "0004_rellenar_hash_de_convocatoria_vacia"),
    ]

    operations = [
        migrations.AlterField(
            model_name="curriculum",
            name="hash_texto",
            field=models.CharField(max_length=64),
        ),
    ]

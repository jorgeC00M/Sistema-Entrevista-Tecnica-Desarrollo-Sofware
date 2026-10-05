"""Rellena `hash_convocatoria` en las filas que venían de antes del campo.

La `0002` creó la columna con `default=""`, así que las filas existentes quedaron
con la cadena vacía en lugar del **hash** de la cadena vacía. Eso rompe el caché
de forma silenciosa: al resubir ese mismo CV sin convocatoria, el servicio calcula
`hash_de_texto("")` —un sha256— no encuentra coincidencia, y crea una fila nueva.
La restricción de unicidad no lo impide, porque para ella son valores distintos.

Es un no-op en una base nueva: sin filas previas no hay nada que rellenar. Va en
una migración aparte y no editando la `0002` porque esta ya se aplicó, y una
migración describe el estado de la base en un momento dado.
"""

import hashlib

from django.db import migrations

#: El mismo valor que produce `models.hash_de_texto("")`. Se calcula aquí en lugar
#: de importar la función del modelo: una migración no debe depender del código de
#: la aplicación, que cambia, sino del estado que le toca dejar.
HASH_DE_VACIO = hashlib.sha256(b"").hexdigest()


def rellenar(apps, schema_editor):
    apps.get_model("curriculums", "Curriculum").objects.filter(
        hash_convocatoria=""
    ).update(hash_convocatoria=HASH_DE_VACIO)


def vaciar(apps, schema_editor):
    """El reverso devuelve la cadena vacía, que es lo que la `0002` dejaba."""
    apps.get_model("curriculums", "Curriculum").objects.filter(
        hash_convocatoria=HASH_DE_VACIO, convocatoria=""
    ).update(hash_convocatoria="")


class Migration(migrations.Migration):
    dependencies = [
        ("curriculums", "0003_unicidad_por_texto_y_convocatoria"),
    ]

    operations = [migrations.RunPython(rellenar, vaciar)]

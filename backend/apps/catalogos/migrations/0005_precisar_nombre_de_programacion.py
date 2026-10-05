"""Alinea el nombre visible de `programacion` con su etiqueta en la capa de IA.

La base decía "Programación" y el enum, "Fundamentos de Programación": el
usuario leía una cosa en la tarjeta del puesto y al modelo se le declaraba otra
en el prompt. Son el mismo tema, así que debe llamarse igual en los dos lados.

Va en una migración nueva y no editando la `0002`, siguiendo lo que esa misma
migración documenta: describe el estado de la base en un momento dado y debe
seguir aplicándose igual aunque el código cambie después.
"""

from django.db import migrations

CODIGO = "programacion"
NOMBRE_NUEVO = "Fundamentos de Programación"
NOMBRE_ANTERIOR = "Programación"


def precisar(apps, schema_editor):
    apps.get_model("catalogos", "Area").objects.filter(codigo=CODIGO).update(nombre=NOMBRE_NUEVO)


def revertir(apps, schema_editor):
    apps.get_model("catalogos", "Area").objects.filter(codigo=CODIGO).update(
        nombre=NOMBRE_ANTERIOR
    )


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0004_datos_puestos_y_areas_nuevas")]

    operations = [migrations.RunPython(precisar, revertir)]

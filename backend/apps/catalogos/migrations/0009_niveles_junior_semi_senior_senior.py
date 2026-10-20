"""Niveles Junior (inicial), Semi-Senior (intermedio) y Senior (avanzado).

Se renombran en la misma fila, como en `0007`, para que las entrevistas
conserven su nivel sin tocar su tabla: practicante → junior y
junior → semi_senior (en ese orden inverso, para no chocar con la unicidad de
`codigo`). Senior es nuevo.

Senior amplía el alcance del perfil de grado aprobado, que preveía "básico e
intermedio" y excluía el nivel avanzado: el documento debe recogerlo.
"""

from django.db import migrations

# (código nuevo, código anterior o None si es nuevo, nombre, descripción, orden)
NIVELES = [
    ("semi_senior", "junior", "Semi-Senior", "Intermedio", 2),
    ("junior", "practicante", "Junior", "Inicial", 1),
    ("senior", None, "Senior", "Avanzado", 3),
]
# Cómo estaban en 0007, para revertir.
ANTERIORES = {
    "practicante": ("Practicante", "Sin experiencia", 1),
    "junior": ("Junior", "Menos de 2 años", 2),
}


def aplicar(apps, schema_editor):
    Nivel = apps.get_model("catalogos", "Nivel")
    for nuevo, anterior, nombre, descripcion, orden in NIVELES:
        if anterior is None:
            Nivel.objects.update_or_create(
                codigo=nuevo, defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden, "activo": True}
            )
        else:
            Nivel.objects.filter(codigo=anterior).update(
                codigo=nuevo, nombre=nombre, descripcion=descripcion, orden=orden
            )


def revertir(apps, schema_editor):
    Nivel = apps.get_model("catalogos", "Nivel")
    # Un Senior con entrevistas no se puede borrar (PROTECT): revertir falla, y
    # es lo correcto antes que perder esas entrevistas.
    Nivel.objects.filter(codigo="senior").delete()
    Nivel.objects.filter(codigo="junior").update(
        codigo="practicante", nombre=ANTERIORES["practicante"][0], descripcion=ANTERIORES["practicante"][1], orden=1
    )
    Nivel.objects.filter(codigo="semi_senior").update(
        codigo="junior", nombre=ANTERIORES["junior"][0], descripcion=ANTERIORES["junior"][1], orden=2
    )


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0008_tecnologia_activa_con_puesto")]

    operations = [migrations.RunPython(aplicar, revertir)]

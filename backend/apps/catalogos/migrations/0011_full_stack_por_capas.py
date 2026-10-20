"""Full Stack por capas: una tecnología de frontend y una de backend.

Las cuatro combinaciones fijas ("React + Node.js", …) se **desactivan**, no se
borran: hay entrevistas que las usaron y la FK es PROTECT. Las siete nuevas
llevan `capa`.

Los valores van literales y no importados de `apps/catalogos/datos.py` (ver
`0007`); `test_cargar_catalogos_coincide_con_la_migracion` comprueba que tras
migrar `cargar_catalogos` no cambia nada.
"""

from django.db import migrations

# (codigo, nombre, capa, orden)
NUEVAS = [
    ("full_stack_react", "React", "frontend", 1),
    ("full_stack_angular", "Angular", "frontend", 2),
    ("full_stack_vue", "Vue", "frontend", 3),
    ("full_stack_node", "Node.js", "backend", 4),
    ("full_stack_python", "Python", "backend", 5),
    ("full_stack_java", "Java", "backend", 6),
    ("full_stack_php", "PHP", "backend", 7),
]

COMBINACIONES = [
    "full_stack_react_node",
    "full_stack_react_python",
    "full_stack_angular_java",
    "full_stack_vue_php",
]


def aplicar(apps, schema_editor):
    Puesto = apps.get_model("catalogos", "Puesto")
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    full_stack = Puesto.objects.get(codigo="full_stack")
    Tecnologia.objects.filter(codigo__in=COMBINACIONES).update(activo=False)
    for codigo, nombre, capa, orden in NUEVAS:
        Tecnologia.objects.update_or_create(
            codigo=codigo,
            defaults={"puesto": full_stack, "nombre": nombre, "capa": capa, "orden": orden, "activo": True},
        )


def revertir(apps, schema_editor):
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    # Si alguna entrevista ya usa una tecnología nueva, PROTECT impide borrarla
    # y la reversión falla: es lo correcto, no hay a qué devolverla.
    Tecnologia.objects.filter(codigo__in=[codigo for codigo, *_ in NUEVAS]).delete()
    Tecnologia.objects.filter(codigo__in=COMBINACIONES).update(activo=True)


class Migration(migrations.Migration):
    dependencies = [
        ("catalogos", "0010_capa_y_sin_palabras_clave"),
    ]

    operations = [migrations.RunPython(aplicar, revertir)]

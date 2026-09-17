"""Siembra las áreas y niveles del alcance del perfil de grado.

Los códigos se escriben literales y no se importan de `integrations.ia`: una
migración describe el estado de la base en un momento dado y debe seguir
aplicándose igual aunque el código cambie después. Si se agrega un área nueva,
va en una migración nueva, no editando esta.

Las áreas son las cuatro de la sección 1.5 del perfil; los niveles, los dos
únicos del alcance — "No se incluirán entrevistas de nivel avanzado".
"""

from django.db import migrations

AREAS = [
    ("programacion", "Programación", "Lógica, algoritmos y dominio del lenguaje.", 1),
    ("bases_de_datos", "Bases de Datos", "Modelado relacional, SQL y normalización.", 2),
    ("estructuras_de_datos", "Estructuras de Datos", "Estructuras, complejidad y su elección.", 3),
    ("desarrollo_web", "Desarrollo Web", "Cliente-servidor, HTTP, APIs y frontend.", 4),
]

NIVELES = [
    ("basico", "Básico", "Fundamentos que se esperan de todo egresado.", 1),
    ("intermedio", "Intermedio", "Aplicación práctica y criterio de diseño.", 2),
]


def sembrar(apps, schema_editor):
    Area = apps.get_model("catalogos", "Area")
    Nivel = apps.get_model("catalogos", "Nivel")

    for codigo, nombre, descripcion, orden in AREAS:
        Area.objects.update_or_create(
            codigo=codigo,
            defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden},
        )

    for codigo, nombre, descripcion, orden in NIVELES:
        Nivel.objects.update_or_create(
            codigo=codigo,
            defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden},
        )


def borrar(apps, schema_editor):
    apps.get_model("catalogos", "Area").objects.filter(
        codigo__in=[c for c, *_ in AREAS]
    ).delete()
    apps.get_model("catalogos", "Nivel").objects.filter(
        codigo__in=[c for c, *_ in NIVELES]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0001_initial")]

    operations = [migrations.RunPython(sembrar, borrar)]

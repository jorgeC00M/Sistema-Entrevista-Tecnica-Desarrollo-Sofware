"""Siembra puestos y tecnologías, y amplía las áreas de 4 a 8.

El alcance del perfil de grado enumera las áreas como "tales como programación,
bases de datos, estructuras de datos y desarrollo web" — una lista
ejemplificativa, no cerrada. Las cuatro nuevas (POO, APIs, control de versiones
y pruebas) son los temas que la literatura y las guías de entrevistas técnicas
reportan como más frecuentes para un perfil junior y que faltaban.

Los cuatro códigos originales se conservan tal cual para no migrar las claves
foráneas del historial; a `desarrollo_web` solo se le precisa el nombre
visible, ahora que "Desarrollo Web" como rol pasó a ser un puesto.

Como en `0002`, los códigos van literales y no importados de
`integrations.ia`: una migración describe el estado de la base en un momento y
debe seguir aplicándose igual aunque el código cambie después.
"""

from django.db import migrations

PUESTOS = [
    (
        "backend",
        "Desarrollador Backend",
        "Lógica de servidor, datos y servicios: bases de datos, APIs y fundamentos.",
        1,
    ),
    (
        "frontend",
        "Desarrollador Frontend",
        "Interfaz y cliente: desarrollo web, orientación a objetos y versionado.",
        2,
    ),
    (
        "full_stack",
        "Desarrollador Full-stack",
        "Ambos extremos: datos, APIs, interfaz y pruebas.",
        3,
    ),
]

TECNOLOGIAS = [
    ("python_django", "Python / Django", "Backend en Python con Django.", 1),
    ("javascript_react", "JavaScript / React", "Frontend en JavaScript con React.", 2),
    ("java_spring", "Java / Spring", "Backend en Java con Spring.", 3),
]

AREAS_NUEVAS = [
    ("poo", "Programación Orientada a Objetos", "Clases, herencia, polimorfismo y diseño.", 5),
    ("apis", "APIs y Servicios Web", "REST, HTTP, contratos y consumo de servicios.", 6),
    ("control_versiones", "Control de Versiones", "Git: ramas, fusiones y trabajo en equipo.", 7),
    ("pruebas", "Pruebas de Software", "Pruebas unitarias, casos borde y automatización.", 8),
]

# `desarrollo_web` conserva su código; solo se precisa qué significa ahora.
AREA_RENOMBRADA = (
    "desarrollo_web",
    "Desarrollo Web Frontend",
    "Cliente, HTML/CSS, estado de la interfaz y consumo de APIs.",
)
AREA_RENOMBRADA_ANTES = ("desarrollo_web", "Desarrollo Web", "Cliente-servidor, HTTP, APIs y frontend.")


def sembrar(apps, schema_editor):
    Puesto = apps.get_model("catalogos", "Puesto")
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    Area = apps.get_model("catalogos", "Area")

    for codigo, nombre, descripcion, orden in PUESTOS:
        Puesto.objects.update_or_create(
            codigo=codigo,
            defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden},
        )

    for codigo, nombre, descripcion, orden in TECNOLOGIAS:
        Tecnologia.objects.update_or_create(
            codigo=codigo,
            defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden},
        )

    for codigo, nombre, descripcion, orden in AREAS_NUEVAS:
        Area.objects.update_or_create(
            codigo=codigo,
            defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden},
        )

    codigo, nombre, descripcion = AREA_RENOMBRADA
    Area.objects.filter(codigo=codigo).update(nombre=nombre, descripcion=descripcion)


def borrar(apps, schema_editor):
    apps.get_model("catalogos", "Puesto").objects.filter(
        codigo__in=[c for c, *_ in PUESTOS]
    ).delete()
    apps.get_model("catalogos", "Tecnologia").objects.filter(
        codigo__in=[c for c, *_ in TECNOLOGIAS]
    ).delete()

    # Si un intercambio ya apunta a una de estas áreas, el PROTECT de la clave
    # foránea aborta el borrado: revertir no puede dejar huérfano el historial.
    Area = apps.get_model("catalogos", "Area")
    Area.objects.filter(codigo__in=[c for c, *_ in AREAS_NUEVAS]).delete()

    codigo, nombre, descripcion = AREA_RENOMBRADA_ANTES
    Area.objects.filter(codigo=codigo).update(nombre=nombre, descripcion=descripcion)


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0003_puesto_tecnologia")]

    operations = [migrations.RunPython(sembrar, borrar)]

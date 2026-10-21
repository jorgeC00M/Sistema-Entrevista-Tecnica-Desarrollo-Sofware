"""El puesto Desarrollador de Videojuegos, su área y sus 17 tecnologías.

Los valores van literales y no importados de `apps/catalogos/datos.py` (ver
`0007`); `test_cargar_catalogos_coincide_con_la_migracion` comprueba que tras
migrar `cargar_catalogos` no cambia nada. El área no está en `datos.py`: como
las demás, solo la crea una migración.
"""

from django.db import migrations

AREA = (
    "desarrollo_videojuegos",
    "Desarrollo de Videojuegos",
    "Bucle de juego, motores, física, rendimiento y escenas.",
    11,
)

PUESTO = (
    "videojuegos",
    "Desarrollador de Videojuegos",
    "Crea juegos para PC, consola, móvil o web.",
    "mando",
    7,
)

# (codigo, nombre, grupo, orden)
TECNOLOGIAS = [
    ("videojuegos_unity", "Unity (C#)", "Motores", 1),
    ("videojuegos_unreal_cpp", "Unreal Engine (C++)", "Motores", 2),
    ("videojuegos_unreal_blueprints", "Unreal Engine (Blueprints)", "Motores", 3),
    ("videojuegos_godot", "Godot (GDScript)", "Motores", 4),
    ("videojuegos_godot_csharp", "Godot (C#)", "Motores", 5),
    ("videojuegos_gamemaker", "GameMaker (GML)", "Motores 2D y plataformas", 6),
    ("videojuegos_roblox", "Roblox Studio (Luau)", "Motores 2D y plataformas", 7),
    ("videojuegos_defold", "Defold (Lua)", "Motores 2D y plataformas", 8),
    ("videojuegos_cocos", "Cocos Creator (TypeScript)", "Motores 2D y plataformas", 9),
    ("videojuegos_phaser", "Phaser (JavaScript)", "Web", 10),
    ("videojuegos_threejs", "Three.js", "Web", 11),
    ("videojuegos_babylon", "Babylon.js", "Web", 12),
    ("videojuegos_monogame", "MonoGame (C#)", "Frameworks de código", 13),
    ("videojuegos_pygame", "Pygame (Python)", "Frameworks de código", 14),
    ("videojuegos_love", "LÖVE (Lua)", "Frameworks de código", 15),
    ("videojuegos_bevy", "Bevy (Rust)", "Frameworks de código", 16),
    ("videojuegos_sdl_sfml", "SDL / SFML (C++)", "Frameworks de código", 17),
]


def aplicar(apps, schema_editor):
    Area = apps.get_model("catalogos", "Area")
    Puesto = apps.get_model("catalogos", "Puesto")
    Tecnologia = apps.get_model("catalogos", "Tecnologia")

    codigo, nombre, descripcion, orden = AREA
    Area.objects.update_or_create(
        codigo=codigo, defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden, "activo": True}
    )

    codigo, nombre, descripcion, icono, orden = PUESTO
    puesto, _ = Puesto.objects.update_or_create(
        codigo=codigo,
        defaults={"nombre": nombre, "descripcion": descripcion, "icono": icono, "orden": orden, "activo": True},
    )
    for codigo, nombre, grupo, orden in TECNOLOGIAS:
        Tecnologia.objects.update_or_create(
            codigo=codigo,
            defaults={"puesto": puesto, "nombre": nombre, "capa": "", "grupo": grupo, "orden": orden, "activo": True},
        )


def revertir(apps, schema_editor):
    # Se borra solo lo creado aquí. Si alguna entrevista ya usa el puesto, una
    # tecnología o el área, PROTECT lo impide y la reversión falla, que es lo
    # correcto: en producción se desactiva el puesto en vez de revertir.
    apps.get_model("catalogos", "Tecnologia").objects.filter(codigo__in=[t[0] for t in TECNOLOGIAS]).delete()
    apps.get_model("catalogos", "Puesto").objects.filter(codigo=PUESTO[0]).delete()
    apps.get_model("catalogos", "Area").objects.filter(codigo=AREA[0]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("catalogos", "0013_frameworks"),
    ]

    operations = [migrations.RunPython(aplicar, revertir)]

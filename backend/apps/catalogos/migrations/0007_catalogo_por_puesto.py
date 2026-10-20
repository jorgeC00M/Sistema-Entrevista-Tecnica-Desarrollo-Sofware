"""Catálogo por puesto: 6 puestos con sus tecnologías, niveles practicante/junior.

- Puestos: se actualizan los tres existentes (mismo código, así el historial
  no se toca) y se crean Móvil, Escritorio y QA.
- Tecnologías: una por puesto. Las tres transversales anteriores
  (python_django, javascript_react, java_spring) se **desactivan**, no se
  borran: hay entrevistas que las usaron y la FK es PROTECT.
- Niveles: se renombran **en la misma fila** (basico → practicante,
  intermedio → junior). Las entrevistas apuntan al id, así que conservan su
  nivel sin tocar su tabla. Equivalen a los niveles del perfil de grado.
- Áreas: se agregan Desarrollo Móvil y Desarrollo de Escritorio.

Los valores van literales y no importados de `apps/catalogos/datos.py`: una
migración describe la base en un momento y no debe cambiar si ese archivo
cambia. Un test comprueba que, tras migrar, `cargar_catalogos` no modifica nada.
"""

from django.db import migrations

# (codigo, nombre, descripcion, icono, palabras_clave, orden)
PUESTOS = [
    ('frontend', 'Desarrollador Frontend', 'Construye lo que el usuario ve y usa en la web.', 'web', ['front', 'end', 'frontend', 'html', 'css', 'javascript', 'typescript', 'ui', 'ux', 'interfaz', 'web', 'componentes'], 1),
    ('backend', 'Desarrollador Backend', 'Programa la lógica, las APIs y los datos de una aplicación.', 'datos', ['back', 'end', 'backend', 'api', 'apis', 'rest', 'servidor', 'django', 'flask', 'express', 'spring', 'laravel', 'csharp', 'base', 'de', 'datos', 'sql', 'postgresql', 'mysql'], 2),
    ('full_stack', 'Desarrollador Full Stack', 'Trabaja en ambos lados de una aplicación web.', 'seleccion', ['fullstack', 'full', 'stack', 'mern', 'web', 'api'], 3),
    ('movil', 'Desarrollador Móvil', 'Crea aplicaciones para Android y iPhone.', 'movil', ['movil', 'mobile', 'android', 'ios', 'iphone', 'dart', 'apps', 'celular', 'aplicaciones', 'moviles'], 4),
    ('escritorio', 'Desarrollador de Escritorio', 'Crea programas que se instalan en la computadora.', 'escritorio', ['escritorio', 'desktop', 'windows', 'wpf', 'winforms', 'maui', 'javafx', 'swing', 'tauri', 'pyqt'], 5),
    ('qa', 'QA Tester / Automatizador', 'Asegura que el software funcione antes de publicarse.', 'pruebas', ['qa', 'tester', 'testing', 'pruebas', 'test', 'calidad', 'automatizacion', 'automation'], 6),
]

# (puesto, codigo, nombre, orden)
TECNOLOGIAS = [
    ('frontend', 'frontend_react', 'React', 1),
    ('frontend', 'frontend_angular', 'Angular', 2),
    ('frontend', 'frontend_vue', 'Vue', 3),
    ('backend', 'backend_python', 'Python', 1),
    ('backend', 'backend_node', 'Node.js', 2),
    ('backend', 'backend_java', 'Java', 3),
    ('backend', 'backend_php', 'PHP', 4),
    ('backend', 'backend_csharp', 'C# .NET', 5),
    ('full_stack', 'full_stack_react_node', 'React + Node.js', 1),
    ('full_stack', 'full_stack_react_python', 'React + Python', 2),
    ('full_stack', 'full_stack_angular_java', 'Angular + Java', 3),
    ('full_stack', 'full_stack_vue_php', 'Vue + PHP', 4),
    ('movil', 'movil_flutter', 'Flutter', 1),
    ('movil', 'movil_react_native', 'React Native', 2),
    ('movil', 'movil_kotlin', 'Kotlin (Android)', 3),
    ('movil', 'movil_swift', 'Swift (iOS)', 4),
    ('escritorio', 'escritorio_csharp', 'C# .NET', 1),
    ('escritorio', 'escritorio_java', 'Java', 2),
    ('escritorio', 'escritorio_electron', 'Electron', 3),
    ('escritorio', 'escritorio_python', 'Python', 4),
    ('qa', 'qa_selenium', 'Selenium', 1),
    ('qa', 'qa_cypress', 'Cypress', 2),
    ('qa', 'qa_playwright', 'Playwright', 3),
]

TECNOLOGIAS_ANTERIORES = ["python_django", "javascript_react", "java_spring"]

# (codigo nuevo, codigo anterior, nombre, descripcion, orden)
NIVELES = [
    ("practicante", "basico", "Practicante", "Sin experiencia", 1),
    ("junior", "intermedio", "Junior", "Menos de 2 años", 2),
]
# Cómo estaban en 0002, para revertir.
NIVELES_ANTERIORES = {
    "basico": ("Básico", "Fundamentos que se esperan de todo egresado."),
    "intermedio": ("Intermedio", "Aplicación práctica y criterio de diseño."),
}

AREAS_NUEVAS = [
    (
        "desarrollo_movil",
        "Desarrollo Móvil",
        "Apps para Android e iOS: ciclo de vida, estado y consumo de APIs.",
        9,
    ),
    (
        "desarrollo_escritorio",
        "Desarrollo de Escritorio",
        "Aplicaciones instalables: interfaz, eventos y distribución.",
        10,
    ),
]

# Cómo estaban los tres puestos originales (0004), para revertir.
PUESTOS_ANTERIORES = {
    "backend": (
        "Desarrollador Backend",
        "Lógica de servidor, datos y servicios: bases de datos, APIs y fundamentos.",
        1,
    ),
    "frontend": (
        "Desarrollador Frontend",
        "Interfaz y cliente: desarrollo web, orientación a objetos y versionado.",
        2,
    ),
    "full_stack": ("Desarrollador Full-stack", "Ambos extremos: datos, APIs, interfaz y pruebas.", 3),
}


def aplicar(apps, schema_editor):
    Puesto = apps.get_model("catalogos", "Puesto")
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    Nivel = apps.get_model("catalogos", "Nivel")
    Area = apps.get_model("catalogos", "Area")

    por_codigo = {}
    for codigo, nombre, descripcion, icono, palabras, orden in PUESTOS:
        puesto, _ = Puesto.objects.update_or_create(
            codigo=codigo,
            defaults={
                "nombre": nombre,
                "descripcion": descripcion,
                "icono": icono,
                "palabras_clave": palabras,
                "orden": orden,
                "activo": True,
            },
        )
        por_codigo[codigo] = puesto

    Tecnologia.objects.filter(codigo__in=TECNOLOGIAS_ANTERIORES).update(activo=False, puesto=None)
    for puesto, codigo, nombre, orden in TECNOLOGIAS:
        Tecnologia.objects.update_or_create(
            codigo=codigo,
            defaults={"puesto": por_codigo[puesto], "nombre": nombre, "orden": orden, "activo": True},
        )

    for nuevo, anterior, nombre, descripcion, orden in NIVELES:
        Nivel.objects.filter(codigo=anterior).update(
            codigo=nuevo, nombre=nombre, descripcion=descripcion, orden=orden
        )

    for codigo, nombre, descripcion, orden in AREAS_NUEVAS:
        Area.objects.update_or_create(
            codigo=codigo, defaults={"nombre": nombre, "descripcion": descripcion, "orden": orden}
        )


def revertir(apps, schema_editor):
    Puesto = apps.get_model("catalogos", "Puesto")
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    Nivel = apps.get_model("catalogos", "Nivel")
    Area = apps.get_model("catalogos", "Area")

    Area.objects.filter(codigo__in=[a[0] for a in AREAS_NUEVAS]).delete()
    for nuevo, anterior, *_ in NIVELES:
        nombre, descripcion = NIVELES_ANTERIORES[anterior]
        Nivel.objects.filter(codigo=nuevo).update(codigo=anterior, nombre=nombre, descripcion=descripcion)

    Tecnologia.objects.filter(codigo__in=[t[1] for t in TECNOLOGIAS]).delete()
    Tecnologia.objects.filter(codigo__in=TECNOLOGIAS_ANTERIORES).update(activo=True)

    nuevos = [p[0] for p in PUESTOS if p[0] not in PUESTOS_ANTERIORES]
    Puesto.objects.filter(codigo__in=nuevos).delete()
    for codigo, (nombre, descripcion, orden) in PUESTOS_ANTERIORES.items():
        Puesto.objects.filter(codigo=codigo).update(
            nombre=nombre, descripcion=descripcion, orden=orden, icono="", palabras_clave=[]
        )


class Migration(migrations.Migration):
    dependencies = [("catalogos", "0006_puesto_icono_palabras_y_tecnologia_puesto")]

    operations = [migrations.RunPython(aplicar, revertir)]

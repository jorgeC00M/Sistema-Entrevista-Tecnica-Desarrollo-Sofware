"""Frameworks por puesto, agrupados por lenguaje (o por tipo de prueba en QA).

- **Dividir desactiva:** una tecnología que pasa a ser varios frameworks
  ("Python" de Backend → Django, FastAPI, Flask) se desactiva, no se borra: hay
  entrevistas que pueden usarla y la FK es PROTECT.
- **Precisar renombra:** la que solo gana un nombre más preciso ("Kotlin
  (Android)" → "Kotlin (Jetpack Compose)") se renombra en la misma fila.

Los valores van literales y no importados de `apps/catalogos/datos.py` (ver
`0007`); `test_cargar_catalogos_coincide_con_la_migracion` comprueba que tras
migrar `cargar_catalogos` no cambia nada.
"""

from django.db import migrations

# (puesto, codigo, nombre, capa, grupo, orden): las 53 activas.
TECNOLOGIAS = [
    ('frontend', 'frontend_react', 'React', '', '', 1),
    ('frontend', 'frontend_next', 'Next.js', '', '', 2),
    ('frontend', 'frontend_angular', 'Angular', '', '', 3),
    ('frontend', 'frontend_vue', 'Vue', '', '', 4),
    ('frontend', 'frontend_nuxt', 'Nuxt', '', '', 5),
    ('frontend', 'frontend_svelte', 'Svelte', '', '', 6),
    ('frontend', 'frontend_astro', 'Astro', '', '', 7),
    ('backend', 'backend_django', 'Django', '', 'Python', 1),
    ('backend', 'backend_fastapi', 'FastAPI', '', 'Python', 2),
    ('backend', 'backend_flask', 'Flask', '', 'Python', 3),
    ('backend', 'backend_express', 'Express', '', 'Node.js', 4),
    ('backend', 'backend_nestjs', 'NestJS', '', 'Node.js', 5),
    ('backend', 'backend_spring', 'Spring Boot', '', 'Java', 6),
    ('backend', 'backend_laravel', 'Laravel', '', 'PHP', 7),
    ('backend', 'backend_aspnet_core', 'ASP.NET Core', '', 'C#', 8),
    ('backend', 'backend_go', 'Go', '', 'Go', 9),
    ('backend', 'backend_rails', 'Ruby on Rails', '', 'Ruby', 10),
    ('full_stack', 'full_stack_react', 'React', 'frontend', '', 1),
    ('full_stack', 'full_stack_next', 'Next.js', 'frontend', '', 2),
    ('full_stack', 'full_stack_angular', 'Angular', 'frontend', '', 3),
    ('full_stack', 'full_stack_vue', 'Vue', 'frontend', '', 4),
    ('full_stack', 'full_stack_nuxt', 'Nuxt', 'frontend', '', 5),
    ('full_stack', 'full_stack_svelte', 'Svelte', 'frontend', '', 6),
    ('full_stack', 'full_stack_django', 'Django', 'backend', 'Python', 7),
    ('full_stack', 'full_stack_fastapi', 'FastAPI', 'backend', 'Python', 8),
    ('full_stack', 'full_stack_express', 'Express', 'backend', 'Node.js', 9),
    ('full_stack', 'full_stack_nestjs', 'NestJS', 'backend', 'Node.js', 10),
    ('full_stack', 'full_stack_spring', 'Spring Boot', 'backend', 'Java', 11),
    ('full_stack', 'full_stack_laravel', 'Laravel', 'backend', 'PHP', 12),
    ('full_stack', 'full_stack_aspnet_core', 'ASP.NET Core', 'backend', 'C#', 13),
    ('movil', 'movil_flutter', 'Flutter', '', '', 1),
    ('movil', 'movil_react_native', 'React Native', '', '', 2),
    ('movil', 'movil_kotlin', 'Kotlin (Jetpack Compose)', '', '', 3),
    ('movil', 'movil_swift', 'Swift (SwiftUI)', '', '', 4),
    ('movil', 'movil_maui', '.NET MAUI', '', '', 5),
    ('movil', 'movil_ionic', 'Ionic', '', '', 6),
    ('escritorio', 'escritorio_csharp', 'C# (WPF / WinForms)', '', '', 1),
    ('escritorio', 'escritorio_maui', '.NET MAUI', '', '', 2),
    ('escritorio', 'escritorio_java', 'Java (JavaFX)', '', '', 3),
    ('escritorio', 'escritorio_electron', 'Electron', '', '', 4),
    ('escritorio', 'escritorio_tauri', 'Tauri', '', '', 5),
    ('escritorio', 'escritorio_python', 'Python (PyQt)', '', '', 6),
    ('escritorio', 'escritorio_qt', 'C++ (Qt)', '', '', 7),
    ('qa', 'qa_selenium', 'Selenium', '', 'Interfaz web', 1),
    ('qa', 'qa_cypress', 'Cypress', '', 'Interfaz web', 2),
    ('qa', 'qa_playwright', 'Playwright', '', 'Interfaz web', 3),
    ('qa', 'qa_appium', 'Appium', '', 'Móvil', 4),
    ('qa', 'qa_postman', 'Postman', '', 'APIs', 5),
    ('qa', 'qa_rest_assured', 'REST Assured', '', 'APIs', 6),
    ('qa', 'qa_jmeter', 'JMeter', '', 'Rendimiento', 7),
    ('qa', 'qa_k6', 'k6', '', 'Rendimiento', 8),
    ('qa', 'qa_pytest', 'Pytest', '', 'Unitarias', 9),
    ('qa', 'qa_junit', 'JUnit', '', 'Unitarias', 10),
]

# Las que se dividen en frameworks: se desactivan.
RETIRADAS = [
    'backend_csharp',
    'backend_java',
    'backend_node',
    'backend_php',
    'backend_python',
    'full_stack_java',
    'full_stack_node',
    'full_stack_php',
    'full_stack_python',
]

# Cómo estaban en 0011 las que siguen activas (nombre, orden), para revertir.
ANTERIORES = {
    'escritorio_csharp': ('C# .NET', 1),
    'escritorio_electron': ('Electron', 3),
    'escritorio_java': ('Java', 2),
    'escritorio_python': ('Python', 4),
    'frontend_angular': ('Angular', 2),
    'frontend_react': ('React', 1),
    'frontend_vue': ('Vue', 3),
    'full_stack_angular': ('Angular', 2),
    'full_stack_react': ('React', 1),
    'full_stack_vue': ('Vue', 3),
    'movil_flutter': ('Flutter', 1),
    'movil_kotlin': ('Kotlin (Android)', 3),
    'movil_react_native': ('React Native', 2),
    'movil_swift': ('Swift (iOS)', 4),
    'qa_cypress': ('Cypress', 2),
    'qa_playwright': ('Playwright', 3),
    'qa_selenium': ('Selenium', 1),
}



def aplicar(apps, schema_editor):
    Puesto = apps.get_model("catalogos", "Puesto")
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    puestos = {p.codigo: p for p in Puesto.objects.all()}
    Tecnologia.objects.filter(codigo__in=RETIRADAS).update(activo=False)
    for puesto, codigo, nombre, capa, grupo, orden in TECNOLOGIAS:
        Tecnologia.objects.update_or_create(
            codigo=codigo,
            defaults={
                "puesto": puestos[puesto],
                "nombre": nombre,
                "capa": capa,
                "grupo": grupo,
                "orden": orden,
                "activo": True,
            },
        )


def revertir(apps, schema_editor):
    Tecnologia = apps.get_model("catalogos", "Tecnologia")
    # Las creadas aquí se borran: si alguna entrevista ya usa una, PROTECT lo
    # impide y la reversión falla, que es lo correcto.
    creadas = [codigo for _, codigo, *_ in TECNOLOGIAS if codigo not in ANTERIORES]
    Tecnologia.objects.filter(codigo__in=creadas).delete()
    for codigo, (nombre, orden) in ANTERIORES.items():
        Tecnologia.objects.filter(codigo=codigo).update(nombre=nombre, orden=orden, grupo="")
    Tecnologia.objects.filter(codigo__in=RETIRADAS).update(activo=True)


class Migration(migrations.Migration):
    dependencies = [
        ("catalogos", "0012_tecnologia_grupo"),
    ]

    operations = [migrations.RunPython(aplicar, revertir)]

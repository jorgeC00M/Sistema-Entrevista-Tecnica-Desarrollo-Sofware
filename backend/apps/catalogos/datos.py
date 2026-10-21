"""Catálogo de puestos, tecnologías y niveles: la fuente de datos única.

Lo leen dos caminos:

- el comando `cargar_catalogos`, que re-sincroniza la base con este archivo
  (`update_or_create` por código, sin borrar nada) para corregir un texto o
  sumar una tecnología sin escribir una migración;
- la migración `0007`, que copia estos mismos valores en su cuerpo —una
  migración describe la base en un momento y no debe depender de código que
  evoluciona—. Un test verifica que, tras migrar, el comando no cambia nada:
  si los dos divergen, se nota.

Los nombres y descripciones vienen del prototype `nueva-entrevista.html`.
`icono` es un nombre de `components/ui/trazosDeIconos.ts`.

Se ofrecen **frameworks**, que es lo que piden las ofertas ("Django", no
"Python"); `grupo` los agrupa en pantalla por lenguaje, por tipo de prueba en
QA o por tipo de motor en Videojuegos. En Full Stack las tecnologías tienen
además `capa`: el candidato elige una de frontend y una de backend. Las cuatro combinaciones fijas anteriores ("React + Node.js",
…) ya no figuran aquí; la migración `0011` las dejó inactivas porque hay
entrevistas que las usaron, y `cargar_catalogos` nunca borra.

Una tecnología pertenece a un solo puesto. Cuando el mismo nombre sirve a dos
puestos (C# .NET en Backend y en Escritorio) son dos filas con códigos
distintos: el puesto cambia lo que se pregunta sobre ella.

Los códigos de puesto y de nivel coinciden con los enums `Puesto` y `Nivel` de
`integrations.ia`; los tests de sincronía lo vigilan.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class DatosTecnologia:
    codigo: str
    nombre: str
    capa: str = ""
    grupo: str = ""


@dataclass(frozen=True)
class DatosPuesto:
    codigo: str
    nombre: str
    descripcion: str
    icono: str
    tecnologias: tuple[DatosTecnologia, ...]


def _tec(
    prefijo: str, *pares: tuple[str, str], capa: str = "", grupo: str = ""
) -> tuple[DatosTecnologia, ...]:
    return tuple(DatosTecnologia(f"{prefijo}_{slug}", nombre, capa, grupo) for slug, nombre in pares)


def _frontend(prefijo: str, *, capa: str = "") -> tuple[DatosTecnologia, ...]:
    """Los frameworks de frontend: los mismos en Frontend y en la capa de Full Stack."""
    return _tec(
        prefijo,
        ("react", "React"),
        ("next", "Next.js"),
        ("angular", "Angular"),
        ("vue", "Vue"),
        ("nuxt", "Nuxt"),
        ("svelte", "Svelte"),
        capa=capa,
    )


def _backend(prefijo: str, *, capa: str = "", completo: bool = True) -> tuple[DatosTecnologia, ...]:
    """Los frameworks de backend, agrupados por lenguaje. Full Stack ofrece los
    más comunes en esa combinación (`completo=False`: sin Flask, Go ni Rails)."""
    return (
        *_tec(prefijo, ("django", "Django"), ("fastapi", "FastAPI"), capa=capa, grupo="Python"),
        *(_tec(prefijo, ("flask", "Flask"), capa=capa, grupo="Python") if completo else ()),
        *_tec(prefijo, ("express", "Express"), ("nestjs", "NestJS"), capa=capa, grupo="Node.js"),
        *_tec(prefijo, ("spring", "Spring Boot"), capa=capa, grupo="Java"),
        *_tec(prefijo, ("laravel", "Laravel"), capa=capa, grupo="PHP"),
        *_tec(prefijo, ("aspnet_core", "ASP.NET Core"), capa=capa, grupo="C#"),
        *(
            (*_tec(prefijo, ("go", "Go"), grupo="Go"), *_tec(prefijo, ("rails", "Ruby on Rails"), grupo="Ruby"))
            if completo
            else ()
        ),
    )


PUESTOS: tuple[DatosPuesto, ...] = (
    DatosPuesto(
        codigo="frontend",
        nombre="Desarrollador Frontend",
        descripcion="Construye lo que el usuario ve y usa en la web.",
        icono="web",
        tecnologias=(*_frontend("frontend"), *_tec("frontend", ("astro", "Astro"))),
    ),
    DatosPuesto(
        codigo="backend",
        nombre="Desarrollador Backend",
        descripcion="Programa la lógica, las APIs y los datos de una aplicación.",
        icono="datos",
        tecnologias=_backend("backend"),
    ),
    DatosPuesto(
        codigo="full_stack",
        nombre="Desarrollador Full Stack",
        descripcion="Trabaja en ambos lados de una aplicación web.",
        icono="seleccion",
        tecnologias=(
            *_frontend("full_stack", capa="frontend"),
            *_backend("full_stack", capa="backend", completo=False),
        ),
    ),
    DatosPuesto(
        codigo="movil",
        nombre="Desarrollador Móvil",
        descripcion="Crea aplicaciones para Android y iPhone.",
        icono="movil",
        tecnologias=_tec(
            "movil",
            ("flutter", "Flutter"),
            ("react_native", "React Native"),
            ("kotlin", "Kotlin (Jetpack Compose)"),
            ("swift", "Swift (SwiftUI)"),
            ("maui", ".NET MAUI"),
            ("ionic", "Ionic"),
        ),
    ),
    DatosPuesto(
        codigo="escritorio",
        nombre="Desarrollador de Escritorio",
        descripcion="Crea programas que se instalan en la computadora.",
        icono="escritorio",
        tecnologias=_tec(
            "escritorio",
            ("csharp", "C# (WPF / WinForms)"),
            ("maui", ".NET MAUI"),
            ("java", "Java (JavaFX)"),
            ("electron", "Electron"),
            ("tauri", "Tauri"),
            ("python", "Python (PyQt)"),
            ("qt", "C++ (Qt)"),
        ),
    ),
    DatosPuesto(
        codigo="qa",
        nombre="QA Tester / Automatizador",
        descripcion="Asegura que el software funcione antes de publicarse.",
        icono="pruebas",
        tecnologias=(
            *_tec(
                "qa",
                ("selenium", "Selenium"),
                ("cypress", "Cypress"),
                ("playwright", "Playwright"),
                grupo="Interfaz web",
            ),
            *_tec("qa", ("appium", "Appium"), grupo="Móvil"),
            *_tec("qa", ("postman", "Postman"), ("rest_assured", "REST Assured"), grupo="APIs"),
            *_tec("qa", ("jmeter", "JMeter"), ("k6", "k6"), grupo="Rendimiento"),
            *_tec("qa", ("pytest", "Pytest"), ("junit", "JUnit"), grupo="Unitarias"),
        ),
    ),
    DatosPuesto(
        codigo="videojuegos",
        nombre="Desarrollador de Videojuegos",
        descripcion="Crea juegos para PC, consola, móvil o web.",
        icono="mando",
        # Agrupadas por tipo, como QA: el lenguaje va en el nombre porque un
        # mismo motor se programa de dos formas (Unreal en C++ o con Blueprints).
        tecnologias=(
            *_tec(
                "videojuegos",
                ("unity", "Unity (C#)"),
                ("unreal_cpp", "Unreal Engine (C++)"),
                ("unreal_blueprints", "Unreal Engine (Blueprints)"),
                ("godot", "Godot (GDScript)"),
                ("godot_csharp", "Godot (C#)"),
                grupo="Motores",
            ),
            *_tec(
                "videojuegos",
                ("gamemaker", "GameMaker (GML)"),
                ("roblox", "Roblox Studio (Luau)"),
                ("defold", "Defold (Lua)"),
                ("cocos", "Cocos Creator (TypeScript)"),
                grupo="Motores 2D y plataformas",
            ),
            *_tec(
                "videojuegos",
                ("phaser", "Phaser (JavaScript)"),
                ("threejs", "Three.js"),
                ("babylon", "Babylon.js"),
                grupo="Web",
            ),
            *_tec(
                "videojuegos",
                ("monogame", "MonoGame (C#)"),
                ("pygame", "Pygame (Python)"),
                ("love", "LÖVE (Lua)"),
                ("bevy", "Bevy (Rust)"),
                ("sdl_sfml", "SDL / SFML (C++)"),
                grupo="Frameworks de código",
            ),
        ),
    ),
)

# (código, nombre, descripción, orden). La descripción es el grado que ve el
# candidato junto al nombre: "Junior · Inicial".
NIVELES: tuple[tuple[str, str, str, int], ...] = (
    ("junior", "Junior", "Inicial", 1),
    ("semi_senior", "Semi-Senior", "Intermedio", 2),
    ("senior", "Senior", "Avanzado", 3),
)

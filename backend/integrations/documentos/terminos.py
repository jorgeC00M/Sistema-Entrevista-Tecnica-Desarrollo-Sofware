"""Términos técnicos que se reconocen en un currículum o en una convocatoria.

Es un diccionario curado, del mismo tipo que `secciones.py`: término canónico →
variantes con las que se escribe en la práctica. Sirve para los dos lados de la
comparación, y por eso vive aparte de quien compara.

**Por qué un diccionario y no un modelo de lenguaje.** Se le podría pedir a la IA
"extrae los requisitos de esta convocatoria", y resolvería los descriptivos que
aquí se pierden ("experiencia con bases de datos relacionales", sin nombrar
ninguna). Se descarta en esta capa por tres razones: no es reproducible, puede
añadir requisitos que el texto no dice, y afirmar "este término aparece
literalmente" es más fuerte que "la IA decidió que esto era un requisito". Las dos
vías son complementarias: el diccionario captura los requisitos duros, que son
justo los que usa la búsqueda booleana de un reclutador.

**Su límite, que conviene tener claro:** solo encuentra lo que está aquí. Una
convocatoria que pida algo ausente de la tabla se pierde, y ampliar la cobertura es
añadir una entrada. Lo que nunca hace es inventar un término que el texto no
contiene, que es el error que sí importaría.

Al final viven otras dos tablas del mismo tipo: `SIGLAS`, los términos que se
buscan de dos formas ("AWS" y "Amazon Web Services"), y `CARGOS`, los puestos
con sus variantes en español e inglés.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

#: Término canónico → variantes con las que aparece escrito.
#:
#: Las variantes se escriben en minúscula y sin acentos: la búsqueda normaliza el
#: texto antes de comparar, así que "Diseño de Patrones" encuentra "patrones".
#:
#: No se incluyen términos de una o dos letras ("c", "r", "go") salvo que tengan
#: una variante inequívoca: el ruido que generan supera lo que aportan.
TERMINOS: dict[str, tuple[str, ...]] = {
    # Lenguajes
    "Python": ("python",),
    "JavaScript": ("javascript", "java script", "ecmascript", "js"),
    "TypeScript": ("typescript", "type script", "ts"),
    "Java": ("java",),
    "C#": ("c#", "csharp", "c sharp"),
    "PHP": ("php",),
    "Kotlin": ("kotlin",),
    "Swift": ("swift",),
    "Dart": ("dart",),
    "C++": ("c++", "cpp"),
    "Rust": ("rust",),
    "Lua": ("lua",),
    "Luau": ("luau",),
    "GDScript": ("gdscript",),
    "SQL": ("sql",),
    # Frameworks de backend
    "Django": ("django",),
    "Django REST Framework": ("django rest framework", "drf"),
    "Flask": ("flask",),
    "FastAPI": ("fastapi", "fast api"),
    "Spring": ("spring", "spring boot", "springboot"),
    "Laravel": ("laravel",),
    "Express": ("express", "expressjs", "express.js"),
    "NestJS": ("nestjs", "nest.js"),
    ".NET": (".net", "dotnet", "asp.net"),
    "Node.js": ("node.js", "nodejs", "node js"),
    # Frameworks de frontend
    "React": ("react", "reactjs", "react.js"),
    "Angular": ("angular", "angularjs"),
    "Vue": ("vue", "vuejs", "vue.js"),
    "Next.js": ("next.js", "nextjs"),
    "Svelte": ("svelte", "sveltekit"),
    "Flutter": ("flutter",),
    "React Native": ("react native",),
    # Videojuegos. Solo variantes inequívocas: LÖVE se busca como "love2d"
    # porque, sin la diéresis, "love" encajaría en cualquier texto en inglés; y
    # "blueprints" no entra, que también es una palabra corriente.
    "Unity": ("unity", "unity3d"),
    "Unreal Engine": ("unreal engine", "unreal", "ue4", "ue5"),
    "Godot": ("godot",),
    "GameMaker": ("gamemaker", "game maker"),
    "Roblox": ("roblox", "roblox studio"),
    "Defold": ("defold",),
    "Cocos Creator": ("cocos creator", "cocos2d", "cocos2d-x"),
    "Phaser": ("phaser", "phaser.js", "phaserjs"),
    "Three.js": ("three.js", "threejs"),
    "Babylon.js": ("babylon.js", "babylonjs"),
    "MonoGame": ("monogame",),
    "Pygame": ("pygame",),
    "LÖVE": ("love2d", "love 2d"),
    "Bevy": ("bevy",),
    "SDL": ("sdl", "sdl2"),
    "SFML": ("sfml",),
    # Interfaz
    "HTML": ("html", "html5"),
    "CSS": ("css", "css3"),
    "Sass": ("sass", "scss"),
    "Tailwind": ("tailwind", "tailwindcss"),
    "Bootstrap": ("bootstrap",),
    # Bases de datos
    "PostgreSQL": ("postgresql", "postgres", "psql"),
    "MySQL": ("mysql",),
    "SQL Server": ("sql server", "sqlserver", "transact-sql", "t-sql"),
    "Oracle": ("oracle",),
    "SQLite": ("sqlite",),
    "MongoDB": ("mongodb", "mongo"),
    "Redis": ("redis",),
    "Firebase": ("firebase", "firestore"),
    # Integración y arquitectura
    "REST": ("rest", "restful", "api rest", "apis rest", "servicios rest"),
    "GraphQL": ("graphql",),
    "gRPC": ("grpc",),
    "Microservicios": ("microservicios", "microservices"),
    "WebSockets": ("websockets", "websocket"),
    "Arquitectura MVC": ("mvc", "modelo vista controlador"),
    # Infraestructura
    "Docker": ("docker", "contenedores", "containers", "containerizacion"),
    "Kubernetes": ("kubernetes", "k8s"),
    "AWS": ("aws", "amazon web services"),
    "Azure": ("azure",),
    "Google Cloud": ("google cloud", "gcp"),
    "Linux": ("linux", "unix"),
    "Nginx": ("nginx",),
    "CI/CD": ("ci/cd", "cicd", "integracion continua", "despliegue continuo"),
    "Terraform": ("terraform",),
    # Control de versiones
    "Git": ("git",),
    "GitHub": ("github",),
    "GitLab": ("gitlab",),
    "Git Flow": ("git flow", "gitflow"),
    # Pruebas
    "Pruebas unitarias": ("pruebas unitarias", "unit testing", "unit tests", "test unitario"),
    "Pytest": ("pytest",),
    "Jest": ("jest",),
    "JUnit": ("junit",),
    "Selenium": ("selenium",),
    "TDD": ("tdd", "desarrollo guiado por pruebas"),
    # Prácticas y fundamentos
    "POO": ("poo", "programacion orientada a objetos", "oop"),
    "Estructuras de datos": ("estructuras de datos", "data structures"),
    "Algoritmos": ("algoritmos", "algorithms"),
    "Patrones de diseño": ("patrones de diseno", "design patterns"),
    "SOLID": ("solid",),
    "Scrum": ("scrum",),
    "Metodologías ágiles": ("metodologias agiles", "agile", "kanban"),
    "Clean Code": ("clean code", "codigo limpio"),
}


def normalizar(texto: str) -> str:
    """Pasa a minúsculas y quita acentos, para que la comparación no dependa de
    cómo se escribió.

    Un CV puede decir "Programación Orientada a Objetos" y una convocatoria
    "programacion orientada a objetos"; son el mismo requisito.
    """
    sin_acentos = unicodedata.normalize("NFD", texto.lower())
    return "".join(c for c in sin_acentos if unicodedata.category(c) != "Mn")


def _patron(variante: str) -> re.Pattern[str]:
    """Compila una variante exigiendo límites de palabra donde tenga sentido.

    `\\b` no funciona junto a caracteres no alfanuméricos: en "c#" el `#` ya es un
    límite, así que `\\bc#\\b` nunca encajaría. Por eso el límite se añade solo en
    el extremo que empieza o acaba en carácter de palabra.

    Esto es lo que evita los falsos positivos que importan: "js" dentro de "jsx",
    "react" dentro de "reactivo", "java" dentro de "javascript".
    """
    izquierda = r"\b" if variante[:1].isalnum() else ""
    derecha = r"\b" if variante[-1:].isalnum() else ""
    return re.compile(f"{izquierda}{re.escape(variante)}{derecha}")


def _compilar(variantes: tuple[str, ...]) -> tuple[re.Pattern[str], ...]:
    return tuple(_patron(variante) for variante in variantes)


#: Patrones precompilados. Se construyen una vez al importar porque `encontrar()`
#: se llama sobre el CV y sobre la convocatoria en cada análisis.
_PATRONES: dict[str, tuple[re.Pattern[str], ...]] = {
    canonico: _compilar(variantes) for canonico, variantes in TERMINOS.items()
}


def encontrar(texto: str) -> set[str]:
    """Devuelve los términos canónicos que el texto menciona.

    Se devuelven los canónicos y no las variantes encontradas: así "postgres" en la
    convocatoria y "PostgreSQL" en el CV son el mismo requisito, que es justamente
    lo que hace útil la comparación.
    """
    if not texto.strip():
        return set()

    normalizado = normalizar(texto)
    return {
        canonico
        for canonico, patrones in _PATRONES.items()
        if any(patron.search(normalizado) for patron in patrones)
    }


# --- Sigla y nombre largo ----------------------------------------------------


@dataclass(frozen=True)
class Sigla:
    """Un término que los reclutadores buscan de dos formas.

    La búsqueda booleana de un ATS (Taleo, iCIMS) es literal: si el reclutador
    escribe "Amazon Web Services" y el CV solo dice "AWS", según el sistema el
    candidato no aparece. Escribir las dos formas una vez cubre ambas búsquedas.
    """

    siglas: tuple[str, ...]
    nombres: tuple[str, ...]
    #: Cómo sugerir escribirlo.
    forma_completa: str


#: Solo los pares en los que las dos formas se buscan de verdad. "REST" o
#: "SQL" no están: nadie busca su nombre largo, y avisar sería ruido.
SIGLAS: dict[str, Sigla] = {
    "AWS": Sigla(("aws",), ("amazon web services",), "Amazon Web Services (AWS)"),
    "Google Cloud": Sigla(("gcp",), ("google cloud",), "Google Cloud Platform (GCP)"),
    "POO": Sigla(
        ("poo", "oop"),
        ("programacion orientada a objetos", "object oriented programming", "object-oriented programming"),
        "Programación Orientada a Objetos (POO)",
    ),
    "CI/CD": Sigla(
        ("ci/cd",),
        ("integracion continua", "continuous integration"),
        "Integración y Despliegue Continuos (CI/CD)",
    ),
    "IA": Sigla(("ia", "ai"), ("inteligencia artificial", "artificial intelligence"), "Inteligencia Artificial (IA)"),
    "ML": Sigla(("ml",), ("machine learning", "aprendizaje automatico"), "Machine Learning (ML)"),
}

_PATRONES_DE_SIGLAS: dict[str, tuple[tuple[re.Pattern[str], ...], tuple[re.Pattern[str], ...]]] = {
    canonico: (_compilar(sigla.siglas), _compilar(sigla.nombres)) for canonico, sigla in SIGLAS.items()
}


def escritos_de_una_sola_forma(texto: str) -> list[str]:
    """Las formas completas a sugerir para los términos escritos solo como sigla
    o solo con su nombre largo, en el orden de `SIGLAS`.

    Un término ausente no se reporta: no se le sugiere a nadie escribir algo que
    no puso.
    """
    normalizado = normalizar(texto)
    sugerencias = []
    for canonico, (siglas, nombres) in _PATRONES_DE_SIGLAS.items():
        con_sigla = any(patron.search(normalizado) for patron in siglas)
        con_nombre = any(patron.search(normalizado) for patron in nombres)
        if con_sigla != con_nombre:
            sugerencias.append(SIGLAS[canonico].forma_completa)
    return sugerencias


# --- Cargos -------------------------------------------------------------------

#: Cargo canónico → variantes con las que se escribe, en español y en inglés.
#: Un reclutador busca por cargo tanto como por tecnología. Las variantes de un
#: mismo cargo son intercambiables: "Backend Developer" en la convocatoria y
#: "Desarrollador Backend" en el CV son el mismo cargo.
CARGOS: dict[str, tuple[str, ...]] = {
    "Desarrollador Backend": (
        "desarrollador backend", "desarrollador back-end", "desarrollador back end",
        "programador backend", "ingeniero backend", "backend developer",
        "back-end developer", "backend engineer",
    ),
    "Desarrollador Frontend": (
        "desarrollador frontend", "desarrollador front-end", "desarrollador front end",
        "programador frontend", "ingeniero frontend", "frontend developer",
        "front-end developer", "frontend engineer",
    ),
    "Desarrollador Full Stack": (
        "desarrollador full stack", "desarrollador fullstack", "desarrollador full-stack",
        "ingeniero full stack", "full stack developer", "fullstack developer",
        "full-stack developer", "full stack engineer",
    ),
    "Desarrollador Móvil": (
        "desarrollador movil", "desarrollador mobile", "desarrollador android",
        "desarrollador ios", "mobile developer", "android developer", "ios developer",
    ),
    "Desarrollador de Videojuegos": (
        "desarrollador de videojuegos", "programador de videojuegos", "desarrollador de juegos",
        "ingeniero de videojuegos", "game developer", "game programmer", "gameplay programmer",
    ),
    "Ingeniero de Software": (
        "ingeniero de software", "desarrollador de software", "software engineer",
        "software developer",
    ),
    "Analista Programador": ("analista programador", "analista desarrollador"),
    "Ingeniero QA": (
        "ingeniero qa", "analista qa", "tester", "analista de calidad", "analista de pruebas",
        "qa engineer", "qa analyst", "quality assurance",
    ),
    "Ingeniero DevOps": ("ingeniero devops", "devops engineer", "sre", "site reliability engineer"),
    "Ingeniero de Datos": ("ingeniero de datos", "data engineer"),
    "Analista de Datos": ("analista de datos", "data analyst"),
}

_PATRONES_DE_CARGOS: dict[str, tuple[re.Pattern[str], ...]] = {
    canonico: _compilar(variantes) for canonico, variantes in CARGOS.items()
}


def primer_cargo(texto: str) -> str | None:
    """El cargo que aparece primero en el texto, o `None`.

    El primero y no cualquiera: una convocatoria nombra el puesto al principio y
    puede mencionar otros después ("trabajarás junto al equipo de QA").
    """
    normalizado = normalizar(texto)
    mejor: tuple[int, str] | None = None
    for canonico, patrones in _PATRONES_DE_CARGOS.items():
        for patron in patrones:
            if (coincidencia := patron.search(normalizado)) and (mejor is None or coincidencia.start() < mejor[0]):
                mejor = (coincidencia.start(), canonico)
    return mejor[1] if mejor else None


def menciona_cargo(texto: str, cargo: str) -> bool:
    """Si el texto nombra el cargo con cualquiera de sus variantes."""
    normalizado = normalizar(texto)
    return any(patron.search(normalizado) for patron in _PATRONES_DE_CARGOS.get(cargo, ()))

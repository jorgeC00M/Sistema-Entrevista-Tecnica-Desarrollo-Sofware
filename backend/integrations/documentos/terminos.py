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
"""

from __future__ import annotations

import re
import unicodedata

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


#: Patrones precompilados. Se construyen una vez al importar porque `encontrar()`
#: se llama sobre el CV y sobre la convocatoria en cada análisis.
_PATRONES: dict[str, tuple[re.Pattern[str], ...]] = {
    canonico: tuple(_patron(variante) for variante in variantes)
    for canonico, variantes in TERMINOS.items()
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

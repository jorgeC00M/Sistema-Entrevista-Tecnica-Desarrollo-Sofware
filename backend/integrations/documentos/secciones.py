"""Títulos de sección que un parser de ATS reconoce, y el reparto del CV en bloques.

Un ATS mapea el contenido a campos de su base de datos guiándose por los títulos.
Si el título no se reconoce, el contenido que va debajo puede no registrarse en
ningún campo — y entonces el reclutador que busca por experiencia o por
habilidades no encuentra a ese candidato.

Se incluyen variantes en español y en inglés porque un egresado boliviano que
postula a Jalasoft o AssureSoft manda su CV en cualquiera de los dos idiomas.

La lista es deliberadamente conservadora: solo títulos convencionales. Si aquí se
aceptara "Mi trayectoria", el módulo dejaría de avisar del problema que existe.

`segmentar()` usa esos mismos títulos para partir el CV en bloques, que es lo que
permite distinguir una tecnología **demostrada** en la experiencia de una
simplemente **declarada** en la lista de habilidades.
"""

from __future__ import annotations

# Las cuatro secciones que un ATS intenta mapear. `EXPERIENCIA` y `HABILIDADES`
# son las que de verdad se buscan; `EDUCACION` y `CONTACTO` completan la ficha.
TITULOS_POR_SECCION: dict[str, tuple[str, ...]] = {
    "experiencia": (
        "experiencia",
        "experiencia laboral",
        "experiencia profesional",
        "experiencia de trabajo",
        "historial laboral",
        "trayectoria profesional",
        "empleo",
        "work experience",
        "professional experience",
        "employment",
        "employment history",
        "work history",
    ),
    "educacion": (
        "educacion",
        "educación",
        "formacion",
        "formación",
        "formacion academica",
        "formación académica",
        "estudios",
        "education",
        "academic background",
    ),
    "habilidades": (
        "habilidades",
        "habilidades tecnicas",
        "habilidades técnicas",
        "competencias",
        "conocimientos",
        "aptitudes",
        "tecnologias",
        "tecnologías",
        "skills",
        "technical skills",
        "core competencies",
    ),
    "proyectos": (
        "proyectos",
        "proyectos personales",
        "portafolio",
        "projects",
        "personal projects",
        "portfolio",
    ),
}

# Las que un reclutador busca de verdad. Que falte "proyectos" es un detalle;
# que falte "experiencia" o "habilidades" es lo que deja al candidato fuera de
# los resultados de búsqueda.
SECCIONES_CRITICAS = ("experiencia", "habilidades")

#: Donde una tecnología cuenta como demostrada y no solo declarada. "Proyectos"
#: entra junto a "experiencia": para un egresado sin empleo previo, un proyecto
#: propio es la única evidencia de uso real que puede ofrecer, y descartarla lo
#: penalizaría por lo mismo que lo define.
SECCIONES_DE_EVIDENCIA = ("experiencia", "proyectos")


def titulo_de(linea: str) -> str | None:
    """Devuelve la sección que encabeza esta línea, o `None` si no es un título.

    La coincidencia es con la **línea completa**, no por contención, y eso es
    deliberado por dos razones.

    La primera: "experiencia" dentro de "tengo experiencia en Python" es una frase,
    no un título, y contarla daría por buena una estructura que el ATS no reconoce.

    La segunda importa más y conviene no deshacerla. En un CV a dos columnas el
    texto sale intercalado y los títulos dejan de estar solos en su línea: aparece
    "Habilidades Optimice consultas y". Con coincidencia por contención ese caso se
    daría por bueno, cuando es justo lo que le ocurre a un ATS real — las columnas
    revuelven el texto y el parser pierde las secciones. Esa cascada es el hallazgo
    más demostrativo del módulo; aflojar aquí lo borraría.
    """
    normalizada = linea.strip().lower().rstrip(":").strip()
    if not normalizada:
        return None
    for seccion, titulos in TITULOS_POR_SECCION.items():
        if normalizada in titulos:
            return seccion
    return None


def segmentar(texto: str) -> dict[str, str]:
    """Parte el CV en bloques, uno por sección reconocida.

    Cada bloque va desde su título hasta el título siguiente. Lo que precede al
    primer título —nombre, correo, teléfono— no pertenece a ninguna sección y se
    descarta: no es donde se evidencia una tecnología.

    Devuelve un diccionario vacío cuando no se reconoció ningún título. Quien
    llama debe tratar ese caso como "no se puede precisar dónde", no como "no
    aparece en ninguna parte"; son cosas muy distintas para el usuario.

    Si un título se repite —algunos CV separan "Experiencia profesional" y
    "Experiencia académica"— los bloques se concatenan en vez de que el último
    sobrescriba al primero.
    """
    lineas = texto.splitlines()
    marcas: list[tuple[int, str]] = [
        (indice, seccion)
        for indice, linea in enumerate(lineas)
        if (seccion := titulo_de(linea)) is not None
    ]

    if not marcas:
        return {}

    bloques: dict[str, list[str]] = {}
    for posicion, (indice, seccion) in enumerate(marcas):
        fin = marcas[posicion + 1][0] if posicion + 1 < len(marcas) else len(lineas)
        # Desde la línea siguiente al título: el título en sí no es contenido.
        bloques.setdefault(seccion, []).extend(lineas[indice + 1 : fin])

    return {seccion: "\n".join(lineas_del_bloque) for seccion, lineas_del_bloque in bloques.items()}

"""Genera los PDF de prueba del módulo de currículums.

Se escriben los PDF a mano, sin librería, por dos razones. Primera, no añade una
dependencia (reportlab, fpdf) que solo serviría para los tests. Segunda, y más
importante: escribir el flujo de contenido a mano da **control exacto sobre las
coordenadas**, que es justo lo que hay que fijar para probar el detector de
columnas. Con un generador de alto nivel habría que adivinar dónde acabó cada
palabra.

Los PDF resultantes se versionan, así que este script no hace falta para correr
los tests — solo para regenerarlos:

    python backend/tests/fixtures/cv/generar.py
"""

from __future__ import annotations

from pathlib import Path

ANCHO_PAGINA = 612  # Carta, en puntos PDF
ALTO_PAGINA = 792


def _flujo_de_texto(lineas: list[tuple[float, float, str]], tamano: int = 11) -> bytes:
    """Convierte (x, y, texto) en un flujo de contenido PDF.

    `y` se mide desde abajo, que es como funciona el sistema de coordenadas del
    PDF; los textos se escriben con la línea base en esa altura.
    """
    partes = ["BT", f"/F1 {tamano} Tf"]
    for x, y, texto in lineas:
        escapado = texto.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")
        partes.append(f"1 0 0 1 {x} {y} Tm ({escapado}) Tj")
    partes.append("ET")
    return "\n".join(partes).encode("latin-1")


def _escribir_pdf(ruta: Path, paginas: list[bytes]) -> None:
    """Ensambla un PDF mínimo pero válido con una fuente estándar.

    Estructura: catálogo → páginas → una página por flujo de contenido. Se usa
    Helvetica, que es una de las catorce fuentes que todo lector trae, así que no
    hay que incrustar nada.
    """
    objetos: list[bytes] = []

    # 1: catálogo, 2: árbol de páginas, 3: fuente. Las páginas y sus flujos van
    # después, en pares.
    primer_id_de_pagina = 4
    ids_de_pagina = [primer_id_de_pagina + indice * 2 for indice in range(len(paginas))]

    objetos.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    objetos.append(
        f"<< /Type /Pages /Kids [{' '.join(f'{i} 0 R' for i in ids_de_pagina)}] "
        f"/Count {len(paginas)} >>".encode("latin-1")
    )
    objetos.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    for indice, contenido in enumerate(paginas):
        id_contenido = ids_de_pagina[indice] + 1
        objetos.append(
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {ANCHO_PAGINA} {ALTO_PAGINA}] "
            f"/Resources << /Font << /F1 3 0 R >> >> /Contents {id_contenido} 0 R >>".encode("latin-1")
        )
        objetos.append(
            b"<< /Length " + str(len(contenido)).encode() + b" >>\nstream\n" + contenido + b"\nendstream"
        )

    salida = bytearray(b"%PDF-1.4\n")
    posiciones: list[int] = []
    for numero, cuerpo in enumerate(objetos, start=1):
        posiciones.append(len(salida))
        salida += f"{numero} 0 obj\n".encode() + cuerpo + b"\nendobj\n"

    inicio_xref = len(salida)
    salida += f"xref\n0 {len(objetos) + 1}\n".encode()
    salida += b"0000000000 65535 f \n"
    for posicion in posiciones:
        salida += f"{posicion:010d} 00000 n \n".encode()
    salida += (
        f"trailer\n<< /Size {len(objetos) + 1} /Root 1 0 R >>\nstartxref\n{inicio_xref}\n%%EOF\n"
    ).encode()

    ruta.write_bytes(bytes(salida))


# --- Los currículums de prueba ---------------------------------------------

def _una_columna() -> list[bytes]:
    """CV correcto: una columna, títulos estándar, fechas consistentes."""
    lineas = [
        "Jorge Condori Maita",
        "jorge.condori@example.com",
        "+591 71234567",
        "",
        "Experiencia",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - Mar 2023",
        "Optimice consultas PostgreSQL y reduje la latencia 40%.",
        "",
        "Desarrollador Junior, AssureSoft",
        "Abr 2023 - Actualidad",
        "Implemente endpoints REST con Django y escribi sus pruebas.",
        "",
        "Educacion",
        "Ingenieria de Sistemas, UMSS",
        "Feb 2016 - Dic 2021",
        "",
        "Habilidades",
        "Python, Django, PostgreSQL, Git, Docker, REST",
    ]
    y = ALTO_PAGINA - 60
    posicionadas = []
    for linea in lineas:
        if linea:
            posicionadas.append((72.0, float(y), linea))
        y -= 20
    return [_flujo_de_texto(posicionadas)]


def _dos_columnas() -> list[bytes]:
    """CV a dos columnas, con un canal vacío ancho en el medio.

    La columna izquierda acaba en x=250 y la derecha empieza en x=340: un canal
    de 90 puntos sobre un ancho de contenido de ~480, bastante más que el 6% que
    el detector exige.
    """
    izquierda = [
        "Jorge Condori Maita",
        "jorge.condori@example.com",
        "+591 71234567",
        "",
        "Habilidades",
        "Python",
        "Django",
        "PostgreSQL",
        "Git",
        "Docker",
        "REST",
        "Pruebas unitarias",
        "Estructuras de datos",
    ]
    derecha = [
        "Experiencia",
        "Desarrollador Backend",
        "Jalasoft",
        "Ene 2020 - Mar 2023",
        "Optimice consultas y",
        "reduje la latencia 40%.",
        "",
        "Desarrollador Junior",
        "AssureSoft",
        "Abr 2023 - Actualidad",
        "Implemente endpoints",
        "REST con Django.",
        "",
        "Educacion",
        "Ingenieria de Sistemas",
        "UMSS",
        "Feb 2016 - Dic 2021",
    ]

    posicionadas = []
    y = ALTO_PAGINA - 60
    for linea in izquierda:
        if linea:
            posicionadas.append((72.0, float(y), linea))
        y -= 20

    y = ALTO_PAGINA - 60
    for linea in derecha:
        if linea:
            posicionadas.append((340.0, float(y), linea))
        y -= 20

    return [_flujo_de_texto(posicionadas)]


def _escaneado() -> list[bytes]:
    """Simula un PDF escaneado: se abre bien, pero casi no tiene texto.

    Un escáner suele dejar algún artefacto suelto —un número de página, una marca
    del programa— y por eso el umbral del extractor no es «cero caracteres» sino
    un mínimo por página. Este fixture reproduce ese caso, que es el que
    distingue un documento ilegible de uno vacío.
    """
    return [_flujo_de_texto([(300.0, 40.0, "1")])]


def _titulos_creativos() -> list[bytes]:
    """Maqueta limpia, una columna, pero con títulos que el ATS no mapea."""
    lineas = [
        "Jorge Condori Maita",
        "jorge.condori@example.com",
        "+591 71234567",
        "",
        "Mi trayectoria",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - Mar 2023",
        "",
        "Donde me forme",
        "Ingenieria de Sistemas, UMSS",
        "Feb 2016 - Dic 2021",
        "",
        "Toolkit",
        "Python, Django, PostgreSQL",
    ]
    y = ALTO_PAGINA - 60
    posicionadas = [(72.0, float(y - indice * 20), linea) for indice, linea in enumerate(lineas) if linea]
    return [_flujo_de_texto(posicionadas)]


def _fechas_mezcladas() -> list[bytes]:
    """Títulos correctos, pero tres formatos de fecha distintos."""
    lineas = [
        "Jorge Condori Maita",
        "jorge.condori@example.com",
        "+591 71234567",
        "",
        "Experiencia",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - 03/2023",
        "",
        "Desarrollador Junior, AssureSoft",
        "2023-04 - Actualidad",
        "",
        "Educacion",
        "Ingenieria de Sistemas, UMSS",
        "feb '16 - dic '21",
        "",
        "Habilidades",
        "Python, Django, PostgreSQL",
    ]
    y = ALTO_PAGINA - 60
    posicionadas = [(72.0, float(y - indice * 20), linea) for indice, linea in enumerate(lineas) if linea]
    return [_flujo_de_texto(posicionadas)]


def _sin_contacto() -> list[bytes]:
    """Sin correo ni teléfono como texto: el reclutador no puede contactar."""
    lineas = [
        "Jorge Condori Maita",
        "",
        "Experiencia",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - Mar 2023",
        "",
        "Educacion",
        "Ingenieria de Sistemas, UMSS",
        "Feb 2016 - Dic 2021",
        "",
        "Habilidades",
        "Python, Django, PostgreSQL",
    ]
    y = ALTO_PAGINA - 60
    posicionadas = [(72.0, float(y - indice * 20), linea) for indice, linea in enumerate(lineas) if linea]
    return [_flujo_de_texto(posicionadas)]


def _demasiadas_paginas() -> list[bytes]:
    """Cuatro páginas: no rompe el parseo, pero se avisa."""
    base = _una_columna()[0]
    extra = _flujo_de_texto([(72.0, float(ALTO_PAGINA - 60), "Continuacion de la experiencia laboral.")])
    return [base, extra, extra, extra]


def _habilidades_declaradas() -> list[bytes]:
    """CV bien formateado que **declara** tecnologías sin usarlas en la experiencia.

    Es el caso que fija el aporte del mapa de evidencia: Django y Docker aparecen
    en la lista de habilidades y en ninguna viñeta de experiencia, así que deben
    salir como `declarado` y no como `demostrado`. Python y PostgreSQL sí se usan,
    para que el mismo documento cubra los dos estados.
    """
    lineas = [
        "Jorge Condori Maita",
        "jorge.condori@example.com",
        "+591 71234567",
        "",
        "Experiencia",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - Mar 2023",
        "- Optimice consultas Python sobre PostgreSQL y reduje la latencia 40%",
        "- Automatice los respaldos diarios de la base de datos",
        "",
        "Educacion",
        "Ingenieria de Sistemas, UMSS",
        "Feb 2016 - Dic 2021",
        "",
        "Habilidades",
        "Python, PostgreSQL, Django, Docker, REST",
    ]
    y = ALTO_PAGINA - 60
    posicionadas = [(72.0, float(y - indice * 20), linea) for indice, linea in enumerate(lineas) if linea]
    return [_flujo_de_texto(posicionadas)]


CORPUS = {
    "una_columna.pdf": _una_columna,
    "dos_columnas.pdf": _dos_columnas,
    "escaneado.pdf": _escaneado,
    "titulos_creativos.pdf": _titulos_creativos,
    "fechas_mezcladas.pdf": _fechas_mezcladas,
    "sin_contacto.pdf": _sin_contacto,
    "demasiadas_paginas.pdf": _demasiadas_paginas,
    "habilidades_declaradas.pdf": _habilidades_declaradas,
}


def main() -> None:
    destino = Path(__file__).parent
    for nombre, construir in CORPUS.items():
        _escribir_pdf(destino / nombre, construir())
        print(f"escrito {nombre}")


if __name__ == "__main__":
    main()

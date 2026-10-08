"""Genera los PDF de prueba del módulo de currículums.

Se escriben los PDF a mano, sin librería, por dos razones. Primera, no añade una
dependencia (reportlab, fpdf) que solo serviría para los tests. Segunda, y más
importante: escribir el flujo de contenido a mano da **control exacto sobre las
coordenadas**, que es justo lo que hay que fijar para probar el detector de
columnas. Con un generador de alto nivel habría que adivinar dónde acabó cada
palabra.

Los DOCX sí se generan con `python-docx`, que ya es dependencia del extractor.
Lo que hay que fijar en ellos no son coordenadas sino **dónde** vive cada texto
—un cuadro de texto, el encabezado de página—, y eso se escribe directamente en
el XML.

Los archivos resultantes se versionan, así que este script no hace falta para
correr los tests — solo para regenerarlos:

    python backend/tests/fixtures/cv/generar.py
"""

from __future__ import annotations

from pathlib import Path

ANCHO_PAGINA = 612  # Carta, en puntos PDF
ALTO_PAGINA = 792


def _flujo_de_texto(
    lineas: list[tuple[float, float, str]],
    tamano: int = 11,
    color: tuple[float, float, float] | None = None,
) -> bytes:
    """Convierte (x, y, texto) en un flujo de contenido PDF.

    `y` se mide desde abajo, que es como funciona el sistema de coordenadas del
    PDF; los textos se escriben con la línea base en esa altura. `color` es el
    relleno RGB del texto; sin él, el negro por defecto.
    """
    partes = ["BT", f"/F1 {tamano} Tf"]
    if color is not None:
        partes.append(f"{color[0]} {color[1]} {color[2]} rg")
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
    """CV correcto: una columna, títulos estándar, fechas consistentes y todos
    los campos de la ficha, ubicación incluida."""
    lineas = [
        "Jorge Condori Maita",
        "jorge.condori@example.com",
        "+591 71234567",
        "Cochabamba, Bolivia",
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


def _posicionar(lineas: list[str], y_inicial: float = ALTO_PAGINA - 60) -> list[tuple[float, float, str]]:
    return [(72.0, float(y_inicial - indice * 20), linea) for indice, linea in enumerate(lineas) if linea]


def _rectangulo(x: float, y: float, ancho: float, alto: float, color: tuple[float, float, float]) -> bytes:
    """Un rectángulo relleno, en el mismo sistema de coordenadas que el texto."""
    # Entre q/Q para que su color no se quede como color del texto que sigue.
    return f"q {color[0]} {color[1]} {color[2]} rg {x} {y} {ancho} {alto} re f Q".encode("latin-1")


_CV_CORRECTO = [
    "Jorge Condori Maita",
    "jorge.condori@example.com",
    "+591 71234567",
    "Cochabamba, Bolivia",
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


def _texto_blanco() -> list[bytes]:
    """El truco de pegar palabras clave en letra blanca al pie del CV.

    Sobre el fondo blanco de la página no se ve; el ATS lo extrae igual, y un
    reclutador que mira la vista de parseo lo encuentra.
    """
    visible = _flujo_de_texto(_posicionar(_CV_CORRECTO))
    oculto = _flujo_de_texto(
        [(72.0, 80.0, "Kubernetes Terraform GraphQL Kafka Spark Scala Rust Elixir")],
        color=(1, 1, 1),
    )
    return [visible + b"\n" + oculto]


def _texto_blanco_sobre_banda() -> list[bytes]:
    """Nombre en blanco sobre una cabecera azul: legítimo, no es texto oculto."""
    banda = _rectangulo(0, ALTO_PAGINA - 50, ANCHO_PAGINA, 50, (0.1, 0.2, 0.6))
    nombre = _flujo_de_texto(
        [(72.0, float(ALTO_PAGINA - 32), "Jorge Condori Maita, Desarrollador Backend")],
        color=(1, 1, 1),
    )
    # El color de relleno persiste entre bloques de texto: sin volver al negro,
    # el cuerpo heredaría el blanco del nombre.
    cuerpo = _flujo_de_texto(_posicionar(_CV_CORRECTO[1:], y_inicial=ALTO_PAGINA - 80), color=(0, 0, 0))
    return [banda + b"\n" + nombre + b"\n" + cuerpo]


def _pie_repetido() -> list[bytes]:
    """Dos páginas con el mismo pie, y el correo solo está ahí.

    Es el caso que un PDF sí permite detectar —la misma línea en la franja
    inferior de cada página— y que muchos ATS descartan como pie.
    """
    primera = [
        "Jorge Condori Maita",
        "Cochabamba, Bolivia",
        "",
        "Experiencia",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - Mar 2023",
        "",
        "Habilidades",
        "Python, Django, PostgreSQL",
    ]
    segunda = ["Educacion", "Ingenieria de Sistemas, UMSS", "Feb 2016 - Dic 2021"]

    def con_pie(lineas: list[str], numero: int) -> bytes:
        pie = [(72.0, 30.0, f"jorge.condori@example.com - Pagina {numero} de 2")]
        return _flujo_de_texto(_posicionar(lineas) + pie)

    return [con_pie(primera, 1), con_pie(segunda, 2)]


# --- DOCX ----------------------------------------------------------------------

#: Un cuadro de texto tal como lo guarda Word: dos veces, en `mc:Choice` y en
#: `mc:Fallback`. El fixture lo replica para fijar que el extractor no duplica su
#: texto.
_CUADRO_DE_TEXTO = (
    '<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'
    ' xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"'
    ' xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"'
    ' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"'
    ' xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"'
    ' xmlns:v="urn:schemas-microsoft-com:vml">'
    "<mc:AlternateContent>"
    '<mc:Choice Requires="wps"><w:drawing><wp:inline>'
    '<wp:extent cx="3000000" cy="600000"/><wp:docPr id="1" name="Cuadro de texto 1"/>'
    '<a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">'
    "<wps:wsp><wps:txbx><w:txbxContent>{parrafos}</w:txbxContent></wps:txbx></wps:wsp>"
    "</a:graphicData></a:graphic></wp:inline></w:drawing></mc:Choice>"
    "<mc:Fallback><w:pict><v:shape><v:textbox><w:txbxContent>{parrafos}</w:txbxContent>"
    "</v:textbox></v:shape></w:pict></mc:Fallback>"
    "</mc:AlternateContent></w:r>"
)


def _docx_base(con_contacto: bool = True):
    from docx import Document

    documento = Document()
    lineas = ["Jorge Condori Maita"]
    if con_contacto:
        lineas += ["jorge.condori@example.com", "+591 71234567"]
    lineas += [
        "Cochabamba, Bolivia",
        "Experiencia",
        "Desarrollador Backend, Jalasoft",
        "Ene 2020 - Mar 2023",
        "Educacion",
        "Ingenieria de Sistemas, UMSS",
        "Feb 2016 - Dic 2021",
    ]
    for linea in lineas:
        documento.add_paragraph(linea)
    return documento


def _docx_cuadro_de_texto(ruta: Path) -> None:
    """Las habilidades dentro de un cuadro de texto, que el cuerpo no incluye."""
    from docx.oxml import parse_xml

    documento = _docx_base()
    documento.add_paragraph("Habilidades")
    parrafos = "".join(
        f"<w:p><w:r><w:t>{texto}</w:t></w:r></w:p>" for texto in ("Python, Django", "PostgreSQL, Docker")
    )
    contenedor = documento.add_paragraph()
    contenedor._p.append(parse_xml(_CUADRO_DE_TEXTO.format(parrafos=parrafos)))
    documento.save(ruta)


def _docx_correo_en_encabezado(ruta: Path) -> None:
    """El correo y el teléfono solo en el encabezado de página."""
    documento = _docx_base(con_contacto=False)
    documento.add_paragraph("Habilidades")
    documento.add_paragraph("Python, Django, PostgreSQL")
    documento.sections[0].header.paragraphs[0].text = "jorge.condori@example.com | +591 71234567"
    documento.save(ruta)


DOCX = {
    "cuadro_de_texto.docx": _docx_cuadro_de_texto,
    "correo_en_encabezado.docx": _docx_correo_en_encabezado,
}


CORPUS = {
    "una_columna.pdf": _una_columna,
    "dos_columnas.pdf": _dos_columnas,
    "escaneado.pdf": _escaneado,
    "titulos_creativos.pdf": _titulos_creativos,
    "fechas_mezcladas.pdf": _fechas_mezcladas,
    "sin_contacto.pdf": _sin_contacto,
    "demasiadas_paginas.pdf": _demasiadas_paginas,
    "habilidades_declaradas.pdf": _habilidades_declaradas,
    "texto_blanco.pdf": _texto_blanco,
    "texto_blanco_sobre_banda.pdf": _texto_blanco_sobre_banda,
    "pie_repetido.pdf": _pie_repetido,
}


def main() -> None:
    destino = Path(__file__).parent
    for nombre, construir in CORPUS.items():
        _escribir_pdf(destino / nombre, construir())
        print(f"escrito {nombre}")
    for nombre, escribir in DOCX.items():
        escribir(destino / nombre)
        print(f"escrito {nombre}")


if __name__ == "__main__":
    main()

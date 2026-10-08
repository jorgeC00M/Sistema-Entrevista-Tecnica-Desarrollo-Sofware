"""Extracción de texto y geometría de un currículum.

Imita lo que hace el parser de un ATS: abre el documento y saca el texto que
puede, sin interpretar nada. La interpretación vive en `ats.py`.

La pieza no obvia es que se conservan las **coordenadas** de cada palabra. El
texto plano no permite saber si un CV está maquetado a dos columnas, y eso es una
de las causas más frecuentes de que un ATS devuelva información revuelta. Con las
posiciones x sí se puede.

La otra es que se registra, **aparte**, lo que muchos ATS no leen: el texto de
los cuadros de texto y del encabezado o pie de página, y los caracteres
invisibles. No se suma a `texto`, que sigue siendo lo que vería un parser típico.
Sumarlo haría que el espejo afirmara que el ATS ve un correo que en realidad no
ve, que es justo el error que el módulo denuncia.
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass, field

import pdfplumber
from docx import Document
from docx.oxml.ns import qn
from pdfminer.pdfparser import PDFSyntaxError

from integrations.documentos.exceptions import (
    DocumentoCorrupto,
    DocumentoDemasiadoGrande,
    FormatoNoSoportado,
)

EXTENSIONES_SOPORTADAS = (".pdf", ".docx")

# Por debajo de este número de caracteres por página se considera que no hay
# capa de texto aprovechable. No es cero porque un PDF escaneado suele traer
# algún artefacto suelto (un número de página, metadatos del escáner), y tomar
# "> 0" como "tiene texto" daría por bueno un documento ilegible.
MINIMO_CARACTERES_POR_PAGINA = 50

# Tope duro, para proteger al servidor y no para juzgar el CV: que tenga más
# páginas de las recomendables se avisa como hallazgo. Se comprueba al abrir,
# antes de recorrer las páginas, que es la parte costosa.
MAXIMO_PAGINAS = 10


# Franja superior e inferior de cada página donde vive un encabezado o pie de
# página, como fracción de su altura.
FRANJA_DE_ENCABEZADO = 0.08

# Por debajo de este tamaño, en puntos, un carácter no se lee a simple vista.
TAMANO_MINIMO_LEGIBLE = 4

# `mc:AlternateContent` guarda cada cuadro de texto dos veces —la versión moderna
# en `mc:Choice` y una de respaldo en `mc:Fallback`—, así que hay que leer solo
# una para no duplicar el texto.
_MC_FALLBACK = "{http://schemas.openxmlformats.org/markup-compatibility/2006}Fallback"


@dataclass(frozen=True)
class Palabra:
    """Una palabra con su posición en la página, en puntos PDF."""

    texto: str
    x0: float
    x1: float
    arriba: float
    pagina: int


@dataclass
class DocumentoExtraido:
    """Lo que se pudo sacar del archivo, antes de juzgarlo.

    `formato` se conserva porque varias verificaciones solo aplican a PDF: un
    DOCX no puede estar escaneado, y sus columnas se hacen con tablas en vez de
    con posiciones absolutas.

    `texto_en_cuadros`, `texto_en_encabezado` y `caracteres_ocultos` son lo que
    un ATS típico no lee. Tienen valor por defecto para que construir un
    documento a mano —como hacen los tests de reglas— no obligue a pensar en
    ellos.
    """

    texto: str
    formato: str
    paginas: int
    palabras: list[Palabra] = field(default_factory=list)
    tablas: int = 0
    imagenes: int = 0
    texto_en_cuadros: str = ""
    texto_en_encabezado: str = ""
    caracteres_ocultos: int = 0

    @property
    def tiene_capa_de_texto(self) -> bool:
        if self.paginas == 0:
            return False
        return len(self.texto.strip()) >= MINIMO_CARACTERES_POR_PAGINA * self.paginas

    @property
    def huella(self) -> str:
        """Todo el texto del documento, lo lea el ATS o no: lo que identifica qué
        hay que analizar.

        Dos DOCX idénticos salvo por el encabezado son documentos distintos —uno
        puede tener el correo ahí y el otro no— y no deben compartir análisis.
        Cuando no hay texto oculto la huella es el texto tal cual, para que un CV
        corriente siga encontrando el análisis que ya tenía.
        """
        ocultas = [parte for parte in (self.texto_en_cuadros, self.texto_en_encabezado) if parte]
        return "\n".join([self.texto, *ocultas]) if ocultas else self.texto


def extraer(contenido: bytes, nombre_archivo: str) -> DocumentoExtraido:
    """Extrae texto y geometría de un PDF o DOCX.

    Lanza `FormatoNoSoportado` si no es ninguno de los dos, y
    `DocumentoCorrupto` si el archivo no se puede abrir. Un documento que se
    abre pero no tiene texto **no** es un error: se devuelve con
    `tiene_capa_de_texto` en falso para que `ats.py` lo reporte.
    """
    nombre = nombre_archivo.lower()

    if nombre.endswith(".pdf"):
        return _extraer_pdf(contenido)
    if nombre.endswith(".docx"):
        return _extraer_docx(contenido)

    raise FormatoNoSoportado(
        f"Solo se aceptan archivos {' y '.join(EXTENSIONES_SOPORTADAS)}; se recibió «{nombre_archivo}»."
    )


def _extraer_pdf(contenido: bytes) -> DocumentoExtraido:
    try:
        with pdfplumber.open(io.BytesIO(contenido)) as pdf:
            if len(pdf.pages) > MAXIMO_PAGINAS:
                raise DocumentoDemasiadoGrande(
                    f"El archivo tiene {len(pdf.pages)} páginas y el límite es {MAXIMO_PAGINAS}."
                )

            textos: list[str] = []
            palabras: list[Palabra] = []
            tablas = 0
            imagenes = 0
            ocultos = 0

            for numero, pagina in enumerate(pdf.pages, start=1):
                textos.append(pagina.extract_text() or "")
                tablas += len(pagina.find_tables())
                imagenes += len(pagina.images)
                ocultos += _caracteres_ocultos(pagina)

                for palabra in pagina.extract_words():
                    palabras.append(
                        Palabra(
                            texto=palabra["text"],
                            x0=float(palabra["x0"]),
                            x1=float(palabra["x1"]),
                            arriba=float(palabra["top"]),
                            pagina=numero,
                        )
                    )

            repetidas = _lineas_de_encabezado_repetidas(pdf.pages)

            return DocumentoExtraido(
                texto="\n".join(_sin_lineas(texto, repetidas) for texto in textos),
                formato="pdf",
                paginas=len(pdf.pages),
                palabras=palabras,
                tablas=tablas,
                imagenes=imagenes,
                texto_en_encabezado="\n".join(repetidas.values()),
                caracteres_ocultos=ocultos,
            )
    except PDFSyntaxError as exc:
        raise DocumentoCorrupto("El archivo no es un PDF válido o está dañado.") from exc
    except (FormatoNoSoportado, DocumentoDemasiadoGrande):
        raise
    except Exception as exc:  # pdfplumber/pdfminer no tienen una jerarquía única
        raise DocumentoCorrupto(f"No se pudo leer el PDF: {exc}") from exc


def _clave_de_linea(linea: str) -> str:
    """Una línea sin dígitos ni espacios: "Página 1 de 2" y "Página 2 de 2" son el
    mismo pie, y lo que cambia entre páginas es justo la numeración."""
    return re.sub(r"[\d\s]+", "", linea).lower()


def _lineas_de_encabezado_repetidas(paginas) -> dict[str, str]:
    """Las líneas que se repiten en la franja superior o inferior de **todas** las
    páginas, como clave → texto original.

    Con una sola página no se intenta: un encabezado de Word y el título de un CV
    caen en el mismo sitio, y un PDF no conserva esa distinción. Se prefiere no
    informar a adivinar.
    """
    if len(paginas) < 2:
        return {}

    por_pagina: list[dict[str, str]] = []
    for pagina in paginas:
        alto = float(pagina.height)
        en_franja: dict[str, str] = {}
        for linea in pagina.extract_text_lines():
            arriba = linea["top"] < alto * FRANJA_DE_ENCABEZADO
            abajo = linea["bottom"] > alto * (1 - FRANJA_DE_ENCABEZADO)
            if (arriba or abajo) and (clave := _clave_de_linea(linea["text"])):
                en_franja.setdefault(clave, linea["text"].strip())
        por_pagina.append(en_franja)

    comunes = set.intersection(*(set(lineas) for lineas in por_pagina))
    return {clave: texto for clave, texto in por_pagina[0].items() if clave in comunes}


def _sin_lineas(texto: str, repetidas: dict[str, str]) -> str:
    """Quita del texto de una página las líneas de encabezado o pie repetidas: lo
    que el ATS no lee no debe llegar a la ficha."""
    if not repetidas:
        return texto
    return "\n".join(linea for linea in texto.splitlines() if _clave_de_linea(linea) not in repetidas)


def _es_blanco(color) -> bool:
    """Si un color de pdfplumber es blanco, en gris, RGB o CMYK.

    `None` es el negro por defecto. Un patrón llega como nombre y no se puede
    juzgar, así que no cuenta.
    """
    if color is None:
        return False
    try:
        valores = (float(color),) if isinstance(color, (int, float)) else tuple(float(v) for v in color)
    except (TypeError, ValueError):
        return False
    if len(valores) in (1, 3):
        return all(valor >= 0.99 for valor in valores)
    if len(valores) == 4:
        return all(valor <= 0.01 for valor in valores)
    return False


def _caracteres_ocultos(pagina) -> int:
    """Caracteres blancos o diminutos: el truco de pegar la convocatoria en letra
    blanca para "engañar" al ATS.

    El texto blanco sobre un rectángulo de color es legítimo —un nombre sobre una
    cabecera azul— y no cuenta. En el resto se asume fondo blanco: una imagen de
    fondo oscura no se detecta, y por eso el hallazgo pide comprobar en vez de
    afirmar.
    """
    fondos = [
        rect
        for rect in pagina.rects
        if rect.get("fill") and not _es_blanco(rect.get("non_stroking_color"))
    ]

    def sobre_un_fondo(caracter) -> bool:
        x = (caracter["x0"] + caracter["x1"]) / 2
        y = (caracter["top"] + caracter["bottom"]) / 2
        return any(r["x0"] <= x <= r["x1"] and r["top"] <= y <= r["bottom"] for r in fondos)

    ocultos = 0
    for caracter in pagina.chars:
        if not caracter["text"].strip():
            continue
        diminuto = float(caracter.get("size") or TAMANO_MINIMO_LEGIBLE) < TAMANO_MINIMO_LEGIBLE
        blanco = _es_blanco(caracter.get("non_stroking_color")) and not sobre_un_fondo(caracter)
        if diminuto or blanco:
            ocultos += 1
    return ocultos


def _extraer_docx(contenido: bytes) -> DocumentoExtraido:
    """Extrae un DOCX.

    No se recogen coordenadas: un DOCX no tiene posiciones absolutas, su
    maquetación en columnas se hace con tablas. Por eso `palabras` queda vacío y
    las verificaciones geométricas de `ats.py` se saltan para este formato.
    """
    try:
        documento = Document(io.BytesIO(contenido))
    except Exception as exc:  # python-docx lanza varias cosas distintas
        raise DocumentoCorrupto(f"No se pudo leer el DOCX: {exc}") from exc

    partes = [parrafo.text for parrafo in documento.paragraphs]

    # El texto de las tablas no sale en `paragraphs`, y en un CV maquetado con
    # tablas es justamente donde vive casi todo. Omitirlo daría un documento
    # falsamente vacío.
    for tabla in documento.tables:
        for fila in tabla.rows:
            for celda in fila.cells:
                partes.append(celda.text)

    return DocumentoExtraido(
        texto="\n".join(parte for parte in partes if parte.strip()),
        formato="docx",
        # Un DOCX no declara su paginación: la calcula el programa al renderizar.
        # Se asume una para que las métricas por página no dividan por cero; el
        # límite de páginas se verifica solo en PDF.
        paginas=1,
        tablas=len(documento.tables),
        imagenes=len(documento.inline_shapes),
        texto_en_cuadros=_texto_en_cuadros(documento),
        texto_en_encabezado=_texto_en_encabezados(documento),
    )


def _dentro_de_respaldo(elemento) -> bool:
    return next(elemento.iterancestors(_MC_FALLBACK), None) is not None


def _parrafos(elemento) -> list[str]:
    """El texto de cada párrafo bajo `elemento`, sin repetir ninguno.

    Un cuadro de texto vive *dentro* de un párrafo, así que recorrer los `w:t` de
    un párrafo con `iter` arrastraría también los del cuadro. Cada `w:t` se
    atribuye solo a su párrafo más cercano.
    """
    textos = []
    for parrafo in elemento.iter(qn("w:p")):
        if _dentro_de_respaldo(parrafo):
            continue
        texto = "".join(
            nodo.text or ""
            for nodo in parrafo.iter(qn("w:t"))
            if next(nodo.iterancestors(qn("w:p")), None) is parrafo
        )
        if texto.strip():
            textos.append(texto)
    return textos


def _texto_en_cuadros(documento) -> str:
    """El texto de los cuadros de texto del cuerpo, que `paragraphs` no incluye y
    muchos parsers tampoco leen."""
    textos = []
    for cuadro in documento.element.body.iter(qn("w:txbxContent")):
        anidado = next(cuadro.iterancestors(qn("w:txbxContent")), None) is not None
        if anidado or _dentro_de_respaldo(cuadro):
            continue
        textos.extend(_parrafos(cuadro))
    return "\n".join(textos)


def _texto_en_encabezados(documento) -> str:
    """El texto de encabezados y pies de página de todas las secciones.

    Solo se leen los que tienen definición propia: acceder al contenido de uno
    "enlazado al anterior" hace que python-docx lo cree, y extraer no debe
    modificar nada.
    """
    textos: list[str] = []
    for seccion in documento.sections:
        for parte in (
            seccion.header,
            seccion.footer,
            seccion.first_page_header,
            seccion.first_page_footer,
            seccion.even_page_header,
            seccion.even_page_footer,
        ):
            if parte.is_linked_to_previous:
                continue
            for texto in _parrafos(parte.part.element):
                if texto not in textos:
                    textos.append(texto)
    return "\n".join(textos)

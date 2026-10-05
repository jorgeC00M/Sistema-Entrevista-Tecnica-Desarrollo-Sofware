"""Extracción de texto y geometría de un currículum.

Imita lo que hace el parser de un ATS: abre el documento y saca el texto que
puede, sin interpretar nada. La interpretación vive en `ats.py`.

La pieza no obvia es que se conservan las **coordenadas** de cada palabra. El
texto plano no permite saber si un CV está maquetado a dos columnas, y eso es una
de las causas más frecuentes de que un ATS devuelva información revuelta. Con las
posiciones x sí se puede.
"""

from __future__ import annotations

import io
from dataclasses import dataclass, field

import pdfplumber
from docx import Document
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
    """

    texto: str
    formato: str
    paginas: int
    palabras: list[Palabra] = field(default_factory=list)
    tablas: int = 0
    imagenes: int = 0

    @property
    def tiene_capa_de_texto(self) -> bool:
        if self.paginas == 0:
            return False
        return len(self.texto.strip()) >= MINIMO_CARACTERES_POR_PAGINA * self.paginas


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

            partes: list[str] = []
            palabras: list[Palabra] = []
            tablas = 0
            imagenes = 0

            for numero, pagina in enumerate(pdf.pages, start=1):
                partes.append(pagina.extract_text() or "")
                tablas += len(pagina.find_tables())
                imagenes += len(pagina.images)

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

            return DocumentoExtraido(
                texto="\n".join(partes),
                formato="pdf",
                paginas=len(pdf.pages),
                palabras=palabras,
                tablas=tablas,
                imagenes=imagenes,
            )
    except PDFSyntaxError as exc:
        raise DocumentoCorrupto("El archivo no es un PDF válido o está dañado.") from exc
    except (FormatoNoSoportado, DocumentoDemasiadoGrande):
        raise
    except Exception as exc:  # pdfplumber/pdfminer no tienen una jerarquía única
        raise DocumentoCorrupto(f"No se pudo leer el PDF: {exc}") from exc


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
    )

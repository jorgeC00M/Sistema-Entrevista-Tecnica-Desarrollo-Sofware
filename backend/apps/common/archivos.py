"""Validación de documentos subidos (PDF/DOCX), compartida por las apps.

La usan el módulo de CV (el currículum y la convocatoria contra la que medirlo)
y la nueva entrevista (la convocatoria a la que se postula). Vive aquí y no en
una de ellas para que ninguna importe de la otra.
"""

from __future__ import annotations

from rest_framework import serializers

from integrations.documentos.extractor import extraer

#: Tope de tamaño del archivo, verificado **antes** de parsearlo. Un CV de dos
#: páginas pesa unos cientos de kilobytes; dos megas admiten con holgura uno con
#: una foto y a la vez impiden que un archivo de cien megas ocupe la memoria del
#: worker mientras se abre. El tope de páginas se comprueba aparte, al abrir el
#: documento, porque contarlas exige haberlo abierto.
MAXIMO_BYTES = 2 * 1024 * 1024

#: Lo que el cliente puede mandar. Las imágenes se rechazan aquí, con su motivo,
#: en lugar de dejar que el extractor lo haga: decirlo de inmediato es más útil
#: que fingir un análisis.
EXTENSIONES_ACEPTADAS = (".pdf", ".docx")


def validar_archivo(archivo):
    """Formato y peso."""
    nombre = archivo.name.lower()
    if not nombre.endswith(EXTENSIONES_ACEPTADAS):
        raise serializers.ValidationError(
            "Solo se aceptan archivos PDF o DOCX. Una imagen (JPG, PNG) no la puede "
            "leer ningún ATS: exporta el documento desde Word o Google Docs."
        )
    if archivo.size > MAXIMO_BYTES:
        raise serializers.ValidationError(
            f"El archivo pesa {archivo.size // 1024} KB y el máximo es "
            f"{MAXIMO_BYTES // 1024} KB."
        )
    return archivo


def texto_de_convocatoria(archivo, campo: str) -> str:
    """El texto de una convocatoria subida como archivo.

    Un escaneado (sin capa de texto) se rechaza con un 400 que pide pegar el
    texto: aquí no hay nada que medir del documento en sí, a diferencia del CV.
    """
    documento = extraer(archivo.read(), archivo.name)
    if not documento.tiene_capa_de_texto:
        raise serializers.ValidationError(
            {
                campo: (
                    "No se pudo leer texto del archivo de la convocatoria: "
                    "parece ser una imagen escaneada. Pega el texto en su lugar."
                )
            }
        )
    return documento.texto

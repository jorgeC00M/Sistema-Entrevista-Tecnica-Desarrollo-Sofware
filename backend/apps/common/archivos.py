"""Validación de documentos subidos (PDF/DOCX), compartida por las apps.

La usan el módulo de CV (el currículum y la convocatoria contra la que medirlo)
y la pantalla Simular entrevista (la convocatoria a la que se postula). Vive
aquí y no en una de ellas para que ninguna importe de la otra.
"""

from __future__ import annotations

from rest_framework import serializers

from integrations.documentos.extractor import EXTENSIONES_SOPORTADAS, extraer

#: Tope de tamaño del archivo, verificado **antes** de parsearlo. Un CV de dos
#: páginas pesa unos cientos de kilobytes; dos megas admiten con holgura uno con
#: una foto y a la vez impiden que un archivo de cien megas ocupe la memoria del
#: worker mientras se abre. El tope de páginas se comprueba aparte, al abrir el
#: documento, porque contarlas exige haberlo abierto.
MAXIMO_BYTES = 2 * 1024 * 1024

def validar_archivo(archivo):
    """Formato y peso.

    El formato se comprueba con la misma lista que usa el extractor, pero aquí,
    antes de abrir el archivo: rechazar una imagen de inmediato y con su motivo
    es más útil que fingir un análisis.
    """
    nombre = archivo.name.lower()
    if not nombre.endswith(EXTENSIONES_SOPORTADAS):
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

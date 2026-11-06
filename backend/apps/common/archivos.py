"""Validación de documentos subidos (PDF/DOCX).

Hoy solo la usa el módulo de CV: la convocatoria, en el CV y al simular una
entrevista, se pega como texto (`comparar-con-oferta-en-dos-pasos`,
`convocatoria-de-entrevista-solo-texto`). Sigue en `common` porque es la regla
de qué archivo se acepta, no lógica del CV, y la próxima subida la reutiliza.
"""

from __future__ import annotations

from rest_framework import serializers

from integrations.documentos.extractor import EXTENSIONES_SOPORTADAS

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

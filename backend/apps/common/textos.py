"""Huella de un texto, compartida por las cachés de análisis (CV y convocatoria)."""

from __future__ import annotations

import hashlib


def hash_de_texto(texto: str) -> str:
    """Huella del texto, para reconocer un contenido ya analizado.

    Se calcula sobre el texto y no sobre los bytes del archivo a propósito:
    reexportar el mismo CV desde Word produce bytes distintos y texto idéntico.
    Lo que interesa es si hay algo nuevo que analizar.

    Un texto vacío —el caso de "sin convocatoria"— devuelve el hash de la cadena
    vacía, que es un valor válido y no NULL. Eso es deliberado: ver la nota en
    `Curriculum.hash_convocatoria`.

    **No cambiar la normalización** (`strip` y UTF-8): las huellas guardadas en
    `Curriculum` y `Convocatoria` dejarían de coincidir y cada análisis se
    repetiría (`HuellaTest` lo fija).
    """
    return hashlib.sha256(texto.strip().encode("utf-8")).hexdigest()

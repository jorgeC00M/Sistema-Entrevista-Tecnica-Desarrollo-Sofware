"""Guardas que el código aplica a los textos libres de la IA.

Varios prompts prometen lo mismo al usuario —«este texto resume, no juzga si eres
apto»— y esa promesa la cumple el código, no el prompt. Las expresiones viven aquí
para que la lectura del CV y el veredicto de la entrevista descarten exactamente
lo mismo.
"""

from __future__ import annotations

import re
import unicodedata

#: Lo que delata un texto que juzga en vez de resumir. Se busca sobre el texto
#: sin acentos (`comparable`) y con límites de palabra, para no descartar
#: «aptitudes».
CONCLUYE_APTITUD = re.compile(
    r"\b(?:apt[oa]s?|idone\w*|calificad\w*|cualificad\w*|probabilidad\w*|porcentaje\w*"
    r"|deberias postular\w*|encajas perfectamente)\b|%"
)

#: Una nota escrita en el texto: «75/100», «sobre 100», «60 puntos». La nota la
#: calcula el sistema y se muestra al lado; un texto que la repite puede
#: contradecirla.
MENCIONA_NOTA = re.compile(r"/\s*100\b|\bsobre\s+100\b|\b\d+\s*puntos?\b|%")


def comparable(texto: str) -> str:
    """Minúsculas, sin acentos y con los espacios colapsados.

    El modelo puede devolver "Desarrollé  la API" con un espacio de más o sin la
    tilde; eso no lo vuelve inventado. Lo que sí debe coincidir son las palabras.
    """
    sin_acentos = unicodedata.normalize("NFD", texto.lower())
    sin_acentos = "".join(c for c in sin_acentos if unicodedata.category(c) != "Mn")
    return " ".join(sin_acentos.split())

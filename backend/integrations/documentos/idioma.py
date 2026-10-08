"""En qué idioma está un texto: español, inglés o no se sabe.

Sirve para un aviso concreto: un CV en español contra una convocatoria en inglés
pierde la búsqueda por palabras clave en todo lo que no sea un nombre de
tecnología. "Python" coincide en los dos idiomas; "experiencia en desarrollo de
APIs" y "API development experience" no.

Se cuentan palabras vacías —artículos, preposiciones, conjunciones—, que son las
más frecuentes de cualquier texto y casi no se comparten entre los dos idiomas.
Los nombres de tecnologías, que un CV en español escribe en inglés, no cuentan:
por eso no sirve mirar el vocabulario técnico.

No se usa una librería de detección: para dos idiomas una lista basta, no añade
dependencias y el resultado es determinista. Cuando la señal es débil se devuelve
`None` en vez de adivinar; el aviso solo se da si los dos textos se reconocen
con claridad.
"""

from __future__ import annotations

import re

from integrations.documentos.terminos import normalizar

ESPAÑOL = "es"
INGLES = "en"

# Sin las que comparten los dos idiomas ("a", "no") ni las que en uno son
# palabra vacía y en el otro sigla técnica.
_VACIAS = {
    ESPAÑOL: frozenset(
        "de la que el en y los del las por con para una un se al como mas su sus es lo "
        "este esta desde sobre entre durante mediante cada tambien donde".split()
    ),
    INGLES: frozenset(
        "the and of to in for with on at by from as is are was were an this that these "
        "my our which while using into".split()
    ),
}

#: Por debajo de esto el texto es demasiado corto para afirmar nada.
MINIMO_DE_PALABRAS_VACIAS = 8
#: Cuántas veces más frecuente debe ser un idioma que el otro.
PROPORCION_MINIMA = 2

_PALABRA = re.compile(r"[a-z]+")


def detectar(texto: str) -> str | None:
    """`"es"`, `"en"` o `None` si el texto es corto o mezcla los dos."""
    palabras = _PALABRA.findall(normalizar(texto))
    conteo = {idioma: sum(1 for p in palabras if p in vacias) for idioma, vacias in _VACIAS.items()}

    if conteo[ESPAÑOL] + conteo[INGLES] < MINIMO_DE_PALABRAS_VACIAS:
        return None
    if conteo[ESPAÑOL] >= PROPORCION_MINIMA * conteo[INGLES]:
        return ESPAÑOL
    if conteo[INGLES] >= PROPORCION_MINIMA * conteo[ESPAÑOL]:
        return INGLES
    return None


def son_distintos(texto_a: str, texto_b: str) -> bool:
    """Si los dos textos están, con claridad, en idiomas distintos."""
    idioma_a, idioma_b = detectar(texto_a), detectar(texto_b)
    return idioma_a is not None and idioma_b is not None and idioma_a != idioma_b

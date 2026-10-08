"""Lectura de una convocatoria de trabajo: qué pide, y qué de eso es obligatorio.

Una convocatoria casi siempre separa lo que exige de lo que valora, con títulos
como "Requisitos" y "Deseable". La distinción importa en el resultado: faltar un
deseable no es lo mismo que faltar un obligatorio, y mostrarlos con el mismo peso
alarmaría de más a quien revisa su CV.

Cuando el texto no distingue los dos bloques, todo cae en uno solo. No se infiere
una clasificación que el texto no sostiene — el mismo criterio con el que el resto
del módulo evita afirmar lo que no puede medir.

Además de las tecnologías se leen dos requisitos que un ATS filtra: los años de
experiencia mínimos —las "preguntas de filtro" son el único rechazo automático
real— y el cargo, que el reclutador usa como criterio de búsqueda.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from integrations.documentos.terminos import encontrar, normalizar, primer_cargo

#: Títulos que abren el bloque de lo exigido.
TITULOS_OBLIGATORIOS = (
    "requisitos",
    "requisitos obligatorios",
    "requisitos minimos",
    "requisitos excluyentes",
    "requerimientos",
    "perfil requerido",
    "que necesitamos",
    "lo que buscamos",
    "requirements",
    "must have",
    "required skills",
)

#: Títulos que abren el bloque de lo que suma pero no excluye.
TITULOS_DESEABLES = (
    "deseable",
    "deseables",
    "requisitos deseables",
    "valoramos",
    "se valorara",
    "plus",
    "opcional",
    "nice to have",
    "nice-to-have",
    "preferred",
    "preferred skills",
    "bonus",
)


@dataclass(frozen=True)
class Convocatoria:
    """Los términos que la convocatoria pide, repartidos por exigencia.

    `separada` distingue dos situaciones que el resultado debe presentar distinto:
    el texto distinguía obligatorios de deseables, o no lo hacía y todo quedó en
    `obligatorios` por convención.
    """

    obligatorios: frozenset[str] = field(default_factory=frozenset)
    deseables: frozenset[str] = field(default_factory=frozenset)
    separada: bool = False
    #: Años de experiencia exigidos, o `None` si no se piden. Solo cuentan los del
    #: bloque obligatorio: "deseable 5 años" no excluye a nadie.
    anos_requeridos: int | None = None
    #: El cargo que nombra la convocatoria, canónico, o `None`.
    cargo: str | None = None

    @property
    def tiene_requisitos(self) -> bool:
        """Si no hay ninguno, no hay brecha que calcular.

        Pasa con un texto que no es una convocatoria, o con una redactada sin
        nombrar tecnologías ("buscamos alguien proactivo"). Hay que informarlo en
        lugar de mostrar una cobertura vacía, que se leería como que el candidato
        no cumple nada.
        """
        return bool(self.obligatorios or self.deseables or self.anos_requeridos or self.cargo)


_NUMERALES = {
    "un": 1, "uno": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6,
    "siete": 7, "ocho": 8, "nueve": 9, "diez": 10, "one": 1, "two": 2, "three": 3,
    "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}
_NUMERO = rf"(\d{{1,2}}|{'|'.join(_NUMERALES)})"
_ANOS = r"(?:anos?|years?)\b"

#: Sobre texto normalizado (sin acentos): "años" llega como "anos".
_PATRONES_DE_ANOS = (
    # "mínimo 3 años", "al menos tres años", "at least 3 years"
    re.compile(
        rf"\b(?:minimo|minima|como minimo|al menos|mas de|at least|minimum(?: of)?)\s+(?:de\s+)?{_NUMERO}\s*\+?\s*{_ANOS}"
    ),
    # "3+ años", "3+ years"
    re.compile(rf"\b{_NUMERO}\s*\+\s*{_ANOS}"),
    # "3 años de experiencia", "3 o más años de experiencia", "3 years of experience"
    re.compile(rf"\b{_NUMERO}\s*(?:o mas\s+)?{_ANOS}\s+(?:o mas\s+)?(?:de\s+|of\s+)?(?:experiencia|experience)"),
)


def anos_requeridos(texto: str) -> int | None:
    """Los años de experiencia que pide el texto, o `None`.

    Si hay varias cifras se toma la mayor: "3 años de experiencia, 2 de ellos con
    Django" exige tres.
    """
    normalizado = normalizar(texto)
    cifras = [
        int(valor) if valor.isdigit() else _NUMERALES[valor]
        for patron in _PATRONES_DE_ANOS
        for valor in patron.findall(normalizado)
    ]
    return max(cifras) if cifras else None


def _clasificar(linea: str) -> str | None:
    """Devuelve 'obligatorios', 'deseables' o `None` si la línea no es un título.

    Coincidencia con la línea completa, igual que `secciones.titulo_de`: "tenemos
    requisitos exigentes" es una frase, no el encabezado de una lista.
    """
    normalizada = normalizar(linea).strip().rstrip(":").strip()
    if not normalizada:
        return None
    if normalizada in TITULOS_OBLIGATORIOS:
        return "obligatorios"
    if normalizada in TITULOS_DESEABLES:
        return "deseables"
    return None


def partir(texto: str) -> Convocatoria:
    """Extrae los términos de la convocatoria, separados por exigencia.

    Lo que precede al primer título reconocido se trata como obligatorio: en una
    convocatoria sin encabezados, la descripción del puesto es lo que se pide.
    """
    if not texto.strip():
        return Convocatoria()

    lineas = texto.splitlines()
    marcas: list[tuple[int, str]] = [
        (indice, grupo)
        for indice, linea in enumerate(lineas)
        if (grupo := _clasificar(linea)) is not None
    ]

    # El cargo se busca en todo el texto: suele estar en el título de la oferta,
    # antes de cualquier bloque.
    cargo = primer_cargo(texto)

    if not marcas:
        # Sin títulos no hay cómo separar: todo es lo que se pide, y se deja
        # constancia de que la separación no venía en el texto.
        return Convocatoria(
            obligatorios=frozenset(encontrar(texto)),
            separada=False,
            anos_requeridos=anos_requeridos(texto),
            cargo=cargo,
        )

    bloques: dict[str, list[str]] = {"obligatorios": [], "deseables": []}

    # El preámbulo —antes del primer título— describe el puesto, así que cuenta
    # como obligatorio.
    bloques["obligatorios"].extend(lineas[: marcas[0][0]])

    for posicion, (indice, grupo) in enumerate(marcas):
        fin = marcas[posicion + 1][0] if posicion + 1 < len(marcas) else len(lineas)
        bloques[grupo].extend(lineas[indice + 1 : fin])

    texto_obligatorio = "\n".join(bloques["obligatorios"])
    obligatorios = encontrar(texto_obligatorio)
    deseables = encontrar("\n".join(bloques["deseables"]))

    # Un término que aparece en los dos bloques se queda en obligatorios: es la
    # lectura prudente, y evitar el duplicado impide que la cobertura total sume
    # más requisitos de los que la convocatoria tiene.
    return Convocatoria(
        obligatorios=frozenset(obligatorios),
        deseables=frozenset(deseables - obligatorios),
        separada=True,
        anos_requeridos=anos_requeridos(texto_obligatorio),
        cargo=cargo,
    )

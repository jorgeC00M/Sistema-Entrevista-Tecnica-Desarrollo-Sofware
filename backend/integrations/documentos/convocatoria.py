"""Lectura de una convocatoria de trabajo: qué pide, y qué de eso es obligatorio.

Una convocatoria casi siempre separa lo que exige de lo que valora, con títulos
como "Requisitos" y "Deseable". La distinción importa en el resultado: faltar un
deseable no es lo mismo que faltar un obligatorio, y mostrarlos con el mismo peso
alarmaría de más a quien revisa su CV.

Cuando el texto no distingue los dos bloques, todo cae en uno solo. No se infiere
una clasificación que el texto no sostiene — el mismo criterio con el que el resto
del módulo evita afirmar lo que no puede medir.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from integrations.documentos.terminos import encontrar, normalizar

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

    @property
    def tiene_requisitos(self) -> bool:
        """Si no hay ninguno, no hay brecha que calcular.

        Pasa con un texto que no es una convocatoria, o con una redactada sin
        nombrar tecnologías ("buscamos alguien proactivo"). Hay que informarlo en
        lugar de mostrar una cobertura vacía, que se leería como que el candidato
        no cumple nada.
        """
        return bool(self.obligatorios or self.deseables)


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

    if not marcas:
        # Sin títulos no hay cómo separar: todo es lo que se pide, y se deja
        # constancia de que la separación no venía en el texto.
        return Convocatoria(obligatorios=frozenset(encontrar(texto)), separada=False)

    bloques: dict[str, list[str]] = {"obligatorios": [], "deseables": []}

    # El preámbulo —antes del primer título— describe el puesto, así que cuenta
    # como obligatorio.
    bloques["obligatorios"].extend(lineas[: marcas[0][0]])

    for posicion, (indice, grupo) in enumerate(marcas):
        fin = marcas[posicion + 1][0] if posicion + 1 < len(marcas) else len(lineas)
        bloques[grupo].extend(lineas[indice + 1 : fin])

    obligatorios = encontrar("\n".join(bloques["obligatorios"]))
    deseables = encontrar("\n".join(bloques["deseables"]))

    # Un término que aparece en los dos bloques se queda en obligatorios: es la
    # lectura prudente, y evitar el duplicado impide que la cobertura total sume
    # más requisitos de los que la convocatoria tiene.
    return Convocatoria(
        obligatorios=frozenset(obligatorios),
        deseables=frozenset(deseables - obligatorios),
        separada=True,
    )

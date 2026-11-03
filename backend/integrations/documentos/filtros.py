"""Preguntas de filtro: lo que una convocatoria exige además de las tecnologías.

Un reclutador en Bolivia filtra por tres cosas que no son tecnologías: el título
(«Titulado en Ingeniería de Sistemas»), el idioma («Inglés intermedio») y la
ubicación o modalidad («Presencial en Cochabamba»). Cada una se **lee** del bloque
obligatorio del aviso y se **comprueba** en el CV, con reglas y sin IA, igual que
los años de experiencia.

Dos reglas que definen el módulo:

- **Nunca «no cumples».** Si el CV no lo menciona, el estado es `no_aparece`: el
  candidato puede hablar inglés y no haberlo escrito, y el consejo útil es
  escribirlo. Si lo menciona pero no alcanza para decidir —un egresado frente a un
  aviso que pide titulado, un nivel más bajo—, es `no_verificable`, con una nota
  que dice qué dice cada uno.
- **Lo que no se entiende no se informa.** Un filtro que el aviso no permite
  identificar con estas reglas no aparece. Callar es mejor que inventar un
  requisito.

Agregar un filtro es una función `_<filtro>(texto_obligatorio, cv) -> Filtro | None`
y una entrada en `_FILTROS`.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass

from integrations.documentos import ubicaciones
from integrations.documentos.contacto import detectar_nombre
from integrations.documentos.secciones import encabezado_del_cv, segmentar
from integrations.documentos.terminos import normalizar

CUMPLE = "cumple"
NO_APARECE = "no_aparece"
NO_VERIFICABLE = "no_verificable"


@dataclass(frozen=True)
class Filtro:
    #: `titulo`, `idioma` o `ubicacion`.
    tipo: str
    #: Lo que pide el aviso, ya redactado para mostrar: «Inglés intermedio».
    pedido: str
    estado: str
    #: Qué se encontró en el CV, en una frase; vacía cuando cumple sin matices.
    nota: str = ""


@dataclass(frozen=True)
class _CV:
    """Lo que los filtros miran del CV, calculado una vez."""

    texto: str
    bloques: dict[str, str]
    lugares: list[str]


def _lineas(texto: str) -> list[str]:
    return [linea for linea in normalizar(texto).splitlines() if linea.strip()]


def _alguno(patrones: tuple[str, ...], texto: str) -> bool:
    return any(re.search(rf"\b{patron}\b", texto) for patron in patrones)


# --- Título -------------------------------------------------------------------

#: Palabras que piden un grado. "ingenieria" no está: es el nombre de la carrera
#: ("ingeniería de software" es una materia), no un grado.
_GRADOS = ("titulad[oa]s?", "licenciad[oa]s?", "licenciatura", "ingenier[oa]s?", "bachiller en", "egresad[oa]s?", "profesional en")
_SOLO_EGRESADO = ("egresad[oa]s?",)

#: La familia de carreras del público del sistema.
_CARRERAS = ("sistemas", "informatica", "software", "computacion", "telecomunicaciones")

_TITULADO_EN_CV = ("titulad[oa]", "licenciad[oa]", "titulo", "titulo profesional", "ingenier[oa] de", "ingenier[oa] en")
_EGRESADO_EN_CV = ("egresad[oa]",)
_ESTUDIANTE_EN_CV = ("estudiante", "cursando", "semestre", "en curso")


def _titulo(texto_obligatorio: str, cv: _CV) -> Filtro | None:
    """Un grado y una carrera **en la misma línea** del aviso.

    Exigir las dos cosas juntas es lo que distingue «Titulado en Ingeniería de
    Sistemas» de «conocimientos de ingeniería de software».
    """
    linea = next(
        (l for l in _lineas(texto_obligatorio) if _alguno(_GRADOS, l) and _alguno(_CARRERAS, l)),
        None,
    )
    if linea is None:
        return None

    # «Egresado o titulado» acepta al egresado: se pide lo menos exigente que diga.
    pide_egresado = _alguno(_SOLO_EGRESADO, linea)
    pedido = "Egresado de una carrera de sistemas o afín" if pide_egresado else "Título profesional en sistemas o afín"

    educacion = normalizar(cv.bloques.get("educacion", ""))
    if not educacion.strip():
        return Filtro("titulo", pedido, NO_APARECE, "Tu CV no tiene una sección de Educación que el ATS reconozca.")
    if not _alguno(_CARRERAS, educacion):
        return Filtro("titulo", pedido, NO_APARECE, "Tu sección de Educación no nombra una carrera de sistemas o afín.")

    if _alguno(_TITULADO_EN_CV, educacion):
        return Filtro("titulo", pedido, CUMPLE)
    if _alguno(_EGRESADO_EN_CV, educacion):
        if pide_egresado:
            return Filtro("titulo", pedido, CUMPLE)
        return Filtro("titulo", pedido, NO_VERIFICABLE, "El aviso pide título y tu CV dice egresado.")
    if _alguno(_ESTUDIANTE_EN_CV, educacion):
        return Filtro("titulo", pedido, NO_VERIFICABLE, "Tu CV dice que aún cursas la carrera.")
    return Filtro(
        "titulo",
        pedido,
        NO_VERIFICABLE,
        "Tu CV nombra la carrera pero no dice si eres egresado o titulado: escríbelo.",
    )


# --- Idioma -------------------------------------------------------------------

_IDIOMAS: dict[str, tuple[str, ...]] = {
    "Inglés": ("ingles", "english"),
    "Portugués": ("portugues", "portuguese"),
    "Francés": ("frances", "french"),
}

#: Nivel → palabras que lo nombran. El orden es el de exigencia.
_NIVELES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("básico", ("basico", "elemental", "basic", "beginner", "a1", "a2")),
    ("intermedio", ("intermedio", "intermediate", "b1", "b2")),
    ("avanzado", ("avanzado", "fluido", "fluent", "advanced", "c1", "c2")),
    ("nativo", ("nativo", "native", "bilingue", "lengua materna")),
)

#: Sin un nivel, la línea tiene que hablar del idioma como requisito: «documentación
#: en inglés» describe el trabajo, no exige nada al candidato.
_COMO_REQUISITO = ("idioma", "idiomas", "dominio", "manejo", "nivel", "conocimientos? de")


def _nivel(linea: str) -> int | None:
    for indice, (_, palabras) in enumerate(_NIVELES):
        if _alguno(palabras, linea):
            return indice
    return None


def _idiomas(texto_obligatorio: str, cv: _CV) -> list[Filtro]:
    filtros = []
    # En el CV: primero la sección Idiomas; sin ella, todo el texto.
    donde = _lineas(cv.bloques.get("idiomas") or cv.texto)

    for idioma, palabras in _IDIOMAS.items():
        linea = next((l for l in _lineas(texto_obligatorio) if _alguno(palabras, l)), None)
        if linea is None:
            continue
        requerido = _nivel(linea)
        if requerido is None and not _alguno(_COMO_REQUISITO, linea):
            continue
        pedido = idioma if requerido is None else f"{idioma} {_NIVELES[requerido][0]}"

        en_cv = next((l for l in donde if _alguno(palabras, l)), None)
        if en_cv is None:
            filtros.append(Filtro("idioma", pedido, NO_APARECE, f"Tu CV no menciona el {idioma.lower()}."))
            continue
        tiene = _nivel(en_cv)
        if requerido is None or (tiene is not None and tiene >= requerido):
            filtros.append(Filtro("idioma", pedido, CUMPLE))
        elif tiene is None:
            filtros.append(
                Filtro("idioma", pedido, NO_VERIFICABLE, f"Tu CV menciona el {idioma.lower()} sin decir tu nivel.")
            )
        else:
            filtros.append(
                Filtro(
                    "idioma",
                    pedido,
                    NO_VERIFICABLE,
                    f"Tu CV dice nivel {_NIVELES[tiene][0]}; el aviso pide {_NIVELES[requerido][0]}.",
                )
            )
    return filtros


# --- Ubicación y modalidad ----------------------------------------------------

_PRESENCIAL = ("presencial", "hibrido", "hibrida", "en oficina", "on site", "onsite", "on-site")
_LUGAR = ("ubicacion", "ubicado en", "ubicada en", "lugar de trabajo", "sede")
_SIN_LUGAR = {"Remoto"}


def _ubicacion(texto_obligatorio: str, cv: _CV) -> Filtro | None:
    """Solo un puesto presencial o híbrido con ciudad filtra por ubicación.

    Un aviso remoto no excluye a nadie por dónde vive, así que no genera filtro.
    La ciudad se busca en la línea que habla de la modalidad o del lugar, no en
    todo el aviso: la dirección de la empresa no es un requisito.
    """
    for linea in _lineas(texto_obligatorio):
        presencial = _alguno(_PRESENCIAL, linea)
        if not (presencial or _alguno(_LUGAR, linea)):
            continue
        ciudades = [lugar for lugar in ubicaciones.encontrar(linea) if lugar not in _SIN_LUGAR]
        if not ciudades:
            continue
        ciudad = ciudades[0]
        modalidad = ("Híbrido" if "hibrid" in linea else "Presencial") if presencial else "Trabajo"
        pedido = f"{modalidad} en {ciudad}"

        propios = [lugar for lugar in cv.lugares if lugar not in _SIN_LUGAR]
        if ciudad in propios:
            return Filtro("ubicacion", pedido, CUMPLE)
        if propios:
            # Puede mudarse: es un dato que el candidato aclara, no un descarte.
            return Filtro(
                "ubicacion", pedido, NO_VERIFICABLE, f"Tu CV dice {', '.join(propios)}; el puesto es en {ciudad}."
            )
        return Filtro("ubicacion", pedido, NO_APARECE, "Tu CV no dice en qué ciudad vives.")
    return None


_FILTROS: tuple[Callable[[str, _CV], Filtro | list[Filtro] | None], ...] = (_titulo, _idiomas, _ubicacion)


def preguntas_de_filtro(texto_obligatorio: str, texto_cv: str) -> tuple[Filtro, ...]:
    """Las preguntas de filtro que el aviso exige, comprobadas en el CV."""
    if not texto_obligatorio.strip():
        return ()
    cv = _CV(
        texto=texto_cv,
        bloques=segmentar(texto_cv),
        lugares=ubicaciones.del_encabezado(encabezado_del_cv(texto_cv), detectar_nombre(texto_cv)),
    )
    resultado: list[Filtro] = []
    for filtro in _FILTROS:
        salida = filtro(texto_obligatorio, cv)
        if isinstance(salida, list):
            resultado.extend(salida)
        elif salida is not None:
            resultado.append(salida)
    return tuple(resultado)

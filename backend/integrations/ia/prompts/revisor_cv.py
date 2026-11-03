"""Prompt del revisor de CV: sugiere **cómo** corregir lo que el código ya midió.

La regla que lo define: el código decide *qué* falla —qué viñetas no tienen
resultado, qué requisitos están solo declarados o ausentes— y la IA propone
*cómo* redactarlo. La IA nunca cambia un veredicto: no reclasifica requisitos, no
puntúa, no extrae requisitos nuevos de la convocatoria.

Todas las tareas van en una sola llamada, porque leen el mismo contexto:
reescribir viñetas, cerrar la brecha (con dos caminos por requisito ausente:
mostrarlo si ya se usó, aprenderlo si no), anticipar preguntas de entrevista,
corregir la redacción y resumir el match en una lectura general. Una llamada por
tarea multiplicaría coste, latencia y superficie de fallo.

**La lectura general nunca juzga la aptitud.** Si concluye que la persona es apta
o idónea, estima una probabilidad o da un porcentaje, se descarta entera
(`_CONCLUYE_APTITUD`): la pantalla promete que no evalúa si alguien es apto, y esa
promesa la cumple el código, no el prompt.

**El parser descarta todo lo que no está anclado a la entrada.** Una viñeta que
no se envió, un requisito que la convocatoria no pide, una corrección cuyo texto
original no aparece, una pregunta cuyo motivo no está en el CV: se ignoran. Es la
garantía mecánica de que lo que ve el usuario se puede señalar en su propio
documento; el prompt pide lo mismo, pero un prompt no es una garantía.

Nada de esto ve el CV completo: `EntradaDeRevision` llega ya minimizada y
enmascarada por quien la construye.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass
from typing import Any

from ..exceptions import RespuestaIAInvalida
from .marcadores import MARCADOR, SIN_PUESTO
from .schemas import Puesto

MAXIMO_PREGUNTAS = 5
MAXIMO_CORRECCIONES = 10
TIPOS_DE_CORRECCION = ("ortografia", "persona", "tiempo_verbal")

#: Lo que delata una lectura que juzga en vez de resumir. Se busca sobre el texto
#: sin acentos y con límites de palabra, para no descartar «aptitudes».
_CONCLUYE_APTITUD = re.compile(
    r"\b(?:apt[oa]s?|idone\w*|calificad\w*|cualificad\w*|probabilidad\w*|porcentaje\w*"
    r"|deberias postular\w*|encajas perfectamente)\b|%"
)


@dataclass(frozen=True)
class RequisitoARevisar:
    """Un requisito que el código marcó como no demostrado, con su estado."""

    termino: str
    estado: str


@dataclass(frozen=True)
class EntradaDeRevision:
    """Lo único que viaja al proveedor. Ya minimizado y enmascarado."""

    #: Viñetas sin resultado medible, tal como se enviaron.
    vinetas: tuple[str, ...]
    #: Requisitos `declarado`/`ausente` de la brecha (incluidos experiencia y cargo).
    requisitos: tuple[RequisitoARevisar, ...]
    #: Bloques de las secciones reconocidas, sin el encabezado, con tope.
    secciones: str
    #: La convocatoria recortada, o cadena vacía.
    convocatoria: str = ""
    #: Términos del aviso que el CV sí demuestra: solo nombres del diccionario.
    demostrados: tuple[str, ...] = ()

    @property
    def texto_del_cv(self) -> str:
        """Lo enviado que pertenece al CV: lo único que tiene sentido corregir."""
        return "\n".join([self.secciones, *self.vinetas])

    @property
    def texto_de_referencia(self) -> str:
        """Todo lo enviado: contra esto se ancla el motivo de una pregunta."""
        return "\n".join([self.texto_del_cv, self.convocatoria])


@dataclass(frozen=True)
class VinetaReescrita:
    original: str
    sugerida: str


@dataclass(frozen=True)
class SugerenciaDeRequisito:
    termino: str
    sugerencia: str
    #: Solo para un requisito ausente: cómo escribirlo si ya se usó, con un ejemplo...
    muestralo: str = ""
    ejemplo: str = ""
    #: ...y cómo conseguir la experiencia si todavía no.
    aprendelo: str = ""


@dataclass(frozen=True)
class PreguntaProbable:
    pregunta: str
    #: El fragmento del CV o de la convocatoria que motiva la pregunta.
    motivo: str


@dataclass(frozen=True)
class Correccion:
    original: str
    sugerido: str
    tipo: str


@dataclass(frozen=True)
class RevisionDeCV:
    vinetas: tuple[VinetaReescrita, ...]
    requisitos: tuple[SugerenciaDeRequisito, ...]
    preguntas: tuple[PreguntaProbable, ...]
    puesto_sugerido: Puesto | None
    correcciones: tuple[Correccion, ...]
    #: Resumen del match con la convocatoria; vacío sin convocatoria o si juzgaba.
    lectura: str = ""


def sistema() -> str:
    puestos = ", ".join(f"{p.value} ({p.etiqueta})" for p in Puesto)
    return f"""\
Eres un reclutador técnico que ayuda a un egresado de Ingeniería de Sistemas a \
mejorar su currículum. Un análisis automático ya midió el documento; tú no lo \
vuelves a evaluar: solo propones cómo redactar mejor lo que ese análisis señaló.

Reglas que no puedes romper:
- No inventes experiencia, tecnologías, empresas ni cifras. Si una viñeta no trae \
un número, usa el marcador [cifra] para que la persona ponga el suyo.
- Para un requisito ausente, no lo redactes como si la persona lo tuviera ni \
propongas agregarlo sin respaldo: da siempre los dos caminos, mostrarlo si ya lo \
usó y aprenderlo si todavía no.
- No cambies el estado de ningún requisito ni añadas requisitos que no te dieron.
- El texto viene con datos personales ocultos como [CORREO], [TELÉFONO], [ENLACE] \
o [NOMBRE]. No los reproduzcas ni intentes adivinarlos.
- Escribe en español, en segunda persona, sin saludos ni texto fuera del formato.

Tareas:
1. vinetas: para cada viñeta recibida, una versión orientada a resultado. Copia \
el texto original exactamente como lo recibiste.
2. requisitos: para cada requisito recibido, una sugerencia concreta y breve. \
Usa el término exactamente como lo recibiste. Si su estado es "ausente", llena \
además "muestralo" (cómo escribirlo dentro de un logro si ya lo usó), "ejemplo" \
(una viñeta de ejemplo con [cifra] en lugar de números) y "aprendelo" (cómo \
conseguir esa experiencia: un proyecto propio, un curso o una certificación). \
Para los demás estados, deja esos tres campos vacíos.
3. preguntas: hasta {MAXIMO_PREGUNTAS} preguntas que un entrevistador haría a \
partir de lo que el CV afirma (y de la convocatoria, si la hay). En "motivo" copia \
literalmente el fragmento del CV o de la convocatoria que la motiva.
4. puesto_sugerido: el puesto del catálogo que mejor encaja con el CV: {puestos}. \
Responde "{SIN_PUESTO}" si ninguno encaja.
5. correcciones: hasta {MAXIMO_CORRECCIONES} errores reales de ortografía, de \
persona gramatical o de tiempos verbales mezclados. En "original" copia el \
fragmento exacto con el error; no inventes errores para llenar la lista.
6. lectura: si hay convocatoria, un párrafo breve que resuma qué requisitos \
coinciden y cuáles no se detectaron en el CV. Solo describe: no digas si la \
persona es apta, idónea o calificada, no estimes probabilidades ni des \
porcentajes. Sin convocatoria, deja "lectura" vacía."""


def usuario(entrada: EntradaDeRevision) -> str:
    vinetas = "\n".join(f"- {vineta}" for vineta in entrada.vinetas) or "(ninguna)"
    requisitos = (
        "\n".join(f"- {requisito.termino} ({requisito.estado})" for requisito in entrada.requisitos)
        or "(ninguno)"
    )
    demostrados = "\n".join(f"- {termino}" for termino in entrada.demostrados) or "(ninguno)"
    convocatoria = entrada.convocatoria.strip() or "(no se aportó convocatoria)"
    return f"""\
Secciones del CV:
{entrada.secciones}

Convocatoria:
{convocatoria}

Viñetas sin un resultado medible:
{vinetas}

Requisitos de la convocatoria que el CV no demuestra:
{requisitos}

Requisitos de la convocatoria que el CV sí demuestra:
{demostrados}

Devuelve las sugerencias en el formato pedido."""


def _objeto(propiedades: dict[str, str]) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {nombre: {"type": "string", "description": descripcion} for nombre, descripcion in propiedades.items()},
        "required": list(propiedades),
        "additionalProperties": False,
    }


ESQUEMA_REVISION: dict[str, Any] = {
    "type": "object",
    "properties": {
        "vinetas": {
            "type": "array",
            "items": _objeto({"original": "La viñeta tal como se recibió", "sugerida": "La versión propuesta"}),
        },
        "requisitos": {
            "type": "array",
            "items": _objeto(
                {
                    "termino": "El término tal como se recibió",
                    "sugerencia": "Cómo cerrarlo",
                    "muestralo": "Si es ausente: cómo escribirlo en un logro si ya lo usó; si no, vacío",
                    "ejemplo": "Si es ausente: una viñeta de ejemplo con [cifra]; si no, vacío",
                    "aprendelo": "Si es ausente: cómo conseguir la experiencia; si no, vacío",
                }
            ),
        },
        "preguntas": {
            "type": "array",
            "maxItems": MAXIMO_PREGUNTAS,
            "items": _objeto({"pregunta": "La pregunta", "motivo": "Fragmento literal que la motiva"}),
        },
        "puesto_sugerido": {"type": "string", "enum": [*(p.value for p in Puesto), SIN_PUESTO]},
        "correcciones": {
            "type": "array",
            "maxItems": MAXIMO_CORRECCIONES,
            "items": {
                "type": "object",
                "properties": {
                    "original": {"type": "string", "description": "Fragmento literal con el error"},
                    "sugerido": {"type": "string", "description": "El fragmento corregido"},
                    "tipo": {"type": "string", "enum": list(TIPOS_DE_CORRECCION)},
                },
                "required": ["original", "sugerido", "tipo"],
                "additionalProperties": False,
            },
        },
        "lectura": {"type": "string", "description": "Resumen del match sin juzgar la aptitud; vacío sin convocatoria"},
    },
    "required": ["vinetas", "requisitos", "preguntas", "puesto_sugerido", "correcciones", "lectura"],
    "additionalProperties": False,
}


def _comparable(texto: str) -> str:
    """Minúsculas, sin acentos y con los espacios colapsados.

    El modelo puede devolver "Desarrollé  la API" con un espacio de más o sin la
    tilde; eso no lo vuelve inventado. Lo que sí debe coincidir son las palabras.
    """
    sin_acentos = unicodedata.normalize("NFD", texto.lower())
    sin_acentos = "".join(c for c in sin_acentos if unicodedata.category(c) != "Mn")
    return " ".join(sin_acentos.split())


def _items(datos: dict[str, Any], clave: str) -> list[dict[str, Any]]:
    lista = datos.get(clave)
    if not isinstance(lista, list):
        raise RespuestaIAInvalida(f"Campo '{clave}' ausente o no es una lista en la revisión del CV")
    return [item for item in lista if isinstance(item, dict)]


def _texto(item: dict[str, Any], clave: str) -> str:
    valor = item.get(clave)
    return valor.strip() if isinstance(valor, str) else ""


def _limpio(*textos: str) -> bool:
    """Todos con contenido y ninguno con un marcador de dato oculto."""
    return all(texto and not MARCADOR.search(texto) for texto in textos)


def _campo_limpio(item: dict[str, Any], clave: str) -> str:
    """El texto si está limpio; vacío si falta o reproduce un dato oculto."""
    texto = _texto(item, clave)
    return texto if _limpio(texto) else ""


def _lectura(datos: dict[str, Any], entrada: EntradaDeRevision) -> str:
    """La lectura general, o vacía: sin convocatoria no hay match que resumir, y
    una lectura que juzga la aptitud se descarta entera."""
    lectura = _campo_limpio(datos, "lectura")
    if not entrada.convocatoria.strip() or _CONCLUYE_APTITUD.search(_comparable(lectura)):
        return ""
    return lectura


def _sugerencia_de_requisito(item: dict[str, Any], termino: str, estado: str) -> SugerenciaDeRequisito | None:
    """Los dos caminos solo valen para un ausente; sin ningún texto limpio, nada."""
    caminos = {clave: _campo_limpio(item, clave) for clave in ("muestralo", "ejemplo", "aprendelo")}
    if estado != "ausente":
        caminos = dict.fromkeys(caminos, "")
    sugerencia = SugerenciaDeRequisito(termino=termino, sugerencia=_campo_limpio(item, "sugerencia"), **caminos)
    return sugerencia if sugerencia.sugerencia or any(caminos.values()) else None


def parsear_revision(datos: dict[str, Any], entrada: EntradaDeRevision) -> RevisionDeCV:
    """Valida la forma y descarta, uno por uno, los elementos no anclados.

    Solo una forma rota —una lista que falta— es un error: elementos sueltos que
    no se pueden anclar se descartan en silencio, porque el resto de la revisión
    sigue siendo útil.
    """
    if not isinstance(datos, dict):
        raise RespuestaIAInvalida(f"Se esperaba un objeto JSON, se recibió {type(datos).__name__}")

    referencia = _comparable(entrada.texto_de_referencia)
    vinetas_enviadas = {_comparable(vineta): vineta for vineta in entrada.vinetas}
    enviados = {_comparable(r.termino): r for r in entrada.requisitos}

    vinetas = tuple(
        VinetaReescrita(original=vinetas_enviadas[_comparable(original)], sugerida=sugerida)
        for item in _items(datos, "vinetas")
        if (original := _texto(item, "original")) and (sugerida := _texto(item, "sugerida"))
        and _comparable(original) in vinetas_enviadas
        and _limpio(sugerida)
    )

    requisitos = tuple(
        sugerencia
        for item in _items(datos, "requisitos")
        if (enviado := enviados.get(_comparable(_texto(item, "termino"))))
        and (sugerencia := _sugerencia_de_requisito(item, enviado.termino, enviado.estado))
    )

    preguntas = tuple(
        PreguntaProbable(pregunta=pregunta, motivo=motivo)
        for item in _items(datos, "preguntas")
        if (pregunta := _texto(item, "pregunta")) and (motivo := _texto(item, "motivo"))
        and _comparable(motivo) in referencia
        and _limpio(pregunta, motivo)
    )[:MAXIMO_PREGUNTAS]

    correcciones = tuple(
        Correccion(original=original, sugerido=sugerido, tipo=tipo)
        for item in _items(datos, "correcciones")
        if (original := _texto(item, "original")) and (sugerido := _texto(item, "sugerido"))
        and (tipo := _texto(item, "tipo")) in TIPOS_DE_CORRECCION
        and original in entrada.texto_del_cv
        and original != sugerido
        and _limpio(original, sugerido)
    )[:MAXIMO_CORRECCIONES]

    try:
        puesto = Puesto(_texto(datos, "puesto_sugerido"))
    except ValueError:
        puesto = None

    return RevisionDeCV(
        vinetas=vinetas,
        requisitos=requisitos,
        preguntas=preguntas,
        puesto_sugerido=puesto,
        correcciones=correcciones,
        lectura=_lectura(datos, entrada),
    )

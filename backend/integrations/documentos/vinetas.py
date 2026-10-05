"""Viñetas que describen un resultado frente a las que describen una tarea.

**Esto no es una verificación de ATS**, y quien presente el resultado tiene que
rotularlo aparte. A un ATS le da exactamente igual si una viñeta trae métricas: su
trabajo es indexar el texto. Esto concierne a la persona que lee el currículum
*después* de que la máquina lo encontró, y son dos etapas distintas.

Se incluye porque es la única crítica de contenido que no necesita referencia
externa: no hace falta saber a qué puesto se postula para notar que "Encargado del
módulo de pagos" dice menos que "Reduje la latencia de pagos 40%".

**Su límite:** detecta *si hay* una métrica, no si es significativa. "Trabajé con
2 personas" cuenta como cifra. Es el techo de lo que se puede afirmar sin emitir un
juicio, y conviene no presentarlo como más de lo que es.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from integrations.documentos.terminos import normalizar

#: Marcas de viñeta más habituales. Se excluye el guion de apertura cuando va
#: seguido de otro guion (líneas decorativas tipo "---").
_VINETA = re.compile(r"^\s*(?:[-•*·▪◦‣]|\d+[.)])\s+(?!-)(?P<texto>.+)$")

#: Una cifra que no sea un año: los años abundan en las fechas de cada empleo y
#: contarlos como resultado daría por bueno casi cualquier viñeta.
_CIFRA = re.compile(r"(?<!\d)(?!19\d{2}|20\d{2})\d+(?:[.,]\d+)?\s*(?:%|k|m|mil|millones)?", re.IGNORECASE)
_PORCENTAJE = re.compile(r"\d+(?:[.,]\d+)?\s*%")

#: Aperturas que describen el puesto en lugar de lo logrado en él.
MARCOS_DE_RESPONSABILIDAD = (
    "encargado de",
    "encargada de",
    "responsable de",
    "a cargo de",
    "participe en",
    "participacion en",
    "apoye en",
    "apoyo en",
    "ayude a",
    "colabore en",
    "mis funciones",
    "mis tareas",
    "funciones:",
    "tareas:",
    "responsible for",
    "in charge of",
    "assisted with",
    "helped with",
    "worked on",
)


@dataclass(frozen=True)
class Vineta:
    texto: str
    #: Trae una cifra o un porcentaje que cuantifica el resultado.
    con_metrica: bool
    #: Abre describiendo la responsabilidad en lugar de lo conseguido.
    marco_de_tarea: bool

    @property
    def es_logro(self) -> bool:
        """Una viñeta cuenta como logro si cuantifica algo y no se limita a
        enunciar la responsabilidad.

        El criterio es conservador: con una cifra pero abriendo con "encargado
        de", sigue describiendo el puesto. Es justo el caso que hay que señalar.
        """
        return self.con_metrica and not self.marco_de_tarea


@dataclass(frozen=True)
class Vinetas:
    todas: tuple[Vineta, ...]

    @property
    def total(self) -> int:
        return len(self.todas)

    @property
    def logros(self) -> int:
        return sum(1 for vineta in self.todas if vineta.es_logro)

    @property
    def proporcion(self) -> str:
        """En texto, por lo mismo que `parseabilidad` y `cobertura`."""
        return f"{self.logros}/{self.total}"

    @property
    def sin_resultado(self) -> tuple[Vineta, ...]:
        """Las que hay que reescribir. Se devuelven para mostrarlas como ejemplo:
        señalar un conteo sin enseñar cuáles deja al usuario adivinando."""
        return tuple(vineta for vineta in self.todas if not vineta.es_logro)


def evaluar(texto: str) -> Vinetas:
    """Clasifica las viñetas del currículum.

    Si el CV no usa viñetas —algunos redactan en párrafos— el total es cero y
    quien presente el resultado debe omitir la sección en lugar de mostrar "0/0".
    """
    vinetas: list[Vineta] = []

    for linea in texto.splitlines():
        coincidencia = _VINETA.match(linea)
        if coincidencia is None:
            continue

        contenido = coincidencia.group("texto").strip()
        if len(contenido) < 15:
            # Una viñeta muy corta es un elemento de lista de habilidades
            # ("Python", "Docker"), no la descripción de una tarea. Juzgarla como
            # viñeta de experiencia marcaría cada tecnología como "sin resultado".
            continue

        normalizado = normalizar(contenido)
        vinetas.append(
            Vineta(
                texto=contenido,
                con_metrica=bool(_PORCENTAJE.search(contenido) or _CIFRA.search(contenido)),
                marco_de_tarea=any(
                    normalizado.startswith(marco) for marco in MARCOS_DE_RESPONSABILIDAD
                )
                or any(f" {marco}" in normalizado for marco in ("mis funciones", "mis tareas")),
            )
        )

    return Vinetas(todas=tuple(vinetas))

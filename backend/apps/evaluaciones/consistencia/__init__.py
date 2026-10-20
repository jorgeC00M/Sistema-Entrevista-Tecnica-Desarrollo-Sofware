"""Medición test–retest del evaluador.

Evalúa K veces cada respuesta de un conjunto fijo y cuenta cuánto varía la
nota. Es la evidencia empírica de qué tan estable es la calificación: no se
supone que el modelo sea determinista, se mide.

Vive aparte del comando de gestión para poder probarla sin capturar salida, y
no toca el ORM: ni crea entrevistas ni guarda evaluaciones.
"""

from __future__ import annotations

import json
import statistics
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from integrations.ia.base import ProveedorIA
from integrations.ia.exceptions import ErrorProveedorIA
from integrations.ia.prompts.schemas import (
    AreaTecnica,
    ContextoDeEntrevista,
    Nivel,
    Puesto,
)

from ..rubricas import banda_de, puntuacion_de

RUTA_CASOS = Path(__file__).with_name("casos.json")
REPETICIONES_MINIMAS = 2


@dataclass(frozen=True)
class Caso:
    id: str
    contexto: ContextoDeEntrevista
    area: AreaTecnica
    pregunta: str
    respuesta: str
    banda_esperada: str


@dataclass(frozen=True)
class ResultadoDeCaso:
    caso: Caso
    notas: tuple[int, ...]
    fallos: int

    @property
    def media(self) -> float | None:
        return statistics.fmean(self.notas) if self.notas else None

    @property
    def desviacion(self) -> float | None:
        # Desviación muestral: K repeticiones son una muestra de lo que el
        # evaluador podría devolver, no la población entera.
        return statistics.stdev(self.notas) if len(self.notas) >= 2 else None

    @property
    def banda_modal(self) -> str | None:
        if not self.notas:
            return None
        return Counter(banda_de(n).codigo for n in self.notas).most_common(1)[0][0]

    @property
    def coincidencia_de_banda(self) -> float | None:
        """Fracción de repeticiones que caen en la banda más frecuente."""
        if not self.notas:
            return None
        bandas = Counter(banda_de(n).codigo for n in self.notas)
        return bandas.most_common(1)[0][1] / len(self.notas)


def cargar_casos(ruta: Path = RUTA_CASOS) -> list[Caso]:
    with open(ruta, encoding="utf-8") as archivo:
        crudos = json.load(archivo)
    return [
        Caso(
            id=c["id"],
            contexto=ContextoDeEntrevista(
                puesto=Puesto(c["puesto"]),
                nivel=Nivel(c["nivel"]),
                tecnologia=c["tecnologia"],
            ),
            area=AreaTecnica(c["area"]),
            pregunta=c["pregunta"],
            respuesta=c["respuesta"],
            banda_esperada=c["banda_esperada"],
        )
        for c in crudos
    ]


def medir(proveedor: ProveedorIA, repeticiones: int, casos: list[Caso] | None = None) -> list[ResultadoDeCaso]:
    if repeticiones < REPETICIONES_MINIMAS:
        raise ValueError(
            f"Se necesitan al menos {REPETICIONES_MINIMAS} repeticiones para medir variación "
            f"(se pidieron {repeticiones})."
        )

    resultados = []
    for caso in casos if casos is not None else cargar_casos():
        notas, fallos = [], 0
        for _ in range(repeticiones):
            try:
                evaluacion = proveedor.evaluar_respuesta(caso.contexto, caso.area, caso.pregunta, caso.respuesta)
            except ErrorProveedorIA:
                # Un fallo del proveedor no es una nota distinta: se cuenta
                # aparte para no confundir disponibilidad con consistencia.
                fallos += 1
                continue
            notas.append(puntuacion_de(evaluacion.niveles))
        resultados.append(ResultadoDeCaso(caso=caso, notas=tuple(notas), fallos=fallos))
    return resultados

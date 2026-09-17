"""Interpretación de una puntuación según la rúbrica.

El texto de la rúbrica que se le envía al proveedor vive en
`integrations.ia.prompts.evaluador` y se importa desde allí: la dirección de
la dependencia es apps -> integrations, nunca al revés, porque esa capa no
puede conocer Django.

Lo que añade este módulo son las bandas como dato consultable, para que el
backend, el admin y el frontend coincidan en qué es una puntuación buena en
vez de repetir los mismos umbrales en tres sitios.
"""

from __future__ import annotations

from dataclasses import dataclass

from integrations.ia.prompts.evaluador import RUBRICA

__all__ = ["RUBRICA", "BANDAS", "Banda", "banda_de"]


@dataclass(frozen=True)
class Banda:
    codigo: str
    etiqueta: str
    minimo: int
    maximo: int

    def contiene(self, puntuacion: int) -> bool:
        return self.minimo <= puntuacion <= self.maximo


BANDAS: tuple[Banda, ...] = (
    Banda("insuficiente", "Insuficiente", 0, 40),
    Banda("en_desarrollo", "En desarrollo", 41, 60),
    Banda("aceptable", "Aceptable", 61, 80),
    Banda("solido", "Sólido", 81, 100),
)


def banda_de(puntuacion: int) -> Banda:
    for banda in BANDAS:
        if banda.contiene(puntuacion):
            return banda
    raise ValueError(f"Puntuación fuera de rango 0-100: {puntuacion!r}")

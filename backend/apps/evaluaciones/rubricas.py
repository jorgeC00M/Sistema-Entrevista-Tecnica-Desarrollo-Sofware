"""Interpretación de una puntuación según la rúbrica.

El texto de la rúbrica que se le envía al proveedor vive en
`integrations.ia.prompts.evaluador` y se importa desde allí: la dirección de
la dependencia es apps -> integrations, nunca al revés, porque esa capa no
puede conocer Django.

Lo que añade este módulo son las bandas como dato consultable, para que el
backend, el admin y el frontend coincidan en qué es una puntuación buena en
vez de repetir los mismos umbrales en tres sitios — y la fórmula que convierte
los niveles del evaluador en esa puntuación.

La fórmula vive aquí y no en la capa de IA porque los pesos son una decisión
de evaluación del sistema, no parte del contrato con el proveedor: el modelo
clasifica cada criterio en un nivel; la nota la calcula la aplicación.

    P = 100 · Σ(w_c · n_c) / (NIVEL_MAXIMO · Σ w_c)

Con pesos iguales, P = 100 · (n_correccion + n_completitud + n_claridad) / 12.
La suma de niveles va de 0 a 12, así que solo hay 13 notas posibles por
respuesta; 100·S/12 nunca termina en ,5, por lo que el redondeo no es ambiguo.
"""

from __future__ import annotations

from dataclasses import dataclass

from integrations.ia.prompts.evaluador import DESCRIPTORES, NOMBRES_DE_CRITERIOS, RUBRICA
from integrations.ia.prompts.schemas import CRITERIOS, NIVEL_MAXIMO, Niveles

__all__ = [
    "BANDAS",
    "CRITERIOS",
    "DESCRIPTORES",
    "NIVEL_MAXIMO",
    "NOMBRES_DE_CRITERIOS",
    "PESOS",
    "RUBRICA",
    "VERSION_DE_RUBRICA",
    "Banda",
    "banda_de",
    "puntuacion_de",
]

# Iguales: la rúbrica declara "tres criterios de igual peso", y nada en el
# perfil del proyecto justifica que uno valga más que otro. Son dato y no una
# constante enterrada en la fórmula para que cada evaluación guarde con qué
# pesos se calculó.
PESOS: dict[str, int] = {criterio: 1 for criterio in CRITERIOS}

# Se guarda en cada evaluación. La versión 1 es la anterior, en la que el modelo
# escribía directamente un 0-100; esas evaluaciones no tienen niveles.
VERSION_DE_RUBRICA = 2


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


def puntuacion_de(niveles: Niveles | dict[str, int], pesos: dict[str, int] | None = None) -> int:
    """La nota 0-100 de una respuesta a partir de sus niveles por criterio."""
    pesos = PESOS if pesos is None else pesos
    valores = niveles.como_dict() if isinstance(niveles, Niveles) else niveles
    ponderada = sum(pesos[c] * valores[c] for c in CRITERIOS)
    return round(100 * ponderada / (NIVEL_MAXIMO * sum(pesos[c] for c in CRITERIOS)))


def rubrica_publica() -> dict:
    """La rúbrica con la que se califica, tal como la recibe el evaluador.

    Se publica en el catálogo para que el reporte explique cada nota con los
    mismos descriptores que leyó el modelo, sin copiarlos en el frontend.
    """
    return {
        "nivel_maximo": NIVEL_MAXIMO,
        "criterios": [
            {
                "codigo": criterio,
                "nombre": NOMBRES_DE_CRITERIOS[criterio],
                "peso": PESOS[criterio],
                "descriptores": list(DESCRIPTORES[criterio]),
            }
            for criterio in CRITERIOS
        ],
    }

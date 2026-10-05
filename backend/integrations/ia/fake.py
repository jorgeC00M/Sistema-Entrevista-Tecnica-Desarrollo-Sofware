"""Proveedor determinista para pruebas y desarrollo del flujo sin consumir cuota."""

from __future__ import annotations

from collections.abc import Sequence

from .base import ProveedorIA
from .exceptions import ErrorTransitorio
from .prompts.schemas import (
    AreaTecnica,
    ContextoDeEntrevista,
    Evaluacion,
    Pregunta,
    TemaEvaluado,
    parsear_evaluacion,
    parsear_pregunta,
    parsear_preguntas,
)


class FakeProveedorIA(ProveedorIA):
    """Genera preguntas y evaluaciones fijas, sin red ni cuota.

    `fallar_en` simula una caída del proveedor en una llamada concreta —
    contando generación y evaluación por igual, en el orden en que ocurren —
    para probar reintentos e idempotencia sin depender de un fallo real.
    """

    nombre = "fake"
    modelo = "fake-1"

    def __init__(self, fallar_en: int | None = None):
        self._fallar_en = fallar_en
        self._llamadas = 0

    def _contar_llamada(self) -> None:
        self._llamadas += 1
        if self._fallar_en is not None and self._llamadas == self._fallar_en:
            raise ErrorTransitorio(f"Fallo simulado en la llamada #{self._llamadas}")

    def _texto(
        self, contexto: ContextoDeEntrevista, area: AreaTecnica, numero: int
    ) -> str:
        # El área va en el texto para que los tests puedan comprobar que una
        # entrevista recorrió los temas que el puesto manda, sin pedirle nada a
        # un proveedor real.
        return (
            f"[{contexto.puesto.etiqueta}/{contexto.nivel.etiqueta}]"
            f"[{area.etiqueta}] Pregunta simulada #{numero}"
        )

    def generar_preguntas_iniciales(
        self, contexto: ContextoDeEntrevista, areas: Sequence[AreaTecnica]
    ) -> list[Pregunta]:
        # Una sola llamada para todas, igual que un proveedor real: es lo que
        # hace que `fallar_en` cuente lo mismo aquí y allá.
        self._contar_llamada()
        return parsear_preguntas(
            {
                "preguntas": [
                    {"pregunta": self._texto(contexto, area, numero)}
                    for numero, area in enumerate(areas, start=1)
                ]
            },
            desde_numero=1,
            cuantas=len(areas),
        )

    def generar_pregunta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        numero: int,
        previas: list[TemaEvaluado],
    ) -> Pregunta:
        self._contar_llamada()
        return parsear_pregunta(
            {"pregunta": self._texto(contexto, area, numero)}, numero=numero
        )

    def evaluar_respuesta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        pregunta: str,
        respuesta: str,
    ) -> Evaluacion:
        self._contar_llamada()
        return parsear_evaluacion(
            {
                "puntuacion": 75,
                "fortalezas": "Respuesta simulada con estructura adecuada.",
                "debilidades": "Faltan detalles técnicos.",
                "sugerencias": "Profundiza con un ejemplo concreto.",
            }
        )

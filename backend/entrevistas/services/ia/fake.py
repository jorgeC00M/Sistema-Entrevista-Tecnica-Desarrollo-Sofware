"""Proveedor determinista para pruebas y desarrollo del flujo sin consumir cuota."""

from __future__ import annotations

from .base import ProveedorIA
from .errores import ErrorTransitorio
from .schemas import (
    AreaTecnica,
    Evaluacion,
    Nivel,
    Pregunta,
    TemaEvaluado,
    parsear_evaluacion,
    parsear_pregunta,
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

    def generar_pregunta(
        self, area: AreaTecnica, nivel: Nivel, numero: int, previas: list[TemaEvaluado]
    ) -> Pregunta:
        self._contar_llamada()
        return parsear_pregunta(
            {"pregunta": f"[{area.etiqueta}/{nivel.etiqueta}] Pregunta simulada #{numero}"},
            numero=numero,
        )

    def evaluar_respuesta(
        self, area: AreaTecnica, nivel: Nivel, pregunta: str, respuesta: str
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

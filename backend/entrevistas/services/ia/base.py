"""Interfaz que desacopla el flujo de entrevista del proveedor de IA concreto."""

from __future__ import annotations

from abc import ABC, abstractmethod

from .schemas import AreaTecnica, Evaluacion, Nivel, Pregunta, TemaEvaluado


class ProveedorIA(ABC):
    nombre: str
    modelo: str

    @abstractmethod
    def generar_pregunta(
        self, area: AreaTecnica, nivel: Nivel, numero: int, previas: list[TemaEvaluado]
    ) -> Pregunta:
        """Genera la pregunta `numero` de la entrevista.

        `previas` es un resumen comprimido (tema + puntuación) de los turnos ya
        respondidos, no el historial completo: es lo que le permite al
        entrevistador no repetir temas sin que el prompt crezca con la
        longitud de la entrevista.
        """

    @abstractmethod
    def evaluar_respuesta(
        self, area: AreaTecnica, nivel: Nivel, pregunta: str, respuesta: str
    ) -> Evaluacion:
        """Califica una respuesta según la rúbrica del evaluador.

        Función pura respecto a la entrevista: la misma pregunta y respuesta
        producen la misma evaluación sin importar en qué entrevista
        ocurrieron. No recibe historial porque no lo necesita.
        """

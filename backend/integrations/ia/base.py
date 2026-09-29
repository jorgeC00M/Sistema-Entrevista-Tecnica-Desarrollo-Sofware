"""Interfaz que desacopla el flujo de entrevista del proveedor de IA concreto."""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Any

from .exceptions import RespuestaIAInvalida
from .prompts import entrevistador, evaluador
from .prompts.schemas import (
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    Evaluacion,
    Nivel,
    Pregunta,
    TemaEvaluado,
    parsear_evaluacion,
    parsear_pregunta,
)


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


class ProveedorIAporJSON(ProveedorIA):
    """Base de los proveedores que piden JSON estructurado a un modelo.

    Ambas operaciones del contrato son la misma secuencia —armar el prompt,
    pedir JSON, parsear al esquema— y solo cambia *cómo* se le pide el JSON a
    cada SDK. Eso es lo único que queda abstracto (`_pedir_json`).

    Existe porque antes estas dos funciones estaban duplicadas carácter por
    carácter entre los adaptadores, y por esa vía divergieron: uno acabó con
    timeout y reintentos y el otro sin ellos. Aquí un arreglo vale para todos.
    """

    def generar_pregunta(
        self, area: AreaTecnica, nivel: Nivel, numero: int, previas: list[TemaEvaluado]
    ) -> Pregunta:
        datos = self._pedir_json(
            sistema=entrevistador.sistema(area, nivel, PREGUNTAS_POR_ENTREVISTA),
            entrada=entrevistador.usuario(numero, previas),
            esquema=entrevistador.ESQUEMA_PREGUNTA,
        )
        return parsear_pregunta(datos, numero=numero)

    def evaluar_respuesta(
        self, area: AreaTecnica, nivel: Nivel, pregunta: str, respuesta: str
    ) -> Evaluacion:
        datos = self._pedir_json(
            sistema=evaluador.sistema(area, nivel),
            entrada=evaluador.usuario(pregunta, respuesta),
            esquema=evaluador.ESQUEMA_EVALUACION,
        )
        return parsear_evaluacion(datos)

    @abstractmethod
    def _pedir_json(self, sistema: str, entrada: str, esquema: dict[str, Any]) -> dict[str, Any]:
        """Pide al modelo un objeto JSON que cumpla `esquema`.

        Cada adaptador traduce aquí los errores de su SDK a la taxonomía de
        `exceptions.py`, y devuelve ya el diccionario decodificado.
        """

    def _decodificar(self, texto: str) -> dict[str, Any]:
        """Decodifica y valida la forma de la respuesta del modelo.

        Compartido porque la comprobación es idéntica para cualquier
        proveedor: o es un objeto JSON, o el contrato se rompió.
        """
        try:
            datos = json.loads(texto)
        except json.JSONDecodeError as exc:
            raise RespuestaIAInvalida(
                f"{self.nombre} ({self.modelo}) no devolvió JSON válido: {texto[:200]}"
            ) from exc

        if not isinstance(datos, dict):
            raise RespuestaIAInvalida(
                f"{self.nombre} ({self.modelo}): se esperaba un objeto JSON, "
                f"se recibió {type(datos).__name__}"
            )
        return datos

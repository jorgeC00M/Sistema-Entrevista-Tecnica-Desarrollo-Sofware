"""Proveedor determinista para pruebas y desarrollo del flujo sin consumir cuota."""

from __future__ import annotations

from collections.abc import Sequence

from .base import ProveedorIA
from .exceptions import ErrorTransitorio
from .prompts.revisor_cv import (
    EntradaDeRevision,
    PreguntaProbable,
    RevisionDeCV,
    SugerenciaDeRequisito,
    VinetaReescrita,
)
from .prompts.schemas import (
    AreaTecnica,
    ContextoDeEntrevista,
    Evaluacion,
    Pregunta,
    Puesto,
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

    def revisar_cv(self, entrada: EntradaDeRevision) -> RevisionDeCV:
        """Una revisión fija, anclada a la entrada como lo estaría una real.

        Solo devuelve elementos que el parser de un proveedor real dejaría pasar:
        así la interfaz y los tests ven la misma forma sin gastar cuota.
        """
        self._contar_llamada()
        # La primera línea con contenido, no un título de sección ("Experiencia:").
        primera_linea = next(
            (
                linea.strip()
                for linea in entrada.secciones.splitlines()
                if linea.strip() and not linea.strip().endswith(":")
            ),
            "",
        )
        return RevisionDeCV(
            vinetas=tuple(
                VinetaReescrita(original=vineta, sugerida=f"{vineta}, lo que redujo [cifra] el tiempo de respuesta.")
                for vineta in entrada.vinetas
            ),
            requisitos=tuple(
                SugerenciaDeRequisito(
                    termino=requisito.termino,
                    sugerencia=f"Menciona {requisito.termino} dentro de un logro de tu experiencia o de un proyecto.",
                )
                for requisito in entrada.requisitos
            ),
            preguntas=(
                (PreguntaProbable(pregunta="¿Qué fue lo más difícil de ese trabajo y cómo lo resolviste?", motivo=primera_linea),)
                if primera_linea
                else ()
            ),
            puesto_sugerido=Puesto.BACKEND,
            correcciones=(),
        )

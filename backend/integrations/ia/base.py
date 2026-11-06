"""Interfaz que desacopla el flujo de entrevista del proveedor de IA concreto."""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from collections.abc import Callable, Sequence
from typing import Any, Protocol, TypeVar, runtime_checkable

from .exceptions import RespuestaIAInvalida
from .prompts import analista_convocatoria, entrevistador, evaluador, revisor_cv, veredicto
from .prompts.analista_convocatoria import EntradaDeConvocatoria, PerfilDetectado
from .prompts.revisor_cv import EntradaDeRevision, RevisionDeCV
from .prompts.veredicto import EntradaDeVeredicto

from .prompts.schemas import (
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    ContextoDeEntrevista,
    Evaluacion,
    Pregunta,
    TemaEvaluado,
    parsear_evaluacion,
    parsear_pregunta,
    parsear_preguntas,
)


T = TypeVar("T")

#: Tope de cada llamada a un proveedor, en segundos. Sin timeout, una llamada
#: colgada retiene el hilo que la atiende. Es por intento, no por petición: con
#: los reintentos el peor caso se multiplica. Lo usan todos los adaptadores.
TIMEOUT_SEGUNDOS = 30.0

#: Reintentos del SDK ante errores de red o saturación (429, 5xx), con retroceso.
#: Los mismos en todos los adaptadores: que uno reintentara y otro no fue justo
#: la divergencia que esta base vino a eliminar.
MAX_REINTENTOS = 2

#: Veces que se vuelve a pedir la misma operación al mismo proveedor cuando su
#: respuesta no se pudo usar (JSON roto o fuera del esquema).
REINTENTOS_ANTE_RESPUESTA_INVALIDA = 1


class ProveedorIA(ABC):
    nombre: str
    modelo: str
    # Si puede recibir texto derivado de un currículum (ya minimizado y
    # enmascarado). Falso por omisión: un proveedor nuevo no recibe datos
    # personales hasta que alguien lo declare apto a conciencia.
    apto_para_datos_personales: bool = False

    @abstractmethod
    def generar_preguntas_iniciales(
        self, contexto: ContextoDeEntrevista, areas: Sequence[AreaTecnica]
    ) -> list[Pregunta]:
        """Genera de una sola vez las primeras preguntas, numeradas desde 1.

        Existe como operación aparte de `generar_pregunta` y no como un parámetro
        opcional de aquella porque son dos cosas distintas: esta **no puede** ser
        adaptativa —se llama cuando no hay ninguna respuesta todavía— y aquella
        sí. Unificarlas en una firma con `previas` opcional dejaría ambigua la
        diferencia.
        """

    @abstractmethod
    def generar_pregunta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        numero: int,
        previas: list[TemaEvaluado],
    ) -> Pregunta:
        """Genera la pregunta `numero` de la entrevista.

        `contexto` es el encuadre de la postulación (puesto, nivel, tecnología),
        constante durante toda la entrevista; `area` es el tema de esta pregunta
        en concreto, que sí cambia turno a turno porque lo decide el puesto.

        `previas` es un resumen comprimido (tema + puntuación) de los turnos ya
        respondidos, no el historial completo: es lo que le permite al
        entrevistador no repetir temas sin que el prompt crezca con la
        longitud de la entrevista.
        """

    @abstractmethod
    def evaluar_respuesta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        pregunta: str,
        respuesta: str,
    ) -> Evaluacion:
        """Califica una respuesta según la rúbrica del evaluador.

        Función pura respecto a la entrevista: la misma pregunta y respuesta
        producen la misma evaluación sin importar en qué entrevista
        ocurrieron. No recibe historial porque no lo necesita.
        """


@runtime_checkable
class RevisorDeCV(Protocol):
    """Un proveedor capaz de sugerir cómo mejorar un CV.

    Es un contrato aparte de `ProveedorIA`, y no un método abstracto más, a
    propósito: obligaría a implementarlo en cada doble de prueba de la entrevista
    (`test_privacidad.py`, `test_errores.py`), que no tienen nada que ver con
    currículums. Quien lo necesita lo pide con `factory.get_revisor_de_cv()`.
    """

    nombre: str
    modelo: str

    def revisar_cv(self, entrada: EntradaDeRevision) -> RevisionDeCV:
        """Sugiere redacciones para lo que el análisis ya marcó, sin juzgarlo de nuevo."""
        ...


@runtime_checkable
class AnalizadorDeConvocatoria(Protocol):
    """Un proveedor capaz de ubicar una convocatoria en el catálogo.

    Contrato aparte por el mismo motivo que `RevisorDeCV`: los dobles de
    entrevista no tienen por qué implementarlo. No se filtra por
    `apto_para_datos_personales`: el aviso no es un dato personal del candidato y
    llega enmascarado.
    """

    nombre: str
    modelo: str

    def analizar_convocatoria(self, entrada: EntradaDeConvocatoria) -> PerfilDetectado:
        """Elige puesto, tecnología y nivel del catálogo y resume los requisitos."""
        ...


@runtime_checkable
class RedactorDeVeredicto(Protocol):
    """Un proveedor capaz de resumir en palabras una entrevista ya calificada.

    Contrato aparte por el mismo motivo que `RevisorDeCV`. No se filtra por
    `apto_para_datos_personales`: recibe evaluaciones, no las respuestas ni datos
    del candidato.
    """

    nombre: str
    modelo: str

    def redactar_veredicto(self, entrada: EntradaDeVeredicto) -> str:
        """Un párrafo que resume el desempeño, sin notas ni juicio de aptitud."""
        ...


class ProveedorIAporJSON(ProveedorIA):
    """Base de los proveedores que piden JSON estructurado a un modelo.

    Todas las operaciones del contrato son la misma secuencia —armar el prompt,
    pedir JSON, parsear al esquema— y solo cambia *cómo* se le pide el JSON a
    cada SDK. Eso es lo único que queda abstracto (`_pedir_json`).

    Existe porque antes estas dos funciones estaban duplicadas carácter por
    carácter entre los adaptadores, y por esa vía divergieron: uno acabó con
    timeout y reintentos y el otro sin ellos. Aquí un arreglo vale para todos.
    """

    def generar_preguntas_iniciales(
        self, contexto: ContextoDeEntrevista, areas: Sequence[AreaTecnica]
    ) -> list[Pregunta]:
        return self._pedir_y_parsear(
            sistema=entrevistador.sistema_de_calentamiento(
                contexto, areas, PREGUNTAS_POR_ENTREVISTA
            ),
            entrada=entrevistador.usuario_de_calentamiento(areas),
            esquema=entrevistador.esquema_de_preguntas(len(areas)),
            parsear=lambda d: parsear_preguntas(d, desde_numero=1, cuantas=len(areas)),
        )

    def generar_pregunta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        numero: int,
        previas: list[TemaEvaluado],
    ) -> Pregunta:
        return self._pedir_y_parsear(
            sistema=entrevistador.sistema(contexto, area, numero, PREGUNTAS_POR_ENTREVISTA),
            entrada=entrevistador.usuario(numero, previas),
            esquema=entrevistador.ESQUEMA_PREGUNTA,
            parsear=lambda d: parsear_pregunta(d, numero=numero),
        )

    def evaluar_respuesta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        pregunta: str,
        respuesta: str,
    ) -> Evaluacion:
        return self._pedir_y_parsear(
            sistema=evaluador.sistema(contexto, area),
            entrada=evaluador.usuario(pregunta, respuesta),
            esquema=evaluador.ESQUEMA_EVALUACION,
            parsear=parsear_evaluacion,
        )

    def revisar_cv(self, entrada: EntradaDeRevision) -> RevisionDeCV:
        """Implementa `RevisorDeCV` con la misma secuencia que las demás
        operaciones: así Gemini y Claude lo obtienen sin código propio."""
        return self._pedir_y_parsear(
            sistema=revisor_cv.sistema(),
            entrada=revisor_cv.usuario(entrada),
            esquema=revisor_cv.ESQUEMA_REVISION,
            parsear=lambda d: revisor_cv.parsear_revision(d, entrada),
        )

    def analizar_convocatoria(self, entrada: EntradaDeConvocatoria) -> PerfilDetectado:
        """Implementa `AnalizadorDeConvocatoria` con la misma secuencia que las
        demás operaciones: así todos los adaptadores lo obtienen sin código propio."""
        return self._pedir_y_parsear(
            sistema=analista_convocatoria.sistema(entrada),
            entrada=analista_convocatoria.usuario(entrada),
            esquema=analista_convocatoria.esquema(entrada),
            parsear=lambda d: analista_convocatoria.parsear_perfil(d, entrada),
        )

    def redactar_veredicto(self, entrada: EntradaDeVeredicto) -> str:
        """Implementa `RedactorDeVeredicto` con la misma secuencia que las demás
        operaciones."""
        return self._pedir_y_parsear(
            sistema=veredicto.sistema(entrada.contexto),
            entrada=veredicto.usuario(entrada),
            esquema=veredicto.ESQUEMA_VEREDICTO,
            parsear=veredicto.parsear_veredicto,
        )

    def _pedir_y_parsear(
        self, sistema: str, entrada: str, esquema: dict[str, Any], parsear: Callable[[dict[str, Any]], T]
    ) -> T:
        """Pide el JSON y lo parsea; si la respuesta no se pudo usar, lo pide una
        vez más.

        Un JSON mal formado suele salir bien al segundo intento, y el SDK solo
        reintenta errores de red o de saturación, no este. Va aquí, en el único
        paso común, para que valga para todas las operaciones y proveedores. Si
        el reintento también falla, el error sube: con una cadena configurada,
        `ProveedorEnCadena` pasa al siguiente.
        """
        for intento in range(REINTENTOS_ANTE_RESPUESTA_INVALIDA + 1):
            try:
                return parsear(self._pedir_json(sistema=sistema, entrada=entrada, esquema=esquema))
            except RespuestaIAInvalida:
                if intento == REINTENTOS_ANTE_RESPUESTA_INVALIDA:
                    raise
        raise AssertionError("inalcanzable")

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

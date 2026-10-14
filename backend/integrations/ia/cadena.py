"""Cadena de respaldo entre proveedores de IA.

`IA_PROVEEDOR=gemini,deepseek` arma una cadena: cada operación se pide al
primero y, si falla, la misma operación se pide al siguiente. Con presupuesto
cero es lo que evita que una cuota gratuita agotada (429) corte la entrevista
cuando hay otro proveedor configurado.

Es un `ProveedorIA` más: las vistas y los servicios no saben si hablan con un
proveedor o con varios. Tras cada llamada exitosa, `nombre` y `modelo` pasan a
ser los del proveedor que respondió, porque `evaluaciones.services.guardar()`
los lee justo después para registrar quién calificó. Es estado por instancia,
y `factory.get_proveedor()` crea una por petición, así que no se comparte
entre usuarios.

No recuerda entre peticiones qué proveedor está agotado: no hay dónde
guardarlo de forma fiable en el plan gratuito, y el costo es un intento
fallido y rápido por llamada.
"""

from __future__ import annotations

import logging
from collections.abc import Callable, Sequence
from typing import TypeVar

from .base import ProveedorIA, RevisorDeCV
from .exceptions import ErrorProveedorIA
from .prompts.revisor_cv import EntradaDeRevision, RevisionDeCV
from .prompts.schemas import (
    AreaTecnica,
    ContextoDeEntrevista,
    Evaluacion,
    Pregunta,
    TemaEvaluado,
)

logger = logging.getLogger(__name__)

T = TypeVar("T")


class ProveedorEnCadena(ProveedorIA):
    def __init__(self, eslabones: Sequence[ProveedorIA]):
        if not eslabones:
            raise ValueError("Una cadena de proveedores necesita al menos uno")
        self._eslabones = list(eslabones)
        # Hasta la primera respuesta, el que se intentará primero.
        self.nombre = self._eslabones[0].nombre
        self.modelo = self._eslabones[0].modelo
        # La cadena solo es apta si todos sus eslabones lo son.
        self.apto_para_datos_personales = all(e.apto_para_datos_personales for e in self._eslabones)

    @property
    def eslabones(self) -> tuple[ProveedorIA, ...]:
        return tuple(self._eslabones)

    def _intentar(self, operacion: Callable[[ProveedorIA], T], eslabones=None) -> T:
        ultimo_error: ErrorProveedorIA | None = None
        for eslabon in eslabones if eslabones is not None else self._eslabones:
            try:
                resultado = operacion(eslabon)
            except ErrorProveedorIA as exc:
                # También ante un error permanente: una clave revocada en un
                # eslabón no debe cortar el servicio de los demás. Se registra
                # para que alguien la corrija.
                logger.warning("Proveedor de IA '%s' falló; se prueba el siguiente: %s", eslabon.nombre, exc)
                ultimo_error = exc
                continue
            self.nombre = eslabon.nombre
            self.modelo = eslabon.modelo
            return resultado
        assert ultimo_error is not None
        raise ultimo_error

    def generar_preguntas_iniciales(
        self, contexto: ContextoDeEntrevista, areas: Sequence[AreaTecnica]
    ) -> list[Pregunta]:
        return self._intentar(lambda p: p.generar_preguntas_iniciales(contexto, areas))

    def generar_pregunta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        numero: int,
        previas: list[TemaEvaluado],
    ) -> Pregunta:
        return self._intentar(lambda p: p.generar_pregunta(contexto, area, numero, previas))

    def evaluar_respuesta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        pregunta: str,
        respuesta: str,
    ) -> Evaluacion:
        return self._intentar(lambda p: p.evaluar_respuesta(contexto, area, pregunta, respuesta))

    def revisar_cv(self, entrada: EntradaDeRevision) -> RevisionDeCV:
        """Solo con los eslabones que saben revisar CV.

        `factory.get_revisor_de_cv()` ya arma la cadena solo con proveedores
        aptos para datos personales; este filtro es la segunda línea.
        """
        aptos = [
            e for e in self._eslabones if isinstance(e, RevisorDeCV) and e.apto_para_datos_personales
        ]
        return self._intentar(lambda p: p.revisar_cv(entrada), aptos)

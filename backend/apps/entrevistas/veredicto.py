"""El veredicto del reporte: un párrafo de la IA que resume la entrevista.

Lo escribe un rol aparte (el redactor), nunca el evaluador, y solo con las
evaluaciones guardadas: nunca las respuestas. Separado de `services.py`, que lo
reexporta; los tests parchean `get_redactor_de_veredicto` aquí.
"""

from __future__ import annotations

from integrations.ia.base import RedactorDeVeredicto
from integrations.ia.exceptions import ErrorProveedorIA
from integrations.ia.factory import get_redactor_de_veredicto
from integrations.ia.prompts.schemas import Niveles
from integrations.ia.prompts.veredicto import EntradaDeVeredicto, RespuestaEvaluada

from .exceptions import EntrevistaNoFinalizada
from .models import Entrevista
from .selectors import contexto_de, entrevista_del_usuario

#: Sube si cambia lo que recibe o lo que devuelve el redactor del veredicto.
VERSION_DEL_VEREDICTO = 1


def _entrada_de_veredicto(entrevista) -> EntradaDeVeredicto:
    """Lo que el redactor recibe: las evaluaciones guardadas, nunca las respuestas."""
    calificados = entrevista.intercambios.filter(evaluacion__isnull=False).select_related("evaluacion", "area")
    return EntradaDeVeredicto(
        contexto=contexto_de(entrevista),
        respuestas=tuple(
            RespuestaEvaluada(
                numero=i.numero,
                area=i.area_enum,
                puntuacion=i.evaluacion.puntuacion,
                niveles=Niveles(**i.evaluacion.niveles) if i.evaluacion.niveles else None,
                fortalezas=i.evaluacion.fortalezas,
                debilidades=i.evaluacion.debilidades,
            )
            for i in calificados.order_by("numero")
        ),
    )


def redactar_veredicto(entrevista, redactor: RedactorDeVeredicto | None = None) -> dict:
    """Pide a la IA el párrafo que resume la entrevista y lo guarda.

    Nunca propaga un fallo del proveedor: el veredicto es un agregado del
    reporte, que se muestra completo sin él (con un respaldo por reglas en la
    pantalla). Una entrevista sin respuestas calificadas no tiene qué resumir y
    no llama a la IA.
    """
    entrada = _entrada_de_veredicto(entrevista)
    if not entrada.respuestas:
        veredicto = {"estado": "no_disponible", "texto": "", "version": VERSION_DEL_VEREDICTO}
    else:
        try:
            texto = (redactor or get_redactor_de_veredicto()).redactar_veredicto(entrada)
            veredicto = {"estado": "ok", "texto": texto, "version": VERSION_DEL_VEREDICTO}
        except ErrorProveedorIA:
            veredicto = {"estado": "no_disponible", "texto": "", "version": VERSION_DEL_VEREDICTO}
    entrevista.veredicto_ia = veredicto
    entrevista.save(update_fields=["veredicto_ia"])
    return veredicto


def pedir_veredicto(usuario, pk, redactor: RedactorDeVeredicto | None = None) -> dict:
    """El veredicto de una entrevista finalizada del usuario: el guardado si ya
    hay uno válido, si no se redacta ahora. Cubre el «Reintentar» y las
    entrevistas anteriores a esta función. Solo una finalizada tiene nota, y el
    veredicto la resume: las demás no lo tienen."""
    entrevista = entrevista_del_usuario(usuario, pk)
    if entrevista.estado != Entrevista.Estado.FINALIZADA:
        raise EntrevistaNoFinalizada("Solo una entrevista finalizada tiene veredicto.")
    if (entrevista.veredicto_ia or {}).get("estado") == "ok":
        return entrevista.veredicto_ia
    return redactar_veredicto(entrevista, redactor)

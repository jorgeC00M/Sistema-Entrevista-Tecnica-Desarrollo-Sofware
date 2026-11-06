"""Analizar la convocatoria a la que el usuario va a postular.

El orden importa, y es el de todo el módulo: el código mide, la IA clasifica.

1. Se enmascara el aviso (correos, teléfonos, enlaces): lo que se guarda y lo
   que viaja a la IA ya no los lleva.
2. Si este usuario ya analizó el mismo aviso (mismo hash del texto
   enmascarado), se devuelve ese análisis: no se gasta otra llamada.
3. `convocatoria.partir()` saca, sin IA, las tecnologías reconocidas, los años
   y el cargo. Van como pistas y como base del anclaje de los requisitos.
4. La IA elige puesto, tecnología y nivel **entre las opciones del catálogo
   activo** y resume requisitos; el parser descarta lo que no esté anclado.
5. Se guarda con `get_or_create`: dos peticiones simultáneas del mismo aviso no
   duplican la fila.

La llamada a la IA va fuera de cualquier transacción, como la evaluación en
`services.responder()`: un proveedor lento no debe retener una conexión.
"""

from __future__ import annotations

from apps.catalogos.selectors import niveles_activos, puestos_con_tecnologias
from apps.common.textos import hash_de_texto
from integrations.documentos.anonimizar import enmascarar
from integrations.documentos.convocatoria import partir
from integrations.ia.base import AnalizadorDeConvocatoria
from integrations.ia.factory import get_analizador_de_convocatoria
from integrations.ia.prompts.analista_convocatoria import (
    EntradaDeConvocatoria,
    OpcionDeNivel,
    OpcionDePuesto,
    OpcionDeTecnologia,
)

from .models import Convocatoria


def _opciones() -> tuple[tuple[OpcionDePuesto, ...], tuple[OpcionDeNivel, ...]]:
    """El catálogo activo, en la forma que entiende la capa de IA."""
    puestos = tuple(
        OpcionDePuesto(
            codigo=p.codigo,
            nombre=p.nombre,
            tecnologias=tuple(OpcionDeTecnologia(t.codigo, t.nombre, t.capa) for t in p.tecnologias_activas),
        )
        for p in puestos_con_tecnologias()
    )
    niveles = tuple(OpcionDeNivel(n.codigo, n.nombre, n.descripcion) for n in niveles_activos().order_by("orden"))
    return puestos, niveles


def analizar_convocatoria(
    usuario, texto: str, analizador: AnalizadorDeConvocatoria | None = None
) -> Convocatoria:
    """Devuelve la convocatoria analizada (nueva o de la caché) del usuario."""
    enmascarado = enmascarar(texto.strip())
    huella = hash_de_texto(enmascarado)

    existente = Convocatoria.objects.filter(usuario=usuario, hash=huella).first()
    if existente is not None:
        return existente

    pistas = partir(enmascarado)
    puestos, niveles = _opciones()
    entrada = EntradaDeConvocatoria(
        texto=enmascarado,
        terminos=tuple(sorted(pistas.obligatorios | pistas.deseables)),
        anos_requeridos=pistas.anos_requeridos,
        cargo=pistas.cargo,
        puestos=puestos,
        niveles=niveles,
    )
    perfil = (analizador or get_analizador_de_convocatoria()).analizar_convocatoria(entrada)

    convocatoria, _ = Convocatoria.objects.get_or_create(
        usuario=usuario,
        hash=huella,
        defaults={"texto": enmascarado, "perfil": perfil.como_dict()},
    )
    return convocatoria

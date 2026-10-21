"""Sugerencias de IA sobre un CV ya analizado.

**Es el único módulo de esta app que importa `integrations.ia`**, y
`tests/test_frontera_con_ia.py` lo hace cumplir. El motivo es `Curriculum.texto`:
el CV completo de una persona real. Concentrar aquí todo lo que sale hacia un
proveedor externo es lo que permite auditarlo en un solo sitio.

Lo que sale, y lo que no:

- **Minimización.** Solo viajan los bloques de las secciones reconocidas
  (`segmentar()`), que dejan fuera por construcción el encabezado —nombre,
  correo, teléfono, dirección—; nunca el texto completo ni el de los cuadros o
  el encabezado de página.
- **Enmascarado.** Sobre lo que viaja se tapan correos, enlaces, teléfonos y el
  nombre (`anonimizar.enmascarar`), porque a veces se cuelan dentro de una
  sección.
- **Sin secciones, nada.** Si no se reconoce ningún título no hay forma de
  separar el encabezado, y mandar el texto entero enmascarado sería apostar a
  que el enmascarado no falla. Se omite y se dice por qué.

La IA es complementaria: si falla, el diagnóstico ya está guardado y la sección
queda `no_disponible`. Nunca tumba el análisis.
"""

from __future__ import annotations

import logging
from dataclasses import asdict

from integrations.documentos.anonimizar import enmascarar
from integrations.documentos.contacto import detectar_nombre
from integrations.documentos.brecha import AUSENTE, DECLARADO, NO_ALCANZA, NO_CALCULABLE
from integrations.documentos.extractor import DocumentoExtraido
from integrations.documentos.secciones import segmentar
from integrations.ia.exceptions import ErrorProveedorIA
from integrations.ia.factory import get_revisor_de_cv
from integrations.ia.prompts.revisor_cv import EntradaDeRevision, RequisitoARevisar

logger = logging.getLogger(__name__)

OK = "ok"
NO_DISPONIBLE = "no_disponible"
OMITIDA = "omitida"

#: Topes de lo que se envía: acotan el coste por análisis y lo que sale del sistema.
MAXIMO_CARACTERES_DE_SECCIONES = 6000
MAXIMO_CARACTERES_DE_CONVOCATORIA = 3000

#: Clave con la que la interfaz encuentra la sugerencia del requisito de años.
CLAVE_DE_EXPERIENCIA = "experiencia"

_ESTADOS_A_REVISAR = (DECLARADO, AUSENTE)


def necesita_revision(revision_ia: dict | None) -> bool:
    """Si hay que (re)intentar la revisión: nunca se hizo, o el proveedor falló.

    Una revisión `omitida` no se reintenta: el motivo está en el documento, y
    volver a subir el mismo documento no lo cambia.
    """
    return revision_ia is None or revision_ia.get("estado") == NO_DISPONIBLE


def revisar(
    documento: DocumentoExtraido,
    vinetas: dict | None,
    brecha: dict | None,
    convocatoria: str,
    revisor=None,
) -> dict:
    """La revisión lista para guardar en `AnalisisATS.revision_ia`.

    Recibe `vinetas` y `brecha` ya serializados, tal como se guardaron, para que
    las sugerencias se anclen exactamente a lo que el usuario ve. `revisor` se
    inyecta en los tests; por defecto es el proveedor configurado, y solo se
    construye si de verdad hay algo que enviar.
    """
    if not documento.tiene_capa_de_texto:
        return _sin_revision(OMITIDA, "Tu CV no tiene texto legible, así que no hay nada sobre lo que sugerir.")

    secciones = segmentar(documento.texto)
    if not secciones:
        return _sin_revision(
            OMITIDA,
            "Corrige los títulos de sección para recibir sugerencias: sin ellos no se puede separar "
            "tu información personal del resto del CV, y no se envía nada que pueda contenerla.",
        )

    nombre = detectar_nombre(documento.texto)
    vinetas_originales = list((vinetas or {}).get("sin_resultado", []))
    vinetas_enmascaradas = [enmascarar(vineta, nombre) for vineta in vinetas_originales]
    requisitos, clave_por_termino = _requisitos(brecha)

    entrada = EntradaDeRevision(
        vinetas=tuple(vinetas_enmascaradas),
        requisitos=requisitos,
        secciones=enmascarar(_texto_de_secciones(secciones), nombre)[:MAXIMO_CARACTERES_DE_SECCIONES],
        convocatoria=convocatoria.strip()[:MAXIMO_CARACTERES_DE_CONVOCATORIA],
    )

    try:
        resultado = (revisor or get_revisor_de_cv()).revisar_cv(entrada)
    except ErrorProveedorIA:
        # Se registra con traza para quien opera el sistema; al usuario le basta
        # saber que puede reintentar.
        logger.exception("La revisión del CV con IA falló")
        return _sin_revision(
            NO_DISPONIBLE,
            "El servicio de sugerencias no respondió. Puedes reintentarlo sin volver a subir el CV; "
            "el diagnóstico no depende de él.",
        )

    # Lo enviado iba enmascarado; lo que se muestra debe ser la viñeta del usuario.
    original_de = dict(zip(vinetas_enmascaradas, vinetas_originales, strict=True))

    return {
        "estado": OK,
        "motivo": "",
        "vinetas": [
            {"original": original_de.get(v.original, v.original), "sugerida": v.sugerida}
            for v in resultado.vinetas
        ],
        "requisitos": [
            {"termino": clave_por_termino[r.termino], "sugerencia": r.sugerencia}
            for r in resultado.requisitos
        ],
        "preguntas": [asdict(pregunta) for pregunta in resultado.preguntas],
        "puesto_sugerido": resultado.puesto_sugerido.value if resultado.puesto_sugerido else None,
        "correcciones": [asdict(correccion) for correccion in resultado.correcciones],
    }


def _sin_revision(estado: str, motivo: str) -> dict:
    """Misma forma que una revisión completa: la interfaz no depende del estado."""
    return {
        "estado": estado,
        "motivo": motivo,
        "vinetas": [],
        "requisitos": [],
        "preguntas": [],
        "puesto_sugerido": None,
        "correcciones": [],
    }


def _texto_de_secciones(secciones: dict[str, str]) -> str:
    return "\n\n".join(f"{titulo.capitalize()}:\n{bloque.strip()}" for titulo, bloque in secciones.items())


def _requisitos(brecha: dict | None) -> tuple[tuple[RequisitoARevisar, ...], dict[str, str]]:
    """Lo que la brecha marcó como no demostrado, y la clave con que la interfaz
    encuentra cada sugerencia.

    Las tecnologías y el cargo se buscan por su propio término; el requisito de
    años va con un término legible para el modelo ("3 años de experiencia") y se
    guarda con una clave fija.
    """
    if not brecha:
        return (), {}

    requisitos: list[RequisitoARevisar] = []
    clave_por_termino: dict[str, str] = {}

    def agregar(termino: str, estado: str, clave: str) -> None:
        requisitos.append(RequisitoARevisar(termino=termino, estado=estado))
        clave_por_termino[termino] = clave

    for grupo in ("obligatorios", "deseables"):
        for requisito in brecha.get(grupo, {}).get("requisitos", []):
            if requisito["estado"] in _ESTADOS_A_REVISAR:
                agregar(requisito["termino"], requisito["estado"], requisito["termino"])

    cargo = brecha.get("cargo")
    if cargo and cargo["estado"] in _ESTADOS_A_REVISAR:
        agregar(cargo["termino"], cargo["estado"], cargo["termino"])

    experiencia = brecha.get("experiencia")
    if experiencia and experiencia["estado"] in (NO_ALCANZA, NO_CALCULABLE):
        anos = experiencia["requeridos"]
        agregar(f"{anos} año{'s' if anos != 1 else ''} de experiencia", experiencia["estado"], CLAVE_DE_EXPERIENCIA)

    return tuple(requisitos), clave_por_termino

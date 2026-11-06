"""Orquestación del análisis de un currículum.

Escrituras y coordinación; las lecturas viven en `selectors.py`.

La vista no toca `integrations.documentos` directamente, igual que no toca el
proveedor de IA: la dirección de dependencia es apps → integrations y este
módulo es el único punto de contacto.
"""

from __future__ import annotations

from dataclasses import asdict
from datetime import date

from django.db import transaction
from django.http import Http404

from integrations.documentos import brecha as brecha_de_requisitos
from integrations.documentos import vinetas as analisis_de_vinetas
from integrations.documentos.ats import IDIOMA_DISTINTO, VERSION_DE_REGLAS, analizar as analizar_documento
from integrations.documentos.extractor import DocumentoExtraido, extraer
from integrations.documentos.terminos import encontrar

from . import revision, selectors
from apps.common.textos import hash_de_texto

from .models import AnalisisATS, Curriculum


def analizar(
    usuario,
    contenido: bytes,
    nombre_archivo: str,
    convocatoria: str = "",
) -> Curriculum:
    """Extrae, verifica y guarda. Devuelve el currículum con su análisis.

    La convocatoria llega como texto pegado: es la única vía que acepta el
    serializer (`comparar-con-oferta-en-dos-pasos`).

    Si este usuario ya analizó el mismo documento contra la misma convocatoria, se
    devuelve el análisis existente sin repetir el trabajo — salvo que se hiciera
    con una versión anterior de las reglas: entonces se recalcula y se reemplaza,
    sin crear un segundo registro.

    El criterio es el texto y no los bytes: reexportar el mismo CV desde Word
    cambia el archivo y no cambia nada de lo que hay que analizar. Pero es **todo**
    el texto, incluido el que el ATS no lee (`huella`): dos DOCX que solo difieren
    en el encabezado son documentos distintos.

    `FormatoNoSoportado`, `DocumentoCorrupto` y `DocumentoDemasiadoGrande` suben
    sin capturarse; las traduce `apps.common.exceptions.manejador_de_excepciones`.

    Las sugerencias de IA **no** se piden aquí: van en otra petición,
    `revisar()`. El diagnóstico es medición pura y responde en un momento; la IA
    puede tardar decenas de segundos (proveedor lento, cadena de respaldo,
    arranque en frío). Juntas en una petición, el cliente agotaba su tiempo y
    mostraba "no se pudo analizar" sobre un análisis que sí se había guardado.
    Por eso un análisis nuevo sale con `revision_ia = None`: aún no pedida.
    """
    documento = extraer(contenido, nombre_archivo)
    huella_cv = hash_de_texto(documento.huella)
    huella_convocatoria = hash_de_texto(convocatoria)

    existente = (
        Curriculum.objects.filter(
            usuario=usuario,
            hash_texto=huella_cv,
            hash_convocatoria=huella_convocatoria,
        )
        .select_related("analisis")
        .first()
    )
    analisis_previo = getattr(existente, "analisis", None) if existente else None
    if analisis_previo is not None and analisis_previo.version_reglas >= VERSION_DE_REGLAS:
        # El diagnóstico vigente no se repite. Las sugerencias que falten las
        # pide el cliente después, con `revisar()`.
        return existente

    with transaction.atomic():
        if existente is not None:
            # O quedó a medias en un intento anterior —tiene el currículum pero no
            # su análisis— o el análisis es de reglas anteriores. En los dos casos
            # se completa sobre la misma fila en vez de insertar un duplicado, que
            # la restricción de unicidad rechazaría.
            curriculum = existente
        else:
            curriculum = Curriculum.objects.create(
                usuario=usuario,
                nombre_archivo=nombre_archivo,
                formato=documento.formato,
                paginas=documento.paginas,
                texto=documento.texto,
                hash_texto=huella_cv,
                convocatoria=convocatoria,
                hash_convocatoria=huella_convocatoria,
            )
        analisis, _ = AnalisisATS.objects.update_or_create(
            curriculum=curriculum,
            # Un diagnóstico recalculado deja sin sugerencias: las anteriores se
            # anclaban a viñetas y requisitos que pueden haber cambiado.
            defaults={**construir_analisis(documento, convocatoria, date.today()), "revision_ia": None},
        )

    # La relación inversa puede tener cacheado el análisis viejo, que vino con
    # `select_related`; se reemplaza para que la respuesta muestre el nuevo.
    curriculum.analisis = analisis
    return curriculum


def revisar(usuario, pk: int, revisor=None) -> dict:
    """Las sugerencias de IA de un análisis ya guardado, pidiéndolas si hace falta.

    El archivo nunca se guardó, pero lo que la revisión usa sí: el texto que
    lee el ATS, el formato y las páginas (de donde sale `tiene_capa_de_texto`).
    Con eso se reconstruye el documento y no hay que volver a subir nada. Las
    partes ocultas (cuadros de texto, encabezados) no se guardan, y no hacen
    falta: nunca se envían a la IA.

    Si ya hay una revisión vigente se devuelve sin llamar al proveedor; solo se
    reintenta la que nunca se pidió o la que falló (`necesita_revision`). Corre
    fuera de toda transacción, como la evaluación de `responder()`: un
    proveedor lento no debe tener una fila bloqueada. `revisor` se inyecta en
    los tests; este módulo no conoce la capa de IA.
    """
    curriculum = selectors.curriculum_del_usuario(usuario, pk)
    analisis = getattr(curriculum, "analisis", None)
    if analisis is None:
        # Un alta que quedó a medias: no hay diagnóstico al que sugerir nada.
        raise Http404("Este currículum todavía no tiene un análisis.")
    if not revision.necesita_revision(analisis.revision_ia):
        return analisis.revision_ia

    documento = DocumentoExtraido(texto=curriculum.texto, formato=curriculum.formato, paginas=curriculum.paginas)
    _guardar_revision(analisis, documento, curriculum.convocatoria, revisor)
    return analisis.revision_ia


def _guardar_revision(analisis: AnalisisATS, documento: DocumentoExtraido, convocatoria: str, revisor) -> None:
    """Pide las sugerencias y guarda solo esa columna.

    `update` sobre una columna y no `save()`: no reescribe el diagnóstico que se
    acaba de guardar, ni compite con él.
    """
    analisis.revision_ia = revision.revisar(
        documento, analisis.vinetas, analisis.brecha, convocatoria, revisor=revisor
    )
    AnalisisATS.objects.filter(pk=analisis.pk).update(revision_ia=analisis.revision_ia)


def construir_analisis(documento: DocumentoExtraido, convocatoria: str, hoy: date) -> dict:
    """Los valores de un `AnalisisATS`, sin tocar la base de datos.

    Separado de la escritura para que el contenido se pueda probar sin base, y
    para que crear y recalcular usen exactamente el mismo cálculo.
    """
    analisis = analizar_documento(documento, hoy=hoy)
    brecha = _brecha(convocatoria, documento, hoy)

    # Es el único hallazgo que necesita los dos documentos, así que se añade
    # aquí, donde se combinan, y no en `ats.analizar()`, que solo ve el CV.
    if brecha is not None and brecha.idioma_distinto:
        analisis.hallazgos.append(IDIOMA_DISTINTO)

    return {
        "campos": [asdict(campo) for campo in analisis.campos],
        # Se guardan ya ordenados —fortalezas aparte, debilidades por severidad—
        # para que el cliente no repita ese criterio y pueda divergir del que
        # aplica el admin o un reporte futuro.
        "hallazgos": {
            "fortalezas": [asdict(h) for h in analisis.fortalezas],
            "debilidades": [asdict(h) for h in analisis.debilidades],
        },
        "campos_detectados": analisis.campos_detectados,
        "campos_intentados": len(analisis.campos),
        "brecha": asdict(brecha) if brecha is not None else None,
        "inventario": _inventario(documento),
        "vinetas": _vinetas_serializadas(documento),
        "version_reglas": VERSION_DE_REGLAS,
    }


def _brecha(convocatoria: str, documento: DocumentoExtraido, hoy: date):
    """El mapa de evidencia, o `None` si no hay nada que comparar.

    `calcular()` recibe el documento y no su texto porque es dueño del criterio de
    legibilidad: un CV ilegible no produce brecha, porque "0 de 6 requisitos" sería
    falso —no es que el candidato no cumpla, es que nadie puede leerlo—.
    """
    if not convocatoria.strip():
        return None
    return brecha_de_requisitos.calcular(convocatoria, documento, hoy=hoy)


def _inventario(documento: DocumentoExtraido) -> list[str]:
    """Los términos técnicos que el CV declara de forma legible.

    Vacío cuando el documento no tiene capa de texto, para no contradecir al
    espejo: si el ATS no lee nada, tampoco lee tecnologías.
    """
    if not documento.tiene_capa_de_texto:
        return []
    return sorted(encontrar(documento.texto))


def _vinetas_serializadas(documento: DocumentoExtraido) -> dict | None:
    """El análisis de redacción, o `None` si el CV no usa viñetas.

    Devolver `None` y no un conteo en cero es lo que permite a la interfaz omitir
    la sección: "0 de 0 viñetas" no le dice nada a quien redacta en párrafos.
    """
    if not documento.tiene_capa_de_texto:
        return None

    resultado = analisis_de_vinetas.evaluar(documento.texto)
    if resultado.total == 0:
        return None

    return {
        "total": resultado.total,
        "logros": resultado.logros,
        "proporcion": resultado.proporcion,
        "sin_resultado": [vineta.texto for vineta in resultado.sin_resultado],
    }

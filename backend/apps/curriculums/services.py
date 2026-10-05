"""Orquestación del análisis de un currículum.

Escrituras y coordinación; las lecturas viven en `selectors.py`.

La vista no toca `integrations.documentos` directamente, igual que no toca el
proveedor de IA: la dirección de dependencia es apps → integrations y este
módulo es el único punto de contacto.
"""

from __future__ import annotations

from dataclasses import asdict

from django.db import transaction

from integrations.documentos import brecha as brecha_de_requisitos
from integrations.documentos import vinetas as analisis_de_vinetas
from integrations.documentos.ats import Analisis, analizar as analizar_documento
from integrations.documentos.extractor import DocumentoExtraido, extraer
from integrations.documentos.terminos import encontrar

from .models import AnalisisATS, Curriculum, hash_de_texto


def analizar(
    usuario,
    contenido: bytes,
    nombre_archivo: str,
    convocatoria: str = "",
) -> Curriculum:
    """Extrae, verifica y guarda. Devuelve el currículum con su análisis.

    La convocatoria llega ya como texto: quien la aporta como archivo la extrae
    antes, en el serializer, porque es ahí donde se validan formato y tamaño.

    Si este usuario ya analizó el mismo texto contra la misma convocatoria, se
    devuelve el análisis existente sin repetir el trabajo. El criterio es el texto
    y no los bytes: reexportar el mismo CV desde Word cambia el archivo y no cambia
    nada de lo que hay que analizar.

    `FormatoNoSoportado`, `DocumentoCorrupto` y `DocumentoDemasiadoGrande` suben
    sin capturarse; las traduce `apps.common.exceptions.manejador_de_excepciones`,
    igual que los errores del proveedor de IA.
    """
    documento = extraer(contenido, nombre_archivo)
    huella_cv = hash_de_texto(documento.texto)
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
    if existente is not None and hasattr(existente, "analisis"):
        return existente

    with transaction.atomic():
        if existente is not None:
            # Quedó a medias en un intento anterior: tiene el currículum pero no
            # su análisis. Se completa en vez de insertar un duplicado, que la
            # restricción de unicidad rechazaría.
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
        _guardar_analisis(curriculum, documento, convocatoria)

    return curriculum


def _guardar_analisis(
    curriculum: Curriculum, documento: DocumentoExtraido, convocatoria: str
) -> AnalisisATS:
    analisis = analizar_documento(documento)

    return AnalisisATS.objects.create(
        curriculum=curriculum,
        campos=[asdict(campo) for campo in analisis.campos],
        # Se guardan ya ordenados —fortalezas aparte, debilidades por severidad—
        # para que el cliente no repita ese criterio y pueda divergir del que
        # aplica el admin o un reporte futuro.
        hallazgos={
            "fortalezas": [asdict(h) for h in analisis.fortalezas],
            "debilidades": [asdict(h) for h in analisis.debilidades],
        },
        campos_detectados=analisis.campos_detectados,
        campos_intentados=len(analisis.campos),
        brecha=_brecha_serializada(convocatoria, documento),
        inventario=_inventario(documento, analisis),
        vinetas=_vinetas_serializadas(documento),
    )


def _brecha_serializada(convocatoria: str, documento: DocumentoExtraido) -> dict | None:
    """El mapa de evidencia, o `None` si no hay nada que comparar.

    `calcular()` recibe el documento y no su texto porque es dueño del criterio de
    legibilidad: un CV ilegible no produce brecha, porque "0 de 6 requisitos" sería
    falso —no es que el candidato no cumpla, es que nadie puede leerlo—.
    """
    if not convocatoria.strip():
        return None

    resultado = brecha_de_requisitos.calcular(convocatoria, documento)
    if resultado is None:
        return None

    def grupo(bloque) -> dict:
        return {
            "requisitos": [asdict(requisito) for requisito in bloque.requisitos],
            "cubiertos": bloque.cubiertos,
            "cobertura": bloque.cobertura,
        }

    return {
        "obligatorios": grupo(resultado.obligatorios),
        "deseables": grupo(resultado.deseables),
        "extras": list(resultado.extras),
        "separada": resultado.separada,
        "con_evidencia": resultado.con_evidencia,
    }


def _inventario(documento: DocumentoExtraido, analisis: Analisis) -> list[str]:
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

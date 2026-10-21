"""Orquestador del flujo de entrevista.

Es la única pieza que conoce a la vez el proveedor de IA y los modelos. Las
vistas llaman exclusivamente a estas funciones — nunca construyen una consulta
de negocio ni tocan un adaptador de IA directamente.

Nada guarda estado en memoria: cada llamada reconstruye el contexto desde
PostgreSQL. Es necesario porque el backend en Render free se duerme por
inactividad y puede reiniciarse en cualquier momento.
"""

from __future__ import annotations

from datetime import timedelta

from django.db import transaction
from django.db.models import Max
from django.db.models.functions import Coalesce
from django.utils import timezone

from apps.catalogos.selectors import areas_por_codigo
from apps.evaluaciones.services import calificar, guardar
from integrations.ia.base import ProveedorIA
from integrations.ia.factory import get_proveedor
from integrations.ia.prompts.schemas import (
    PREGUNTAS_DE_CALENTAMIENTO,
    PREGUNTAS_POR_ENTREVISTA,
    ContextoDeEntrevista,
    area_de_la_pregunta,
)

from .models import Entrevista, Intercambio
from .selectors import intercambio_pendiente, promedio_de_evaluaciones, temas_evaluados

MINUTOS_PARA_ABANDONO = 30


class SinIntercambioPendiente(ValueError):
    """Se pidió responder una entrevista que no tiene pregunta pendiente.

    Hereda de `ValueError` por compatibilidad con quien ya la trataba así,
    pero es un tipo propio para que la vista pueda capturar exactamente este
    caso. Antes capturaba `ValueError` a secas y se tragaba también el que
    lanzan las propiedades `*_enum` cuando una fila del catálogo no tiene
    miembro en el enum, convirtiendo un problema de integridad de datos en un
    409 con un mensaje falso.
    """


def _contexto(entrevista) -> ContextoDeEntrevista:
    """El encuadre de la postulación, que no cambia durante la entrevista."""
    return ContextoDeEntrevista(
        puesto=entrevista.puesto_enum,
        nivel=entrevista.nivel_enum,
        tecnologia=entrevista.tecnologia_nombre,
        # Solo el entrevistador los usa; el evaluador no los recibe.
        requisitos=entrevista.convocatoria.requisitos if entrevista.convocatoria_id else (),
    )


def _crear_intercambios(entrevista, preguntas, areas_enum) -> list[Intercambio]:
    """Guarda cada pregunta junto con el área que le toca.

    El área se persiste en vez de recalcularse después desde el puesto: así el
    desglose por tema sigue describiendo lo que de verdad se preguntó aunque la
    composición del puesto cambie más adelante.

    Resuelve el catálogo de una sola consulta aunque lleguen varias preguntas,
    que es el caso del calentamiento.
    """
    areas = areas_por_codigo({a.value for a in areas_enum})
    return [
        Intercambio.objects.create(
            entrevista=entrevista,
            numero=pregunta.numero,
            area=areas[area_enum.value],
            pregunta=pregunta.texto,
        )
        for pregunta, area_enum in zip(preguntas, areas_enum, strict=True)
    ]


def iniciar(
    usuario,
    puesto,
    nivel,
    tecnologia=None,
    proveedor: ProveedorIA | None = None,
    convocatoria=None,
    segunda_tecnologia=None,
):
    """Crea la entrevista y sus preguntas de calentamiento.

    `puesto`, `nivel`, `tecnologia` y `segunda_tecnologia` son instancias de los
    modelos de catálogo. `tecnologia` es opcional aquí solo porque la validación
    vive en `IniciarEntrevistaSerializer`, que la exige; `segunda_tecnologia` va
    solo en un puesto con capas, como Full Stack. Los enums que necesita el
    proveedor se derivan de su `codigo`. El área de cada pregunta no se recibe: la decide el puesto.

    Las primeras `PREGUNTAS_DE_CALENTAMIENTO` se piden en una sola llamada porque
    ninguna puede ser adaptativa todavía — no hay respuestas de las que
    adaptarse. De la siguiente en adelante se generan de a una, ya con el
    desempeño previo como guía.
    """
    proveedor = proveedor or get_proveedor()

    with transaction.atomic():
        entrevista = Entrevista.objects.create(
            usuario=usuario,
            puesto=puesto,
            nivel=nivel,
            tecnologia=tecnologia,
            segunda_tecnologia=segunda_tecnologia,
            convocatoria=convocatoria,
        )
        contexto = _contexto(entrevista)
        areas = [
            area_de_la_pregunta(contexto.puesto, numero)
            for numero in range(1, PREGUNTAS_DE_CALENTAMIENTO + 1)
        ]
        preguntas = proveedor.generar_preguntas_iniciales(contexto, areas)
        _crear_intercambios(entrevista, preguntas, areas)

    return entrevista


def responder(entrevista, texto: str, proveedor: ProveedorIA | None = None):
    """Registra la respuesta pendiente, la evalúa, y genera la siguiente
    pregunta o finaliza la entrevista.

    Orden de operaciones, pensado para que un reintento tras un fallo sea
    idempotente: guardar la respuesta -> llamar a la IA -> guardar la
    evaluación -> generar la siguiente pregunta. Si el intercambio ya tiene
    respuesta guardada (por un intento anterior que falló después de ese
    paso), no se reescribe — solo se reintenta la evaluación.

    La generación de la siguiente pregunta va dentro de la misma transacción
    que guarda la evaluación: si falla, ambas se deshacen y el reintento
    reencuentra el intercambio sin evaluar, en lugar de dejar la entrevista
    atascada sin pregunta pendiente ni estado final.
    """
    proveedor = proveedor or get_proveedor()
    contexto = _contexto(entrevista)

    intercambio = intercambio_pendiente(entrevista)
    if intercambio is None:
        raise SinIntercambioPendiente(
            f"La entrevista {entrevista.pk} no tiene un intercambio pendiente de respuesta"
        )

    if not intercambio.respuesta:
        intercambio.respuesta = texto
        intercambio.respondido_en = timezone.now()
        intercambio.tiempo_respuesta = int(
            (intercambio.respondido_en - intercambio.creado_en).total_seconds()
        )
        intercambio.save(update_fields=["respuesta", "respondido_en", "tiempo_respuesta"])

    # Se evalúa contra el área de ESTE intercambio, no una de la entrevista: en
    # una misma entrevista cada pregunta es de un tema distinto.
    resultado = calificar(
        contexto, intercambio.area_enum, intercambio.pregunta, intercambio.respuesta, proveedor
    )

    with transaction.atomic():
        evaluacion = guardar(intercambio, resultado, proveedor)

        siguiente_numero = intercambio.numero + 1
        if siguiente_numero > PREGUNTAS_POR_ENTREVISTA:
            _finalizar(entrevista)
        elif not entrevista.intercambios.filter(numero=siguiente_numero).exists():
            # Las de calentamiento ya existen desde `iniciar()`: intentar crearlas
            # otra vez violaría `UniqueConstraint(entrevista, numero)`. Solo se
            # genera la que falta, que es el caso de la tercera en adelante.
            siguiente_area = area_de_la_pregunta(contexto.puesto, siguiente_numero)
            pregunta = proveedor.generar_pregunta(
                contexto, siguiente_area, siguiente_numero, temas_evaluados(entrevista)
            )
            _crear_intercambios(entrevista, [pregunta], [siguiente_area])

    return evaluacion


def _finalizar(entrevista) -> None:
    entrevista.puntuacion_promedio = promedio_de_evaluaciones(entrevista)
    entrevista.fecha_fin = timezone.now()
    entrevista.estado = Entrevista.Estado.FINALIZADA
    entrevista.save(update_fields=["puntuacion_promedio", "fecha_fin", "estado"])


class EntrevistaNoEnCurso(ValueError):
    """Se pidió abandonar una entrevista que ya terminó (finalizada o abandonada)."""


def abandonar(entrevista) -> None:
    """El usuario deja la entrevista a medias, a sabiendas (lo confirmó en la
    interfaz). Es el camino manual a `ABANDONADA`; el otro es el pasivo de
    `marcar_abandonadas`, tras `MINUTOS_PARA_ABANDONO` sin actividad.

    Solo cambia el estado y la fecha de fin: intercambios y evaluaciones
    quedan como están, y la nota no se guarda —el reporte calcula la parcial
    sobre lo respondido—, igual que con el abandono pasivo.

    Es una sola actualización condicionada al estado, no leer-y-escribir: si
    justo termina la última respuesta en otra petición, gana quien llegue
    primero y el otro lo nota, en vez de pisar un `FINALIZADA` con `ABANDONADA`.
    """
    actualizadas = Entrevista.objects.filter(
        pk=entrevista.pk, estado=Entrevista.Estado.EN_PROGRESO
    ).update(estado=Entrevista.Estado.ABANDONADA, fecha_fin=timezone.now())
    if not actualizadas:
        raise EntrevistaNoEnCurso("Esta entrevista ya no está en progreso.")
    entrevista.refresh_from_db()


def marcar_abandonadas(usuario) -> int:
    """Transición perezosa: toda entrevista `EN_PROGRESO` de este usuario con
    más de `MINUTOS_PARA_ABANDONO` sin actividad pasa a `ABANDONADA`.

    Se invoca al consultar el historial, no con un planificador — el plan
    gratuito no ofrece tareas programadas fiables.

    Es una sola sentencia a propósito: al vivir dentro de un GET que se
    ejecuta en cada carga del historial, su coste no puede crecer con el
    número de entrevistas en progreso del usuario. `Coalesce` reproduce en
    SQL la regla "última actividad = última respuesta, o el inicio si aún no
    respondió nada".
    """
    limite = timezone.now() - timedelta(minutes=MINUTOS_PARA_ABANDONO)

    # `update()` no admite un queryset con agregación, así que la condición se
    # resuelve como subconsulta de claves. Sigue siendo un número de consultas
    # constante, que es lo que importa aquí.
    inactivas = (
        Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.EN_PROGRESO)
        .annotate(ultima_actividad=Coalesce(Max("intercambios__respondido_en"), "fecha_inicio"))
        .filter(ultima_actividad__lt=limite)
        .values("pk")
    )

    return Entrevista.objects.filter(pk__in=inactivas).update(
        estado=Entrevista.Estado.ABANDONADA
    )

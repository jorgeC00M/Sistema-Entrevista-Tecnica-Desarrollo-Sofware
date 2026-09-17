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
from django.db.models import Avg, Max
from django.utils import timezone

from apps.evaluaciones.services import calificar, guardar
from integrations.ia.base import ProveedorIA
from integrations.ia.factory import get_proveedor
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA

from .models import Entrevista, Intercambio
from .selectors import intercambio_pendiente, temas_evaluados

MINUTOS_PARA_ABANDONO = 30


def iniciar(usuario, area, nivel, proveedor: ProveedorIA | None = None) -> Entrevista:
    """Crea la entrevista y su primera pregunta.

    `area` y `nivel` son instancias de los modelos de catálogo; el enum que
    necesita el proveedor se deriva de su `codigo`.
    """
    proveedor = proveedor or get_proveedor()

    with transaction.atomic():
        entrevista = Entrevista.objects.create(usuario=usuario, area=area, nivel=nivel)
        pregunta = proveedor.generar_pregunta(
            entrevista.area_enum, entrevista.nivel_enum, numero=1, previas=[]
        )
        Intercambio.objects.create(
            entrevista=entrevista, numero=pregunta.numero, pregunta=pregunta.texto
        )

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
    area = entrevista.area_enum
    nivel = entrevista.nivel_enum

    intercambio = intercambio_pendiente(entrevista)
    if intercambio is None:
        raise ValueError(
            f"La entrevista {entrevista.pk} no tiene un intercambio pendiente de respuesta"
        )

    if not intercambio.respuesta:
        intercambio.respuesta = texto
        intercambio.respondido_en = timezone.now()
        intercambio.tiempo_respuesta = int(
            (intercambio.respondido_en - intercambio.creado_en).total_seconds()
        )
        intercambio.save(update_fields=["respuesta", "respondido_en", "tiempo_respuesta"])

    resultado = calificar(area, nivel, intercambio.pregunta, intercambio.respuesta, proveedor)

    with transaction.atomic():
        evaluacion = guardar(intercambio, resultado, proveedor)

        siguiente_numero = intercambio.numero + 1
        if siguiente_numero <= PREGUNTAS_POR_ENTREVISTA:
            pregunta = proveedor.generar_pregunta(
                area, nivel, siguiente_numero, temas_evaluados(entrevista)
            )
            Intercambio.objects.create(
                entrevista=entrevista, numero=pregunta.numero, pregunta=pregunta.texto
            )
        else:
            _finalizar(entrevista)

    return evaluacion


def _finalizar(entrevista) -> None:
    promedio = entrevista.intercambios.filter(evaluacion__isnull=False).aggregate(
        promedio=Avg("evaluacion__puntuacion")
    )["promedio"]

    entrevista.puntuacion_promedio = promedio
    entrevista.fecha_fin = timezone.now()
    entrevista.estado = Entrevista.Estado.FINALIZADA
    entrevista.save(update_fields=["puntuacion_promedio", "fecha_fin", "estado"])


def marcar_abandonadas(usuario) -> int:
    """Transición perezosa: toda entrevista `EN_PROGRESO` de este usuario con
    más de `MINUTOS_PARA_ABANDONO` sin actividad pasa a `ABANDONADA`.

    Se invoca al consultar el historial, no con un planificador — el plan
    gratuito no ofrece tareas programadas fiables.
    """
    limite = timezone.now() - timedelta(minutes=MINUTOS_PARA_ABANDONO)
    en_progreso = Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.EN_PROGRESO)

    ids_abandonadas = []
    for entrevista in en_progreso:
        ultima_respuesta = entrevista.intercambios.aggregate(m=Max("respondido_en"))["m"]
        ultima_actividad = ultima_respuesta or entrevista.fecha_inicio
        if ultima_actividad < limite:
            ids_abandonadas.append(entrevista.pk)

    if ids_abandonadas:
        Entrevista.objects.filter(pk__in=ids_abandonadas).update(
            estado=Entrevista.Estado.ABANDONADA
        )

    return len(ids_abandonadas)

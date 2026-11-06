"""Orquestador del flujo de entrevista.

Es la única pieza que conoce a la vez el proveedor de IA y los modelos. Las
vistas llaman exclusivamente a estas funciones — nunca construyen una consulta
de negocio ni tocan un adaptador de IA directamente.

Nada guarda estado en memoria: cada llamada reconstruye el contexto desde
PostgreSQL. Es necesario porque el backend en Render free se duerme por
inactividad y puede reiniciarse en cualquier momento.
"""

from __future__ import annotations

from django.db import IntegrityError, transaction
from django.utils import timezone

from apps.catalogos.selectors import areas_por_codigo
from apps.evaluaciones.models import Evaluacion
from apps.evaluaciones.services import calificar, guardar
from integrations.ia.base import ProveedorIA, RedactorDeVeredicto
from integrations.ia.exceptions import ErrorProveedorIA
from integrations.ia.factory import get_proveedor
from integrations.ia.prompts.schemas import (
    PREGUNTAS_DE_CALENTAMIENTO,
    PREGUNTAS_POR_ENTREVISTA,
    area_de_la_pregunta,
)

# Reexportadas: las vistas y los tests las nombran como `services.X`.
from .exceptions import (  # noqa: F401
    EntrevistaNoEnCurso,
    EntrevistaNoFinalizada,
    HayEntrevistaEnCurso,
    SinIntercambioPendiente,
    TiempoAgotado,
)
# El cierre por tiempo y el veredicto viven aparte; se reexportan porque las
# vistas y los tests los llaman como `services.X`.
from .cierre import cerrar_si_vencio, cerrar_vencidas  # noqa: F401
from .models import Entrevista, Intercambio
from .selectors import contexto_de, intercambio_pendiente, promedio_de_evaluaciones, temas_evaluados
from .veredicto import VERSION_DEL_VEREDICTO, pedir_veredicto, redactar_veredicto  # noqa: F401


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
    abandonar_en_curso: bool = False,
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

    Un usuario tiene a lo sumo una entrevista en curso. Si ya hay una (y no
    venció), se lanza `HayEntrevistaEnCurso` sin crear nada ni llamar a la IA;
    con `abandonar_en_curso`, se abandona en la misma transacción que crea la
    nueva, así que si la IA falla la anterior queda intacta. El índice
    `una_entrevista_en_curso_por_usuario` cubre la carrera entre dos pestañas.
    """
    # Una vencida no debe bloquear: se cierra antes de mirar.
    cerrar_vencidas(usuario)

    with transaction.atomic():
        en_curso = (
            Entrevista.objects.select_for_update()
            .filter(usuario=usuario, estado=Entrevista.Estado.EN_PROGRESO)
            .first()
        )
        if en_curso is not None:
            if not abandonar_en_curso:
                raise HayEntrevistaEnCurso(en_curso)
            try:
                abandonar(en_curso)
            except EntrevistaNoEnCurso:
                pass  # terminó en otra petición: ya no hay nada que abandonar

        try:
            # Punto de guardado propio: un choque con el índice no puede
            # romper la transacción exterior antes de leer la que ganó.
            with transaction.atomic():
                entrevista = Entrevista.objects.create(
                    usuario=usuario,
                    puesto=puesto,
                    nivel=nivel,
                    tecnologia=tecnologia,
                    segunda_tecnologia=segunda_tecnologia,
                    convocatoria=convocatoria,
                )
        except IntegrityError:
            ganadora = Entrevista.objects.filter(usuario=usuario, estado=Entrevista.Estado.EN_PROGRESO).first()
            raise HayEntrevistaEnCurso(ganadora) from None
        # El proveedor se resuelve recién aquí: un 409 no lo construye.
        proveedor = proveedor or get_proveedor()
        contexto = contexto_de(entrevista)
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

    Tras la última respuesta, ya finalizada la entrevista y **fuera** de la
    transacción, se redacta el veredicto: un fallo de la IA ahí no deshace la
    evaluación ni el cierre, solo deja el veredicto como no disponible.

    El límite de tiempo mira **cuándo llegó** la respuesta, no cuándo terminó
    la IA: una respuesta nueva tras el límite cierra la entrevista y lanza
    `TiempoAgotado` sin guardarse; una ya guardada a tiempo (un reintento) se
    evalúa igual, y si el límite venció entretanto la entrevista se cierra en
    vez de pagar una pregunta que nadie podrá responder.

    Si la IA falla del todo (tras los reintentos del SDK y la cadena), la
    respuesta queda marcada con `evaluacion_fallida_en`: el chat recargado ofrece
    «Reintentar» con la respuesta guardada en vez de volver a pedirla. Ver
    `_evaluar_y_continuar` para la garantía de una sola evaluación.
    """
    proveedor = proveedor or get_proveedor()
    contexto = contexto_de(entrevista)

    intercambio = intercambio_pendiente(entrevista)
    if intercambio is None:
        raise SinIntercambioPendiente(
            f"La entrevista {entrevista.pk} no tiene un intercambio pendiente de respuesta"
        )

    if not intercambio.respuesta and cerrar_si_vencio(entrevista):
        raise TiempoAgotado("Se acabó el tiempo de esta entrevista.")

    if not intercambio.respuesta:
        intercambio.respuesta = texto
        intercambio.respondido_en = timezone.now()
        intercambio.tiempo_respuesta = int(
            (intercambio.respondido_en - intercambio.creado_en).total_seconds()
        )
        intercambio.save(update_fields=["respuesta", "respondido_en", "tiempo_respuesta"])
    elif intercambio.evaluacion_fallida_en is not None:
        # Empieza un reintento: mientras dure, el chat recargado debe esperar,
        # no ofrecer «Reintentar». Si vuelve a fallar, se marca otra vez.
        Intercambio.objects.filter(pk=intercambio.pk).update(evaluacion_fallida_en=None)
        intercambio.evaluacion_fallida_en = None

    try:
        evaluacion, es_nueva = _evaluar_y_continuar(entrevista, intercambio, contexto, proveedor)
    except ErrorProveedorIA:
        # La respuesta queda guardada y marcada: quien recargue ve el fallo al
        # instante en vez de esperar. Fuera de la transacción ya deshecha, y
        # solo si nadie la evaluó entretanto (otra pestaña pudo ganar).
        Intercambio.objects.filter(pk=intercambio.pk, evaluacion__isnull=True).update(
            evaluacion_fallida_en=timezone.now()
        )
        raise

    # Solo quien cerró la entrevista redacta su veredicto; una petición que
    # perdió la carrera devuelve la evaluación ajena y no repite la llamada.
    if es_nueva and entrevista.estado == Entrevista.Estado.FINALIZADA:
        # El mismo proveedor (o cadena) de la petición, si sabe redactarlo; los
        # dobles de prueba de la entrevista no tienen por qué.
        redactar_veredicto(entrevista, proveedor if isinstance(proveedor, RedactorDeVeredicto) else None)
    return evaluacion


def _evaluar_y_continuar(entrevista, intercambio, contexto, proveedor):
    """Evalúa la respuesta guardada y deja lista la siguiente pregunta (o cierra).

    Devuelve `(evaluacion, es_nueva)`. Dos peticiones sobre el mismo intercambio
    (doble clic, dos pestañas) llaman las dos a la IA, pero solo una guarda: la
    fila del intercambio se bloquea antes de guardar, y la que llega segunda
    encuentra la evaluación ya hecha y la devuelve sin crear otra ni otra
    pregunta. Bloquear durante la llamada a la IA evitaría pagarla dos veces,
    pero retendría la fila 10-40 s, que es justo lo que este orden evita.
    """
    # Se evalúa contra el área de ESTE intercambio, no una de la entrevista: en
    # una misma entrevista cada pregunta es de un tema distinto.
    resultado = calificar(
        contexto, intercambio.area_enum, intercambio.pregunta, intercambio.respuesta, proveedor
    )

    with transaction.atomic():
        bloqueado = Intercambio.objects.select_for_update().get(pk=intercambio.pk)
        existente = Evaluacion.objects.filter(intercambio=bloqueado).first()
        if existente is not None:
            return existente, False

        evaluacion = guardar(bloqueado, resultado, proveedor)

        siguiente_numero = intercambio.numero + 1
        if siguiente_numero > PREGUNTAS_POR_ENTREVISTA:
            _finalizar(entrevista)
        elif timezone.now() >= entrevista.fecha_limite:
            cerrar_si_vencio(entrevista)
        elif not entrevista.intercambios.filter(numero=siguiente_numero).exists():
            # Las de calentamiento ya existen desde `iniciar()`: intentar crearlas
            # otra vez violaría `UniqueConstraint(entrevista, numero)`. Solo se
            # genera la que falta, que es el caso de la tercera en adelante.
            siguiente_area = area_de_la_pregunta(contexto.puesto, siguiente_numero)
            pregunta = proveedor.generar_pregunta(
                contexto, siguiente_area, siguiente_numero, temas_evaluados(entrevista)
            )
            _crear_intercambios(entrevista, [pregunta], [siguiente_area])

    return evaluacion, True


def _finalizar(entrevista) -> None:
    entrevista.puntuacion_promedio = promedio_de_evaluaciones(entrevista)
    entrevista.fecha_fin = timezone.now()
    entrevista.estado = Entrevista.Estado.FINALIZADA
    entrevista.save(update_fields=["puntuacion_promedio", "fecha_fin", "estado"])


def abandonar(entrevista) -> None:
    """El usuario deja la entrevista a medias, a sabiendas (lo confirmó en la
    interfaz). Es el camino manual a `ABANDONADA`; el otro es vencer el límite
    sin ninguna respuesta (`cerrar_vencidas`, `cerrar_si_vencio`).

    Solo cambia el estado y la fecha de fin: intercambios y evaluaciones
    quedan como están, como retroalimentación sin nota. Solo una finalizada
    tiene nota.

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

"""Vistas de la API de entrevistas.

Solo traducen HTTP: la lógica vive en `services.py` y `selectors.py`, y
ninguna vista importa un adaptador de IA. Los errores del proveedor tampoco se
capturan aquí — suben hasta `apps.common.exceptions.manejador_de_excepciones`,
que es el único lugar donde la taxonomía de IA se convierte en código HTTP.

Pertenencia: toda consulta filtra por `usuario=request.user`. Un usuario que
pide la entrevista de otro recibe 404, no 403 — no se revela que existe.
"""

from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA

from . import selectors, services
from .models import Entrevista
from .convocatorias import analizar_convocatoria
from .serializers import (
    AnalizarConvocatoriaSerializer,
    ConvocatoriaSerializer,
    ConfiguracionSerializer,
    EntrevistaSerializer,
    IniciarEntrevistaSerializer,
    IntercambioSerializer,
    ResponderSerializer,
)


def _pregunta_dict(intercambio, con_estado: bool = False) -> dict | None:
    """La pregunta para el chat. `con_estado` (solo el detalle) suma si ya tiene
    respuesta guardada y si su evaluación falló: con eso el chat recargado no
    vuelve a pedirla, espera la evaluación o ofrece «Reintentar»."""
    if intercambio is None:
        return None
    datos = {"numero": intercambio.numero, "texto": intercambio.pregunta}
    if con_estado:
        datos |= {
            "respuesta": intercambio.respuesta,
            "respondido_en": intercambio.respondido_en.isoformat() if intercambio.respondido_en else None,
            "evaluacion_fallida": intercambio.evaluacion_fallida_en is not None,
        }
    return datos


class EntrevistaListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @property
    def throttle_scope(self) -> str | None:
        """Solo el alta consume una llamada al proveedor de IA (genera la
        primera pregunta). Listar el historial se consulta a menudo y no debe
        gastar ese cupo, así que fuera del POST no hay ámbito y
        `ScopedRateThrottle` deja pasar la petición."""
        return "iniciar-entrevista" if self.request.method == "POST" else None

    def get(self, request):
        services.cerrar_vencidas(request.user)
        return Response(
            EntrevistaSerializer(selectors.entrevistas_de(request.user), many=True).data
        )

    def post(self, request):
        entrada = IniciarEntrevistaSerializer(data=request.data, context={"request": request})
        entrada.is_valid(raise_exception=True)

        try:
            entrevista = services.iniciar(
                request.user,
                entrada.validated_data["puesto"],
                entrada.validated_data["nivel"],
                entrada.validated_data["tecnologia"],
                segunda_tecnologia=entrada.validated_data.get("segunda_tecnologia"),
                convocatoria=entrada.validated_data.get("convocatoria"),
                abandonar_en_curso=entrada.validated_data["abandonar_en_curso"],
            )
        except services.HayEntrevistaEnCurso as exc:
            # Con la entrevista en curso: la interfaz arma el aviso con datos
            # del servidor aunque su caché no supiera de ella.
            return Response(
                {
                    "detail": str(exc),
                    "entrevista_en_curso": EntrevistaSerializer(exc.entrevista).data if exc.entrevista else None,
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "pregunta": _pregunta_dict(selectors.primer_intercambio(entrevista)),
                "total_preguntas": PREGUNTAS_POR_ENTREVISTA,
            },
            status=status.HTTP_201_CREATED,
        )


class EntrevistaDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)
        # Un enlace directo o una pestaña que quedó abierta no se saltan el
        # límite: cada puerta lo aplica, no solo el historial.
        services.cerrar_si_vencio(entrevista)

        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "pregunta_pendiente": _pregunta_dict(selectors.intercambio_pendiente(entrevista), con_estado=True),
                "total_preguntas": PREGUNTAS_POR_ENTREVISTA,
            }
        )


class ResponderView(APIView):
    permission_classes = [IsAuthenticated]
    # Es el endpoint que gasta una llamada de pago al proveedor por petición.
    throttle_scope = "evaluar"

    def post(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)

        # No se cierra aquí si venció: una respuesta ya guardada a tiempo (un
        # reintento) todavía se evalúa. `services.responder` decide por la
        # pregunta pendiente.
        if entrevista.estado != Entrevista.Estado.EN_PROGRESO:
            return Response(
                {"detail": "Esta entrevista ya no está en progreso."},
                status=status.HTTP_409_CONFLICT,
            )

        entrada = ResponderSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        # El valor de retorno se descarta a propósito: la calificación no se
        # publica hasta que la entrevista termina. Se sigue calculando y
        # guardando — es lo que alimenta la adaptatividad de las preguntas
        # siguientes y lo que luego muestra el módulo de resultados.
        # `TiempoAgotado` y `SinIntercambioPendiente` (una carrera) son 409 por
        # el manejador central; cualquier otro `ValueError` sube como fallo real.
        services.responder(entrevista, entrada.validated_data["respuesta"])

        # Se vuelve a pedir, no `refresh_from_db()`: ese no recalcula la
        # anotación `preguntas_calificadas`, que quedaba con una de menos.
        entrevista = selectors.entrevista_del_usuario(request.user, pk)
        # Una respuesta guardada a tiempo puede terminar de evaluarse ya vencido
        # el límite: entonces la entrevista quedó cerrada y no hay siguiente,
        # aunque exista la de calentamiento sin responder.
        en_curso = entrevista.estado == Entrevista.Estado.EN_PROGRESO
        return Response(
            {
                "siguiente_pregunta": _pregunta_dict(
                    selectors.intercambio_pendiente(entrevista) if en_curso else None
                ),
                "entrevista": EntrevistaSerializer(entrevista).data,
            }
        )


class ResultadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)
        services.cerrar_si_vencio(entrevista)

        evaluacion = selectors.visibilidad_de_la_evaluacion(entrevista)
        finalizada = evaluacion == "completa"

        intercambios = list(selectors.intercambios_de(entrevista))
        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "intercambios": IntercambioSerializer(
                    intercambios,
                    many=True,
                    context={"evaluacion": evaluacion},
                ).data,
                # El resumen y el veredicto resumen la nota: solo con ella.
                "resumen": selectors.resumen_de(entrevista, intercambios) if finalizada else None,
                "veredicto": entrevista.veredicto_ia if finalizada else None,
            }
        )


class VeredictoView(APIView):
    """`POST /api/entrevistas/<id>/veredicto/`: el párrafo de la IA que resume la entrevista.

    Devuelve el guardado sin llamar a la IA si ya existe; si falta o falló, lo
    redacta. 200 aunque el proveedor falle (`estado: "no_disponible"`); 409 si
    no está finalizada; 404 si es de otro usuario.
    """

    permission_classes = [IsAuthenticated]
    throttle_scope = "veredicto"

    def post(self, request, pk):
        return Response(services.pedir_veredicto(request.user, pk))


class UltimaConfiguracionView(APIView):
    """Puesto, tecnología y nivel de la última entrevista del usuario, o 204.

    204 y no 404: no tener entrevistas no es un error, es el caso normal de un
    usuario nuevo, y la pantalla simplemente no muestra "Tu última entrevista".
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        entrevista = selectors.ultima_configuracion(request.user)
        if entrevista is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(ConfiguracionSerializer(entrevista).data)


class AbandonarView(APIView):
    """`POST /api/entrevistas/<id>/abandonar/`: dejar la entrevista a medias.

    La interfaz lo pide solo tras confirmarlo en un modal. 409 si ya no está en
    curso; 404 si es de otro usuario (la pertenencia se resuelve en la consulta).
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)
        services.abandonar(entrevista)
        return Response(EntrevistaSerializer(entrevista).data)


class AnalizarConvocatoriaView(APIView):
    """`POST /api/entrevistas/convocatoria/`: el aviso pegado y su perfil detectado.

    201 con `{id, perfil}`; 422 si no parece un puesto de desarrollo de software
    (no se inventa uno); 400 si el texto es demasiado corto o largo. Los fallos
    de la IA los traduce el manejador central (503/502).
    """

    permission_classes = [IsAuthenticated]
    throttle_scope = "analizar-convocatoria"

    def post(self, request):
        entrada = AnalizarConvocatoriaSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        convocatoria = analizar_convocatoria(request.user, entrada.validated_data["texto"])
        datos = ConvocatoriaSerializer(convocatoria).data

        if not convocatoria.perfil.get("identificado"):
            return Response(
                {
                    "detail": (
                        "No pudimos identificar el puesto: el aviso no parece ser de desarrollo "
                        "de software, o no menciona el puesto ni las tecnologías."
                    ),
                    **datos,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )
        return Response(datos, status=status.HTTP_201_CREATED)

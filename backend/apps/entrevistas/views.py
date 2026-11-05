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


def _pregunta_dict(intercambio) -> dict | None:
    if intercambio is None:
        return None
    return {"numero": intercambio.numero, "texto": intercambio.pregunta}


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

        entrevista = services.iniciar(
            request.user,
            entrada.validated_data["puesto"],
            entrada.validated_data["nivel"],
            entrada.validated_data["tecnologia"],
            segunda_tecnologia=entrada.validated_data.get("segunda_tecnologia"),
            convocatoria=entrada.validated_data.get("convocatoria"),
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
                "pregunta_pendiente": _pregunta_dict(selectors.intercambio_pendiente(entrevista)),
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

        try:
            # El valor de retorno se descarta a propósito: la calificación no se
            # publica hasta que la entrevista termina. Se sigue calculando y
            # guardando — es lo que alimenta la adaptatividad de las preguntas
            # siguientes y lo que luego muestra el módulo de resultados.
            services.responder(entrevista, entrada.validated_data["respuesta"])
        except services.TiempoAgotado as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except services.SinIntercambioPendiente as exc:
            # No debería ocurrir dado el chequeo de estado de arriba; queda
            # como red de seguridad ante una condición de carrera. Se captura
            # el tipo exacto: cualquier otro ValueError (por ejemplo, un área
            # sin miembro en el enum) es un fallo real y debe subir.
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)

        entrevista.refresh_from_db()
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

        # Solo una finalizada tiene nota. En curso no se publica ninguna
        # evaluación: este mismo endpoint es el que usa el chat para
        # reconstruirse al recargar, así que devolverlas filtraría la nota a
        # mitad de entrevista. Abandonada o con el tiempo agotado se publica la
        # retroalimentación sin puntajes ni niveles: lo incompleto no se
        # califica, pero se aprende de lo que sí se respondió.
        finalizada = entrevista.estado == Entrevista.Estado.FINALIZADA
        if finalizada:
            evaluacion = "completa"
        elif entrevista.estado == Entrevista.Estado.EN_PROGRESO:
            evaluacion = None
        else:
            evaluacion = "sin_nota"

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
        try:
            veredicto = services.pedir_veredicto(request.user, pk)
        except services.EntrevistaNoFinalizada as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        return Response(veredicto)


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
        try:
            services.abandonar(entrevista)
        except services.EntrevistaNoEnCurso as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        return Response(EntrevistaSerializer(entrevista).data)


class AnalizarConvocatoriaView(APIView):
    """`POST /api/entrevistas/convocatoria/`: pegar o subir el aviso y detectar su perfil.

    201 con `{id, perfil}`; 422 si no parece un puesto de desarrollo de software
    (no se inventa uno); 400 si el archivo no sirve. Los fallos de la IA los
    traduce el manejador central (503/502).
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

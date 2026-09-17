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

from apps.evaluaciones.serializers import EvaluacionSerializer
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA

from . import selectors, services
from .models import Entrevista
from .serializers import (
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

    def get(self, request):
        services.marcar_abandonadas(request.user)
        return Response(
            EntrevistaSerializer(selectors.entrevistas_de(request.user), many=True).data
        )

    def post(self, request):
        entrada = IniciarEntrevistaSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        entrevista = services.iniciar(
            request.user,
            entrada.validated_data["area"],
            entrada.validated_data["nivel"],
        )

        primera_pregunta = entrevista.intercambios.order_by("numero").first()
        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "pregunta": _pregunta_dict(primera_pregunta),
                "total_preguntas": PREGUNTAS_POR_ENTREVISTA,
            },
            status=status.HTTP_201_CREATED,
        )


class EntrevistaDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)

        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "pregunta_pendiente": _pregunta_dict(selectors.intercambio_pendiente(entrevista)),
                "total_preguntas": PREGUNTAS_POR_ENTREVISTA,
            }
        )


class ResponderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)

        if entrevista.estado != Entrevista.Estado.EN_PROGRESO:
            return Response(
                {"detail": "Esta entrevista ya no está en progreso."},
                status=status.HTTP_409_CONFLICT,
            )

        entrada = ResponderSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        try:
            evaluacion = services.responder(entrevista, entrada.validated_data["respuesta"])
        except ValueError as exc:
            # No debería ocurrir dado el chequeo de estado de arriba; queda
            # como red de seguridad ante una condición de carrera.
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)

        entrevista.refresh_from_db()
        return Response(
            {
                "evaluacion": EvaluacionSerializer(evaluacion).data,
                "siguiente_pregunta": _pregunta_dict(
                    selectors.intercambio_pendiente(entrevista)
                ),
                "entrevista": EntrevistaSerializer(entrevista).data,
            }
        )


class ResultadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        entrevista = selectors.entrevista_del_usuario(request.user, pk)

        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "intercambios": IntercambioSerializer(
                    selectors.intercambios_con_evaluacion(entrevista), many=True
                ).data,
            }
        )

"""Vistas de la API de entrevistas.

Solo traducen HTTP: la lógica de negocio vive en `services/entrevista.py` y
`services/ia/`. Ninguna vista importa un adaptador de IA directamente.

Pertenencia: toda consulta filtra por `usuario=request.user`. Un usuario que
pide la entrevista de otro recibe 404, no 403 — no se revela que existe.
`get_object_or_404` con ese filtro combinado es lo que lo garantiza.
"""

from __future__ import annotations

import logging

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Entrevista
from .serializers import (
    EntrevistaSerializer,
    EvaluacionSerializer,
    IniciarEntrevistaSerializer,
    IntercambioSerializer,
    ResponderSerializer,
)
from .services import entrevista as servicio
from .services import estadisticas as servicio_estadisticas
from .services.ia.errores import ErrorPermanente, ErrorProveedorIA, ErrorTransitorio, RespuestaIAInvalida
from .services.ia.schemas import PREGUNTAS_POR_ENTREVISTA, AreaTecnica, Nivel

logger = logging.getLogger(__name__)


def _respuesta_para_error_ia(exc: ErrorProveedorIA) -> Response:
    if isinstance(exc, ErrorTransitorio):
        return Response(
            {"detail": "El servicio de IA no está disponible en este momento. Intenta de nuevo."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    if isinstance(exc, ErrorPermanente):
        logger.error("Error permanente del proveedor de IA: %s", exc)
        return Response(
            {"detail": "El servicio de IA rechazó la solicitud."}, status=status.HTTP_502_BAD_GATEWAY
        )
    # RespuestaIAInvalida
    logger.error("Respuesta de IA inválida: %s", exc)
    return Response(
        {"detail": "El servicio de IA devolvió una respuesta inesperada."},
        status=status.HTTP_502_BAD_GATEWAY,
    )


def _pregunta_dict(intercambio) -> dict | None:
    if intercambio is None:
        return None
    return {"numero": intercambio.numero, "texto": intercambio.pregunta}


class EntrevistaListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        servicio.marcar_abandonadas(request.user)
        entrevistas = Entrevista.objects.filter(usuario=request.user)
        return Response(EntrevistaSerializer(entrevistas, many=True).data)

    def post(self, request):
        entrada = IniciarEntrevistaSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        try:
            entrevista = servicio.iniciar(
                request.user,
                AreaTecnica(entrada.validated_data["area"]),
                Nivel(entrada.validated_data["nivel"]),
            )
        except (ErrorTransitorio, ErrorPermanente, RespuestaIAInvalida) as exc:
            return _respuesta_para_error_ia(exc)

        primera_pregunta = entrevista.intercambios.order_by("numero").first()
        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "pregunta": _pregunta_dict(primera_pregunta),
                "total_preguntas": PREGUNTAS_POR_ENTREVISTA,
            },
            status=status.HTTP_201_CREATED,
        )


def _entrevista_del_usuario(request, pk: int) -> Entrevista:
    return get_object_or_404(Entrevista, pk=pk, usuario=request.user)


class EntrevistaDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        entrevista = _entrevista_del_usuario(request, pk)
        pendiente = entrevista.intercambios.filter(evaluacion__isnull=True).order_by("numero").first()

        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "pregunta_pendiente": _pregunta_dict(pendiente),
                "total_preguntas": PREGUNTAS_POR_ENTREVISTA,
            }
        )


class ResponderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        entrevista = _entrevista_del_usuario(request, pk)

        if entrevista.estado != Entrevista.Estado.EN_PROGRESO:
            return Response(
                {"detail": "Esta entrevista ya no está en progreso."},
                status=status.HTTP_409_CONFLICT,
            )

        entrada = ResponderSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        try:
            evaluacion = servicio.responder(entrevista, entrada.validated_data["respuesta"])
        except ValueError as exc:
            # No debería ocurrir dado el chequeo de estado de arriba; queda
            # como red de seguridad ante una condición de carrera.
            return Response({"detail": str(exc)}, status=status.HTTP_409_CONFLICT)
        except (ErrorTransitorio, ErrorPermanente, RespuestaIAInvalida) as exc:
            return _respuesta_para_error_ia(exc)

        entrevista.refresh_from_db()
        siguiente = entrevista.intercambios.filter(evaluacion__isnull=True).order_by("numero").first()

        return Response(
            {
                "evaluacion": EvaluacionSerializer(evaluacion).data,
                "siguiente_pregunta": _pregunta_dict(siguiente),
                "entrevista": EntrevistaSerializer(entrevista).data,
            }
        )


class ResultadosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        entrevista = _entrevista_del_usuario(request, pk)
        intercambios = entrevista.intercambios.select_related("evaluacion").order_by("numero")

        return Response(
            {
                "entrevista": EntrevistaSerializer(entrevista).data,
                "intercambios": IntercambioSerializer(intercambios, many=True).data,
            }
        )


class EstadisticasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(servicio_estadisticas.calcular(request.user))

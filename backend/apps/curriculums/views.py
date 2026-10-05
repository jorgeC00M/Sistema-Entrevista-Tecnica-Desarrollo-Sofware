"""Vistas de la API de currículums.

Solo traducen HTTP: la orquestación vive en `services.py` y las lecturas en
`selectors.py`. Ninguna vista importa `integrations.documentos` directamente.

Los errores al leer el documento no se capturan aquí: suben hasta
`apps.common.exceptions.manejador_de_excepciones`, igual que los del proveedor
de IA.

Pertenencia: toda consulta filtra por `usuario=request.user`, así que pedir el
currículum de otra persona devuelve 404 y no 403 — un 403 confirmaría que
existe.
"""

from __future__ import annotations

from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import selectors, services
from .serializers import (
    CurriculumListaSerializer,
    CurriculumSerializer,
    SubirCurriculumSerializer,
)


class CurriculumListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    @property
    def throttle_scope(self) -> str | None:
        """Solo el alta hace trabajo costoso: abrir el documento y recorrerlo
        palabra por palabra. Consultar el historial se hace a menudo y no debe
        gastar ese cupo, así que fuera del POST no hay ámbito y
        `ScopedRateThrottle` deja pasar la petición."""
        return "analizar-cv" if self.request.method == "POST" else None

    def get(self, request):
        return Response(
            CurriculumListaSerializer(
                selectors.curriculums_del_usuario(request.user), many=True
            ).data
        )

    def post(self, request):
        entrada = SubirCurriculumSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)

        archivo = entrada.validated_data["archivo"]
        curriculum = services.analizar(
            usuario=request.user,
            contenido=archivo.read(),
            nombre_archivo=archivo.name,
            convocatoria=entrada.validated_data.get("convocatoria", ""),
        )

        return Response(
            CurriculumSerializer(curriculum).data, status=status.HTTP_201_CREATED
        )


class CurriculumDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        return Response(
            CurriculumSerializer(selectors.curriculum_del_usuario(request.user, pk)).data
        )

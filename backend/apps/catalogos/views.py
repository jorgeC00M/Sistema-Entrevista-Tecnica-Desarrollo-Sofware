"""Catálogos que alimentan la pantalla de selección de área.

Se sirven en una sola respuesta porque el frontend los necesita juntos y son
pocos registros: dos peticiones para seis filas no compensan.
"""

from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA

from .models import Area, Nivel
from .serializers import AreaSerializer, NivelSerializer


class CatalogosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "areas": AreaSerializer(Area.objects.filter(activo=True), many=True).data,
                "niveles": NivelSerializer(Nivel.objects.filter(activo=True), many=True).data,
                "preguntas_por_entrevista": PREGUNTAS_POR_ENTREVISTA,
            }
        )

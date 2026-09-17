"""Catálogos que alimentan la pantalla de selección de área.

Se sirven en una sola respuesta porque el frontend los necesita juntos y son
pocos registros: dos peticiones para seis filas no compensan.
"""

from __future__ import annotations

from rest_framework.permissions import AllowAny, IsAuthenticated
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


class CatalogosPublicosView(CatalogosView):
    """El mismo catálogo, sin exigir sesión, para la landing.

    Hereda el cuerpo del `get` y solo cambia el permiso: así no hay dos
    construcciones de la respuesta que mantener sincronizadas. Se sirve en una
    ruta aparte en lugar de abrir la de arriba, para que siga siendo explícito
    qué publica el sistema y qué entrega solo a usuarios autenticados.

    No expone nada que la landing no muestre: ni conteos, ni usuarios, ni
    entrevistas.
    """

    permission_classes = [AllowAny]

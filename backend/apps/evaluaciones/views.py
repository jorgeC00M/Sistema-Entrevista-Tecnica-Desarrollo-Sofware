from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import calcular_estadisticas, calcular_retroalimentacion


class EstadisticasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calcular_estadisticas(request.user))


class RetroalimentacionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calcular_retroalimentacion(request.user))

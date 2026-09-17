from __future__ import annotations

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import calcular_estadisticas


class EstadisticasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(calcular_estadisticas(request.user))

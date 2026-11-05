"""Catálogos que alimentan la pantalla de inicio de una entrevista.

Se sirven en una sola respuesta porque el frontend los necesita juntos y son
pocos registros: cuatro peticiones para una docena de filas no compensan.

`puestos` y `niveles` son lo que se elige; las tecnologías de cada puesto
llegan por `/puestos/`, que es lo que lee la pantalla. `areas` se sigue publicando aunque ya no se seleccione: cada puesto
declara qué áreas cubre, y la pantalla necesita sus nombres para mostrarlas.
"""

from __future__ import annotations

from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.evaluaciones.rubricas import (
    CRITERIOS,
    DESCRIPTORES,
    NIVEL_MAXIMO,
    NOMBRES_DE_CRITERIOS,
    PESOS,
)
from integrations.ia.prompts.schemas import PREGUNTAS_POR_ENTREVISTA

from .selectors import (
    areas_activas,
    niveles_activos,
    puestos_activos,
    puestos_con_tecnologias,
)
from .serializers import (
    AreaSerializer,
    NivelSerializer,
    PuestoConTecnologiasSerializer,
    PuestoSerializer,
)


class CatalogosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "puestos": PuestoSerializer(puestos_activos(), many=True).data,
                "niveles": NivelSerializer(niveles_activos(), many=True).data,
                "areas": AreaSerializer(areas_activas(), many=True).data,
                "preguntas_por_entrevista": PREGUNTAS_POR_ENTREVISTA,
                "rubrica": _rubrica(),
            }
        )


def _rubrica() -> dict:
    """La rúbrica con la que se califica, tal como la recibe el evaluador.

    Se publica para que el reporte explique cada nota con los mismos
    descriptores que leyó el modelo, sin copiarlos en el frontend.
    """
    return {
        "nivel_maximo": NIVEL_MAXIMO,
        "criterios": [
            {
                "codigo": criterio,
                "nombre": NOMBRES_DE_CRITERIOS[criterio],
                "peso": PESOS[criterio],
                "descriptores": list(DESCRIPTORES[criterio]),
            }
            for criterio in CRITERIOS
        ],
    }


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


class PuestosView(APIView):
    """Todo lo que necesita la pantalla Simular entrevista, en una respuesta:
    puestos con sus tecnologías (cada una con su `capa`), niveles, áreas y
    duración.

    Se cachea cinco minutos en el cliente porque el catálogo cambia muy poco;
    `private` porque requiere sesión.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        puestos = puestos_con_tecnologias()
        respuesta = Response(
            {
                "puestos": PuestoConTecnologiasSerializer(puestos, many=True).data,
                # Lo demás que la pantalla necesita, para no pedir además el
                # catálogo general: los niveles (con su texto), los nombres de
                # las áreas que cubre cada puesto y la duración.
                "niveles": NivelSerializer(niveles_activos(), many=True).data,
                "areas": AreaSerializer(areas_activas(), many=True).data,
                "preguntas_por_entrevista": PREGUNTAS_POR_ENTREVISTA,
            }
        )
        respuesta["Cache-Control"] = "private, max-age=300"
        return respuesta

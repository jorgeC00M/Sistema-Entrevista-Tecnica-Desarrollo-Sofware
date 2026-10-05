"""Traducción centralizada de errores del dominio a respuestas HTTP.

Las taxonomías de `integrations.ia.exceptions` y
`integrations.documentos.exceptions` existen para que ninguna capa necesite
conocer el SDK del proveedor ni la librería de PDF. Este manejador es el único
punto donde esas taxonomías se convierten en código HTTP, así que las vistas no
repiten el mismo try/except: dejan subir la excepción y DRF la trae hasta aquí.

Se registra en REST_FRAMEWORK["EXCEPTION_HANDLER"].
"""

from __future__ import annotations

import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as manejador_drf

from integrations.documentos.exceptions import (
    DocumentoCorrupto,
    DocumentoDemasiadoGrande,
    ErrorDeDocumento,
    FormatoNoSoportado,
)
from integrations.ia.exceptions import (
    ErrorPermanente,
    ErrorProveedorIA,
    ErrorTransitorio,
    ProveedorNoConfigurado,
    RespuestaIAInvalida,
)

logger = logging.getLogger(__name__)


def _respuesta_para_error_ia(exc: ErrorProveedorIA) -> Response:
    if isinstance(exc, ProveedorNoConfigurado):
        # Para el cliente es indistinguible de una caída, pero para quien
        # opera el servicio es un fallo de configuración que hay que ver en
        # el log — por eso se registra y el transitorio no.
        logger.error("Proveedor de IA no configurado: %s", exc)
        return Response(
            {"detail": "El servicio de IA no está disponible en este momento. Intenta de nuevo."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if isinstance(exc, ErrorTransitorio):
        # No se registra como error: es la caída esperable de un servicio
        # externo y el cliente puede reintentar.
        return Response(
            {"detail": "El servicio de IA no está disponible en este momento. Intenta de nuevo."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if isinstance(exc, ErrorPermanente):
        logger.error("Error permanente del proveedor de IA: %s", exc)
        return Response(
            {"detail": "El servicio de IA rechazó la solicitud."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if isinstance(exc, RespuestaIAInvalida):
        logger.error("Respuesta de IA inválida: %s", exc)
        return Response(
            {"detail": "El servicio de IA devolvió una respuesta inesperada."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    logger.error("Error no clasificado del proveedor de IA: %s", exc)
    return Response(
        {"detail": "Falló la comunicación con el servicio de IA."},
        status=status.HTTP_502_BAD_GATEWAY,
    )


def _respuesta_para_error_de_documento(exc: ErrorDeDocumento) -> Response:
    """Todos son 400: el problema está en el archivo que mandó el cliente.

    A diferencia de los errores de IA, aquí no hay nada caído ni nada que
    reintentar, y el mensaje de la excepción se le muestra al usuario porque es
    accionable —qué formato se acepta, cuántas páginas son demasiadas—. Tampoco
    se registran en el log: subir un archivo equivocado es un uso normal del
    sistema, no un incidente.
    """
    if isinstance(exc, (FormatoNoSoportado, DocumentoDemasiadoGrande)):
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, DocumentoCorrupto):
        return Response(
            {
                "detail": (
                    "No se pudo abrir el archivo. Puede estar dañado o protegido con "
                    "contraseña; prueba exportándolo de nuevo desde Word o Google Docs."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({"detail": "No se pudo procesar el documento."}, status=status.HTTP_400_BAD_REQUEST)


def manejador_de_excepciones(exc, context):
    if isinstance(exc, ErrorProveedorIA):
        return _respuesta_para_error_ia(exc)
    if isinstance(exc, ErrorDeDocumento):
        return _respuesta_para_error_de_documento(exc)
    return manejador_drf(exc, context)

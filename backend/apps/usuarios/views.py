"""Vistas de autenticación.

El login con email/contraseña usa `TokenObtainPairView` de simplejwt sin
modificar (respeta `USERNAME_FIELD = "email"` del modelo automáticamente).
El login con Google emite exactamente el mismo par de tokens JWT que el login
normal — el resto del sistema no distingue cómo se autenticó el usuario.
"""

from __future__ import annotations

import logging

from django.conf import settings
from django.db import transaction
from google.auth import exceptions as google_exceptions
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from . import services
from .models import Usuario
from .serializers import (
    CambiarContrasenaSerializer,
    GoogleLoginSerializer,
    PerfilSerializer,
    RegistroSerializer,
)

logger = logging.getLogger(__name__)


def _tokens_para(usuario: Usuario) -> dict[str, str]:
    refresh = RefreshToken.for_user(usuario)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class LoginView(TokenObtainPairView):
    """Igual que la vista de simplejwt, solo añade el ámbito de límite.

    Es pública y compara contraseñas, así que sin límite adivinar una a
    fuerza bruta no cuesta nada.
    """

    throttle_scope = "login"


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]
    throttle_scope = "registro"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()
        return Response(_tokens_para(usuario), status=status.HTTP_201_CREATED)


class PerfilView(generics.RetrieveAPIView):
    serializer_class = PerfilSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self) -> Usuario:
        return self.request.user


class CambiarContrasenaView(APIView):
    """Cambia la contraseña y cierra las demás sesiones.

    Todo refresh token emitido antes queda en la lista negra, así que ningún
    otro dispositivo puede renovar su acceso; este recibe un par nuevo y sigue
    conectado. Los access tokens ya emitidos valen hasta caducar (15 min): la
    lista negra solo alcanza a los refresh. Los refresh emitidos antes de
    activar `token_blacklist` no quedaron registrados y caducan solos.
    """

    permission_classes = [IsAuthenticated]
    throttle_scope = "contrasena"

    def post(self, request):
        usuario = request.user
        serializer = CambiarContrasenaSerializer(data=request.data, context={"usuario": usuario})
        serializer.is_valid(raise_exception=True)

        # Atómico: una contraseña cambiada con las sesiones viejas aún vivas
        # sería justo lo que el cambio debía evitar.
        with transaction.atomic():
            usuario.set_password(serializer.validated_data["nueva"])
            usuario.save(update_fields=["password"])
            # Una sola inserción para todos; los que ya estaban en la lista
            # negra (un cambio anterior) se saltan en vez de fallar.
            BlacklistedToken.objects.bulk_create(
                [BlacklistedToken(token=token) for token in OutstandingToken.objects.filter(user=usuario)],
                ignore_conflicts=True,
            )

        return Response(_tokens_para(usuario), status=status.HTTP_200_OK)


class GoogleLoginView(APIView):
    """Inicio de sesión con una cuenta de Google.

    Recibe el ID token que el frontend obtiene de Google Identity Services,
    lo verifica contra las claves públicas de Google (nunca se confía en el
    email que el cliente diga tener) y busca o crea el usuario por email.
    Las cuentas creadas así quedan con contraseña inutilizable: no pueden
    autenticarse por email/contraseña salvo que el usuario establezca una.
    """

    permission_classes = [AllowAny]
    # Misma tasa que el login por contraseña: es la otra puerta pública.
    throttle_scope = "login"

    def post(self, request):
        entrada = GoogleLoginSerializer(data=request.data)
        entrada.is_valid(raise_exception=True)
        token = entrada.validated_data["id_token"]

        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            return Response(
                {"detail": "El inicio de sesión con Google no está configurado en el servidor."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            payload = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError:
            # MalformedError e InvalidValue (firma inválida, token expirado,
            # audiencia incorrecta...) heredan de ValueError en google-auth.
            return Response({"detail": "Token de Google inválido."}, status=status.HTTP_401_UNAUTHORIZED)
        except google_exceptions.TransportError as exc:
            logger.warning("No se pudo contactar a Google para verificar el token: %s", exc)
            return Response(
                {"detail": "No se pudo verificar el token con Google. Intenta de nuevo."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not payload.get("email_verified", False):
            return Response(
                {"detail": "La cuenta de Google no tiene el correo verificado."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        usuario = services.usuario_de_google(
            email=payload["email"], nombre=payload.get("name")
        )
        return Response(_tokens_para(usuario), status=status.HTTP_200_OK)

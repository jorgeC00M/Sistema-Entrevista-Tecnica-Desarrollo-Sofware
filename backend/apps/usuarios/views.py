"""Vistas de autenticación.

El login con email/contraseña usa `TokenObtainPairView` de simplejwt sin
modificar (respeta `USERNAME_FIELD = "email"` del modelo automáticamente).
El login con Google emite exactamente el mismo par de tokens JWT que el login
normal — el resto del sistema no distingue cómo se autenticó el usuario.
"""

from __future__ import annotations

import logging

from django.conf import settings
from google.auth import exceptions as google_exceptions
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario
from .serializers import GoogleLoginSerializer, PerfilSerializer, RegistroSerializer

logger = logging.getLogger(__name__)


def _tokens_para(usuario: Usuario) -> dict[str, str]:
    refresh = RefreshToken.for_user(usuario)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class RegistroView(generics.CreateAPIView):
    serializer_class = RegistroSerializer
    permission_classes = [AllowAny]

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


class GoogleLoginView(APIView):
    """Inicio de sesión con una cuenta de Google.

    Recibe el ID token que el frontend obtiene de Google Identity Services,
    lo verifica contra las claves públicas de Google (nunca se confía en el
    email que el cliente diga tener) y busca o crea el usuario por email.
    Las cuentas creadas así quedan con contraseña inutilizable: no pueden
    autenticarse por email/contraseña salvo que el usuario establezca una.
    """

    permission_classes = [AllowAny]

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

        email = payload["email"]
        nombre = payload.get("name") or email.split("@")[0]

        usuario, creado = Usuario.objects.get_or_create(
            email=email, defaults={"nombre_completo": nombre}
        )
        if creado:
            usuario.set_unusable_password()
            usuario.save(update_fields=["password"])

        return Response(_tokens_para(usuario), status=status.HTTP_200_OK)

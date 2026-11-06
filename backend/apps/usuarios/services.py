"""Escrituras de dominio de usuarios.

La vista de Google solo verifica el token y traduce HTTP; el alta o
recuperación de la cuenta vive aquí, igual que el resto del sistema mantiene
las escrituras fuera de la capa de vistas.
"""

from __future__ import annotations

from django.db import transaction
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Usuario


def tokens_para(usuario: Usuario) -> dict[str, str]:
    """El par JWT que emiten los tres caminos (registro, contraseña, Google)."""
    refresh = RefreshToken.for_user(usuario)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def cambiar_contrasena(usuario: Usuario, nueva: str) -> dict[str, str]:
    """Cambia la contraseña, cierra las demás sesiones y devuelve un par nuevo.

    Todo refresh token emitido antes queda en la lista negra, así que ningún
    otro dispositivo puede renovar su acceso; este recibe un par nuevo y sigue
    conectado. Los access tokens ya emitidos valen hasta caducar (15 min): la
    lista negra solo alcanza a los refresh. Los refresh emitidos antes de
    activar `token_blacklist` no quedaron registrados y caducan solos.
    """
    # Atómico: una contraseña cambiada con las sesiones viejas aún vivas sería
    # justo lo que el cambio debía evitar.
    with transaction.atomic():
        usuario.set_password(nueva)
        usuario.save(update_fields=["password"])
        # Una sola inserción para todos; los que ya estaban en la lista negra
        # (un cambio anterior) se saltan en vez de fallar.
        BlacklistedToken.objects.bulk_create(
            [BlacklistedToken(token=token) for token in OutstandingToken.objects.filter(user=usuario)],
            ignore_conflicts=True,
        )
    return tokens_para(usuario)


def usuario_de_google(email: str, nombre: str | None = None) -> Usuario:
    """Devuelve el usuario asociado a una cuenta de Google, creándolo si hace
    falta.

    El correo se normaliza igual que en el registro por contraseña
    (`UsuarioManager.create_user`). Sin esto, `Jorge@gmail.com` por Google y
    `jorge@gmail.com` por registro creaban dos cuentas distintas para la misma
    persona.

    Las cuentas creadas por esta vía quedan con contraseña inutilizable: no
    pueden autenticarse por email/contraseña salvo que el usuario establezca
    una.
    """
    email = Usuario.objects.normalize_email(email)
    nombre_completo = nombre or email.split("@")[0]

    usuario, creado = Usuario.objects.get_or_create(
        email=email, defaults={"nombre_completo": nombre_completo}
    )
    if creado:
        usuario.set_unusable_password()
        usuario.save(update_fields=["password"])

    return usuario

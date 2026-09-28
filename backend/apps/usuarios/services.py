"""Escrituras de dominio de usuarios.

La vista de Google solo verifica el token y traduce HTTP; el alta o
recuperación de la cuenta vive aquí, igual que el resto del sistema mantiene
las escrituras fuera de la capa de vistas.
"""

from __future__ import annotations

from .models import Usuario


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

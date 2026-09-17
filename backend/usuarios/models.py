"""Modelo de usuario del sistema (sección 3.4.1 del perfil de grado: "Estructura
del Usuario / Perfil del Egresado").

`fecha_registro` y `ultimo_acceso` del documento no se declaran como campos
propios: Django ya los da a través de `date_joined` y `last_login` de
`AbstractUser`, así que se reutilizan en vez de duplicarlos con otro nombre.
"""

from __future__ import annotations

from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _crear_usuario(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError("El usuario debe tener un correo electrónico")
        email = self.normalize_email(email)
        usuario = self.model(email=email, **extra_fields)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._crear_usuario(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True")
        return self._crear_usuario(email, password, **extra_fields)


class Usuario(AbstractUser):
    # Se elimina el username heredado: el login es por email. first_name y
    # last_name también se eliminan para no duplicar nombre_completo.
    username = None
    first_name = None
    last_name = None

    email = models.EmailField("correo electrónico", unique=True)
    nombre_completo = models.CharField("nombre completo", max_length=100)
    carnet = models.CharField("carnet de identidad", max_length=15, blank=True, default="")

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre_completo"]

    objects = UsuarioManager()

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"

    def __str__(self) -> str:
        return self.email

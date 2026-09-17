"""Permisos compartidos.

Ojo: el sistema prefiere filtrar por `usuario=request.user` en la propia
consulta (`get_object_or_404`) antes que comprobar la pertenencia después de
haber leído el objeto. La diferencia es observable: filtrar devuelve 404 y no
revela que el recurso existe, mientras que un permiso a posteriori devuelve
403 y confirma su existencia. `EsPropietario` queda para vistas genéricas
donde ese filtrado no sea posible.
"""

from __future__ import annotations

from rest_framework.permissions import BasePermission


class EsPropietario(BasePermission):
    mensaje = "No tienes acceso a este recurso."

    def has_object_permission(self, request, view, obj) -> bool:
        usuario = getattr(obj, "usuario", None)
        return usuario is not None and usuario == request.user

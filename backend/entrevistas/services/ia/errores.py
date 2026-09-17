"""Jerarquía de errores del dominio de IA.

Se usa para decidir, en cualquier capa del sistema, si un fallo vale la pena
reintentarlo o no — sin que esa capa necesite conocer el proveedor concreto ni
su SDK.
"""

from __future__ import annotations


class ErrorProveedorIA(Exception):
    """Base de todos los errores relacionados con un proveedor de IA."""


class ErrorTransitorio(ErrorProveedorIA):
    """Error recuperable: red, límite de tasa, servicio caído, timeout.

    Vale la pena reintentar con retroceso exponencial.
    """


class ErrorPermanente(ErrorProveedorIA):
    """Error que no se arregla reintentando: credenciales inválidas, petición
    mal formada, saldo agotado.
    """


class RespuestaIAInvalida(ErrorProveedorIA):
    """El proveedor respondió, pero el contenido no cumple el contrato esperado."""

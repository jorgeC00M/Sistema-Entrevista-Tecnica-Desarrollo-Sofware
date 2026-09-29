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


class ProveedorNoConfigurado(ErrorProveedorIA):
    """El proveedor no se puede construir: falta su credencial, su SDK, o el
    nombre configurado no existe.

    No es transitorio —reintentar no lo arregla— pero desde fuera se comunica
    igual que una caída: el servicio no está disponible. La distinción importa
    para el registro en el log, no para el cliente. Hereda de la taxonomía en
    vez de ser un `RuntimeError` para que no se salte el manejador central y
    acabe como un 500 con traza.
    """

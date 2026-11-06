"""Las excepciones de dominio de la entrevista, en un solo lugar.

Todas son conflictos con el estado actual (`ConflictoDeDominio`), así que el
manejador central las responde con 409 y su mensaje. `services` las reexporta:
las vistas y los tests las nombran como `services.X`.
"""

from __future__ import annotations

from apps.common.exceptions import ConflictoDeDominio


class HayEntrevistaEnCurso(ConflictoDeDominio):
    """Se pidió iniciar una entrevista con otra en curso.

    Lleva esa entrevista: la vista la devuelve con el 409 para que la interfaz
    ofrezca continuarla o abandonarla con datos del servidor. Puede ser `None`
    solo si la que causó el choque terminó justo después. Por ese dato extra,
    su vista sí la captura en lugar de dejarla al manejador central.
    """

    def __init__(self, entrevista):
        super().__init__("Ya tienes una entrevista en curso.")
        self.entrevista = entrevista


class TiempoAgotado(ConflictoDeDominio):
    """Llegó una respuesta nueva después del límite: no se guarda y la
    entrevista ya quedó cerrada."""


class SinIntercambioPendiente(ConflictoDeDominio):
    """Se pidió responder una entrevista que no tiene pregunta pendiente.

    Es un tipo propio, y no un `ValueError` a secas, para que solo este caso sea
    un 409: el `ValueError` que lanzan las propiedades `*_enum` cuando una fila
    del catálogo no tiene miembro en el enum es un problema de integridad de
    datos y debe subir como 500, no disfrazarse de conflicto.
    """


class EntrevistaNoFinalizada(ConflictoDeDominio):
    """Se pidió el veredicto de una entrevista que no está finalizada."""


class EntrevistaNoEnCurso(ConflictoDeDominio):
    """Se pidió abandonar una entrevista que ya terminó (finalizada o abandonada)."""

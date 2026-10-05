"""Errores al leer un currículum.

Son pocos a propósito. Casi todo lo que puede estar "mal" en un CV **no es un
error**: es el hallazgo que el módulo existe para reportar. Un PDF escaneado sin
capa de texto es justamente el caso más valioso —el que deja al candidato
invisible sin que se entere— así que se devuelve dentro del análisis, no como una
excepción que aborta la petición.

Aquí solo quedan los casos en los que no hay nada que analizar.
"""

from __future__ import annotations


class ErrorDeDocumento(Exception):
    """Base de los errores al leer un documento."""


class FormatoNoSoportado(ErrorDeDocumento):
    """La extensión o el contenido no es PDF ni DOCX.

    Incluye las imágenes (.jpg, .png): para un ATS son un fallo garantizado, y
    decirlo de inmediato es más útil que fingir un análisis.
    """


class DocumentoCorrupto(ErrorDeDocumento):
    """El archivo dice ser PDF o DOCX pero no se puede abrir.

    Distinto de un PDF escaneado: ese se abre perfectamente y lo que ocurre es
    que no tiene texto, que es un resultado del análisis y no un error.
    """


class DocumentoDemasiadoGrande(ErrorDeDocumento):
    """Tiene más páginas de las que tiene sentido analizar.

    No es un juicio sobre el CV —que sea largo se avisa como hallazgo, no como
    error— sino una defensa del servidor: extraer palabra por palabra un PDF de
    quinientas páginas bloquearía el worker. Se comprueba al abrir el archivo,
    antes de recorrerlo.
    """

"""Configuración de desarrollo.

Es el módulo por defecto de `manage.py`, así que trabajar en local no exige
definir DJANGO_SETTINGS_MODULE. Los valores por defecto de aquí son inseguros
a propósito y nunca se usan en producción.
"""

import os

from .base import *  # noqa: F403
from .base import lista_de_entorno

DEBUG = os.environ.get("DEBUG", "True") == "True"

SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "clave-de-desarrollo-insegura-no-usar-en-produccion",
)

ALLOWED_HOSTS = lista_de_entorno("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver")

# En desarrollo interesa ver la consulta SQL y el traceback completo del
# proveedor de IA; en producción esto sería ruido y fuga de información.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {"format": "{levelname} {name}: {message}", "style": "{"},
    },
    "handlers": {
        "consola": {"class": "logging.StreamHandler", "formatter": "simple"},
    },
    "root": {"handlers": ["consola"], "level": "INFO"},
    "loggers": {
        "apps": {"handlers": ["consola"], "level": "DEBUG", "propagate": False},
        "integrations": {"handlers": ["consola"], "level": "DEBUG", "propagate": False},
    },
}

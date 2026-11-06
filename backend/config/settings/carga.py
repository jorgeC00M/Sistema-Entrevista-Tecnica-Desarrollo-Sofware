"""Configuración solo para la prueba de carga (`tests/carga/`).

Hereda de `local` y sube los límites de peticiones: los usuarios simulados
salen todos de una IP (el registro es 5 por hora por IP) y superan a propósito
los límites por hora. Nunca se usa en producción: solo se carga con
`DJANGO_SETTINGS_MODULE=config.settings.carga` explícito.
"""

from .local import *  # noqa: F403
from .local import REST_FRAMEWORK

REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_RATES": {
        alcance: "1000000/hour" for alcance in REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]
    },
}

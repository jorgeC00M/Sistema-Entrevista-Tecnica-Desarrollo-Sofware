"""Configuración de producción (Render).

A diferencia de `local.py`, aquí nada tiene valor por defecto: si falta una
variable el proceso no arranca. Es deliberado — un despliegue que falla al
levantar es preferible a uno que levanta con DEBUG activado o con la clave de
desarrollo.
"""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F403
from .base import lista_de_entorno, variable_obligatoria

DEBUG = False

SECRET_KEY = variable_obligatoria("SECRET_KEY")

ALLOWED_HOSTS = lista_de_entorno("ALLOWED_HOSTS")
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "ALLOWED_HOSTS no puede quedar vacío en producción. "
        "Definilo con el dominio de Render, por ejemplo 'mi-app.onrender.com'."
    )

CORS_ALLOWED_ORIGINS = lista_de_entorno("CORS_ALLOWED_ORIGINS")
if not CORS_ALLOWED_ORIGINS:
    raise ImproperlyConfigured(
        "CORS_ALLOWED_ORIGINS no puede quedar vacío en producción. "
        "Definilo con el dominio de Vercel del frontend."
    )

# Neon exige TLS; sin DATABASE_URL, base.py caería a SQLite, que en Render
# vive en un disco efímero y se perdería en cada despliegue.
variable_obligatoria("DATABASE_URL")

# --- Estáticos ----------------------------------------------------------
# Render no sirve archivos estáticos por sí solo. Whitenoise los entrega
# comprimidos y con hash desde el propio proceso de Gunicorn; solo hacen
# falta para el admin de Django, porque el frontend vive en Vercel.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

MIDDLEWARE.insert(  # noqa: F405
    MIDDLEWARE.index("django.middleware.security.SecurityMiddleware") + 1,  # noqa: F405
    "whitenoise.middleware.WhiteNoiseMiddleware",
)

# --- Seguridad de transporte --------------------------------------------
# Render termina TLS en su proxy y reenvía el esquema en esta cabecera; sin
# esto Django creería que la petición es HTTP y entraría en bucle de redirección.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "detallado": {
            "format": "{asctime} {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "consola": {"class": "logging.StreamHandler", "formatter": "detallado"},
    },
    "root": {"handlers": ["consola"], "level": "INFO"},
    "loggers": {
        "django.request": {"handlers": ["consola"], "level": "ERROR", "propagate": False},
        "apps": {"handlers": ["consola"], "level": "INFO", "propagate": False},
        "integrations": {"handlers": ["consola"], "level": "INFO", "propagate": False},
    },
}

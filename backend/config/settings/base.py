"""Configuración común a todos los entornos.

Nunca se importa directamente: `local.py` y `production.py` hacen
`from .base import *` y sobreescriben lo que cambia entre entornos. El módulo
activo se elige con DJANGO_SETTINGS_MODULE.

Todo lo sensible se lee de variables de entorno: `.env` en desarrollo
(cargado aquí con python-dotenv), variables reales del panel de Render en
producción. Nunca se hardcodean credenciales.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

load_dotenv(BASE_DIR / ".env")


def variable_obligatoria(nombre: str) -> str:
    """Lee una variable de entorno o aborta el arranque.

    Se usa solo en producción: es preferible que el proceso no levante a que
    levante con un valor por defecto inseguro.
    """
    valor = os.environ.get(nombre, "").strip()
    if not valor:
        raise ImproperlyConfigured(
            f"Falta la variable de entorno obligatoria '{nombre}'. "
            "Definila en el panel de Render antes de desplegar."
        )
    return valor


def lista_de_entorno(nombre: str, por_defecto: str = "") -> list[str]:
    return [v.strip() for v in os.environ.get(nombre, por_defecto).split(",") if v.strip()]


# --- Aplicaciones -------------------------------------------------------
APPS_DJANGO = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

APPS_TERCEROS = [
    "corsheaders",
    "rest_framework",
    # Registra cada refresh token emitido y permite invalidarlos: es lo que
    # cierra las demás sesiones al cambiar la contraseña. Viene con
    # djangorestframework-simplejwt, sin dependencia nueva.
    "rest_framework_simplejwt.token_blacklist",
]

APPS_PROPIAS = [
    "apps.common",
    "apps.usuarios",
    "apps.catalogos",
    "apps.entrevistas",
    "apps.evaluaciones",
    "apps.curriculums",
]

INSTALLED_APPS = APPS_DJANGO + APPS_TERCEROS + APPS_PROPIAS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Debe ir lo más arriba posible, antes de cualquier middleware que pueda
    # generar una respuesta (CommonMiddleware incluido).
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# --- Base de datos ------------------------------------------------------
# PostgreSQL si DATABASE_URL está definido (Postgres local o Neon); SQLite si
# está vacío, para poder desarrollar sin instalarlo. `evaluacion_json` solo se
# comporta como jsonb nativo en Postgres, así que no hay que dar por cerrado
# nada que toque ese campo probándolo únicamente en SQLite.
_database_url = os.environ.get("DATABASE_URL", "").strip()
if _database_url:
    DATABASES = {"default": dj_database_url.parse(_database_url, conn_max_age=600)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_USER_MODEL = "usuarios.Usuario"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "es"
TIME_ZONE = "America/La_Paz"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- API (Django REST Framework + JWT) ----------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "EXCEPTION_HANDLER": "apps.common.exceptions.manejador_de_excepciones",
    # Un decimal se emite como número, no como cadena. Sin esto,
    # `puntuacion_promedio` sale como "75.00" desde el serializer de entrevista
    # y como 75.0 desde las estadísticas (que no pasa por serializer): el mismo
    # concepto con dos tipos según el endpoint.
    "COERCE_DECIMAL_TO_STRING": False,
    # Los límites se declaran por ámbito y no de forma global porque el coste
    # real de cada endpoint es distinto: evaluar una respuesta gasta una
    # llamada de pago al proveedor de IA, autenticarse gasta un hash, y el
    # resto apenas cuesta. Un único límite global obligaría a elegir el mínimo
    # común y no protegería lo que hay que proteger.
    "DEFAULT_THROTTLE_CLASSES": ("rest_framework.throttling.ScopedRateThrottle",),
    "DEFAULT_THROTTLE_RATES": {
        # Holgado para una entrevista completa seguida (5 respuestas), estrecho
        # frente a un bucle automatizado.
        "evaluar": "30/hour",
        "iniciar-entrevista": "20/hour",
        # Abrir un PDF y recorrerlo palabra por palabra es el trabajo más
        # costoso del sistema sin llamar a la IA. Holgado para corregir el CV
        # y reanalizarlo varias veces, estrecho frente a un bucle.
        "analizar-cv": "20/hour",
        # Las sugerencias de IA de un CV ya analizado: la primera vez llama al
        # proveedor, las siguientes salen de lo guardado. Holgado para reintentar
        # tras un fallo, estrecho frente a un bucle.
        "revisar-cv": "30/hour",
        # Una llamada a la IA por aviso nuevo; el mismo aviso sale de la caché.
        "analizar-convocatoria": "20/hour",
        "login": "10/min",
        "registro": "5/hour",
        # Compara la contraseña actual: sin límite, una sesión robada serviría
        # para adivinarla a fuerza bruta.
        "contrasena": "5/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# El frontend (Vite) corre en estos puertos por defecto en desarrollo. En
# producción se sobreescribe con el dominio real de Vercel vía variable de
# entorno — nunca CORS_ALLOW_ALL_ORIGINS=True.
CORS_ALLOWED_ORIGINS = lista_de_entorno(
    "CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)

# --- Proveedor de IA ----------------------------------------------------
# `fake` por defecto: determinista y sin red, para que ninguna ejecución
# accidental queme cuota de API.
IA_PROVEEDOR = os.environ.get("IA_PROVEEDOR", "fake").strip() or "fake"

# Ese "por defecto" solo protege cuando la variable no está puesta. En cuanto
# alguien configura un proveedor real en su .env para probar la aplicación, la
# suite pasaría a llamar a la API de verdad: cuota gastada en cada corrida y
# tests que fallan según lo rápido que responda el proveedor. El runner fija
# `fake` para las pruebas, pase lo que pase en el entorno.
TEST_RUNNER = "tests.runner.RunnerAislado"
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "").strip()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

# --- Inicio de sesión con Google ----------------------------------------
# El frontend obtiene un ID token con Google Identity Services y lo envía a
# /api/auth/google; el backend lo verifica contra las claves públicas de
# Google usando este Client ID como audiencia esperada. Se crea en Google
# Cloud Console → APIs y servicios → Credenciales → ID de cliente de OAuth
# (tipo "Aplicación web"). Sin esto configurado, el endpoint responde 503.
GOOGLE_OAUTH_CLIENT_ID = os.environ.get("GOOGLE_OAUTH_CLIENT_ID", "").strip()

"""Ayudas compartidas por la suite.

Las áreas y niveles los siembra la migración `catalogos.0002_datos_iniciales`,
que el runner aplica al crear la base de pruebas. Los tests los buscan por
código en lugar de crearlos, para que ejercitar el catálogo real sea el camino
fácil y una fila que falte se note aquí y no en producción.
"""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalogos.models import Area, Nivel

Usuario = get_user_model()


def area_de(codigo) -> Area:
    """Acepta el enum `AreaTecnica` o el código en texto: el enum hereda de str."""
    return Area.objects.get(codigo=codigo)


def nivel_de(codigo) -> Nivel:
    return Nivel.objects.get(codigo=codigo)


def crear_usuario(email: str = "egresado@example.com", **extra) -> Usuario:
    """Usuario de pruebas con valores por defecto razonables."""
    extra.setdefault("password", "clave-segura-123")
    extra.setdefault("nombre_completo", "Egresado de Prueba")
    return Usuario.objects.create_user(email=email, **extra)


class TestDeAPI(TestCase):
    """Base para los tests que llaman a la API autenticados.

    Reúne lo que ocho archivos repetían casi igual (crear usuario y
    autenticar un cliente) y, sobre todo, limpia el caché entre tests: los
    límites de peticiones se contabilizan ahí y el contador es por IP para los
    endpoints anónimos, así que sin esta limpieza los tests se contaminarían
    entre sí y el resultado dependería del orden de ejecución.
    """

    email = "egresado@example.com"

    def setUp(self):
        super().setUp()
        cache.clear()
        self.usuario = crear_usuario(self.email)
        self.client = APIClient()
        self.client.force_authenticate(user=self.usuario)

    def tearDown(self):
        cache.clear()
        super().tearDown()

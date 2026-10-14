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

from apps.catalogos.models import Area, Nivel, Puesto, Tecnologia

Usuario = get_user_model()


def area_de(codigo) -> Area:
    """Acepta el enum `AreaTecnica` o el código en texto: el enum hereda de str."""
    return Area.objects.get(codigo=codigo)


def nivel_de(codigo) -> Nivel:
    return Nivel.objects.get(codigo=codigo)


def puesto_de(codigo) -> Puesto:
    return Puesto.objects.get(codigo=codigo)


def tecnologia_de(codigo) -> Tecnologia:
    return Tecnologia.objects.get(codigo=codigo)


def crear_usuario(email: str = "egresado@example.com", **extra) -> Usuario:
    """Usuario de pruebas con valores por defecto razonables."""
    extra.setdefault("password", "clave-segura-123")
    extra.setdefault("nombre_completo", "Egresado de Prueba")
    return Usuario.objects.create_user(email=email, **extra)


def crear_entrevista(usuario, puesto="full_stack", nivel="basico", tecnologia=None, **extra):
    """Entrevista con el catálogo ya resuelto desde sus códigos.

    Centraliza la forma del modelo: cuando la cabecera cambia —como al pasar de
    área única a puesto— se actualiza aquí y no en los ocho archivos que crean
    entrevistas a mano.
    """
    from apps.entrevistas.models import Entrevista

    return Entrevista.objects.create(
        usuario=usuario,
        puesto=puesto_de(puesto),
        nivel=nivel_de(nivel),
        tecnologia=tecnologia_de(tecnologia) if tecnologia else None,
        **extra,
    )


def crear_intercambio(entrevista, numero=1, area="programacion", **extra):
    """Intercambio con su área resuelta. `area` es obligatoria en el modelo:
    cada pregunta declara de qué tema es."""
    from apps.entrevistas.models import Intercambio

    extra.setdefault("pregunta", f"Pregunta {numero}")
    return Intercambio.objects.create(
        entrevista=entrevista, numero=numero, area=area_de(area), **extra
    )


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


def niveles_para(nota: int) -> dict[str, int]:
    """Los niveles por criterio que producen exactamente `nota` con la fórmula.

    Con niveles 0-4 solo existen 13 notas por respuesta (0, 8, 17, 25, 33, 42,
    50, 58, 67, 75, 83, 92, 100). Pedir otra es un error del test, no algo que
    redondear en silencio: así un escenario no promete una nota imposible.
    """
    from apps.evaluaciones.rubricas import NIVEL_MAXIMO, puntuacion_de

    for suma in range(3 * NIVEL_MAXIMO + 1):
        correccion = min(NIVEL_MAXIMO, suma)
        completitud = min(NIVEL_MAXIMO, suma - correccion)
        niveles = {"correccion": correccion, "completitud": completitud, "claridad": suma - correccion - completitud}
        if puntuacion_de(niveles) == nota:
            return niveles
    raise ValueError(f"La nota {nota} no se puede obtener con la fórmula de niveles 0-{NIVEL_MAXIMO}")

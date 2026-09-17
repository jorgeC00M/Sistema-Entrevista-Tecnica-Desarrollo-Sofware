from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase

from entrevistas.models import Entrevista, Evaluacion, Intercambio
from entrevistas.services.ia.schemas import AreaTecnica, Nivel

Usuario = get_user_model()


class RestriccionesDeIntegridadTest(TestCase):
    """Las restricciones que impiden que un reintento del cliente duplique
    trabajo viven en la base de datos, no en la confianza en el código.
    """

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            email="egresado@example.com",
            password="clave-segura-123",
            nombre_completo="Egresado de Prueba",
        )
        self.entrevista = Entrevista.objects.create(
            usuario=self.usuario, area=AreaTecnica.PROGRAMACION.value, nivel=Nivel.BASICO.value
        )

    def test_no_permite_dos_intercambios_con_el_mismo_numero(self):
        Intercambio.objects.create(entrevista=self.entrevista, numero=1, pregunta="¿Qué es una variable?")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Intercambio.objects.create(entrevista=self.entrevista, numero=1, pregunta="Otra pregunta")

    def test_permite_el_mismo_numero_en_entrevistas_distintas(self):
        otra_entrevista = Entrevista.objects.create(
            usuario=self.usuario, area=AreaTecnica.BASES_DE_DATOS.value, nivel=Nivel.BASICO.value
        )
        Intercambio.objects.create(entrevista=self.entrevista, numero=1, pregunta="Pregunta A")
        # No debe lanzar: el número 1 es único por entrevista, no globalmente.
        Intercambio.objects.create(entrevista=otra_entrevista, numero=1, pregunta="Pregunta B")

    def test_no_permite_dos_evaluaciones_del_mismo_intercambio(self):
        intercambio = Intercambio.objects.create(
            entrevista=self.entrevista, numero=1, pregunta="¿Qué es una variable?"
        )
        Evaluacion.objects.create(
            intercambio=intercambio,
            puntuacion=80,
            fortalezas="ok",
            debilidades="ok",
            sugerencias="ok",
            evaluacion_json={},
            proveedor_ia="fake",
            modelo_ia="fake-1",
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Evaluacion.objects.create(
                    intercambio=intercambio,
                    puntuacion=50,
                    fortalezas="x",
                    debilidades="x",
                    sugerencias="x",
                    evaluacion_json={},
                    proveedor_ia="fake",
                    modelo_ia="fake-1",
                )

    def test_evaluacion_json_se_persiste_como_objeto(self):
        intercambio = Intercambio.objects.create(entrevista=self.entrevista, numero=1, pregunta="p")
        evaluacion = Evaluacion.objects.create(
            intercambio=intercambio,
            puntuacion=80,
            fortalezas="ok",
            debilidades="ok",
            sugerencias="ok",
            evaluacion_json={"puntuacion": 80, "fortalezas": "ok"},
            proveedor_ia="fake",
            modelo_ia="fake-1",
        )
        evaluacion.refresh_from_db()
        self.assertEqual(evaluacion.evaluacion_json, {"puntuacion": 80, "fortalezas": "ok"})


class UsuarioTest(TestCase):
    def test_usuario_se_autentica_por_email(self):
        self.assertEqual(Usuario.USERNAME_FIELD, "email")

    def test_create_user_hashea_la_contrasena(self):
        usuario = Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Egresado de Prueba"
        )
        self.assertNotEqual(usuario.password, "clave-segura-123")
        self.assertTrue(usuario.check_password("clave-segura-123"))

    def test_email_duplicado_no_permitido(self):
        Usuario.objects.create_user(
            email="egresado@example.com", password="clave-segura-123", nombre_completo="Uno"
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Usuario.objects.create_user(
                    email="egresado@example.com", password="otra-clave-123", nombre_completo="Otro"
                )

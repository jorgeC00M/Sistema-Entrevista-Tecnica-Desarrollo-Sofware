from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase

from apps.entrevistas.models import Entrevista
from apps.evaluaciones.models import Evaluacion
from tests.conftest import crear_entrevista, crear_intercambio

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
        self.entrevista = crear_entrevista(self.usuario)

    def test_no_permite_dos_intercambios_con_el_mismo_numero(self):
        crear_intercambio(self.entrevista, pregunta="¿Qué es una variable?")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                crear_intercambio(self.entrevista, pregunta="Otra pregunta")

    def test_permite_el_mismo_numero_en_entrevistas_distintas(self):
        # Terminada: un usuario solo puede tener una en curso.
        otra_entrevista = crear_entrevista(self.usuario, puesto="frontend", estado=Entrevista.Estado.FINALIZADA)
        crear_intercambio(self.entrevista, pregunta="Pregunta A")
        # No debe lanzar: el número 1 es único por entrevista, no globalmente.
        crear_intercambio(otra_entrevista, pregunta="Pregunta B")

    def test_no_permite_dos_evaluaciones_del_mismo_intercambio(self):
        intercambio = crear_intercambio(self.entrevista, pregunta="¿Qué es una variable?")
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
        intercambio = crear_intercambio(self.entrevista)
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



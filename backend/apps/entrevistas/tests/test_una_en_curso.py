"""Una sola entrevista en curso por usuario.

Iniciar con otra en curso responde 409 sin crear nada ni llamar a la IA; con
`abandonar_en_curso` la anterior se abandona en la misma transacción que crea
la nueva. El índice parcial cubre la carrera entre dos pestañas.
"""

import importlib
from datetime import timedelta
from unittest import mock

from django.apps import apps as registro
from django.db import IntegrityError, connection, transaction
from django.test import TestCase
from django.utils import timezone
from rest_framework import status

from apps.entrevistas import services as servicio
from apps.entrevistas.models import MINUTOS_DE_ENTREVISTA, Entrevista
from integrations.ia.exceptions import ErrorTransitorio
from integrations.ia.fake import FakeProveedorIA
from tests.conftest import TestDeAPI, crear_entrevista, crear_usuario, nivel_de, puesto_de

URL = "/api/entrevistas/"
DATOS = {"puesto": "backend", "nivel": "junior", "tecnologia": "backend_django"}


class ProveedorQueFalla(FakeProveedorIA):
    def generar_preguntas_iniciales(self, contexto, areas):
        raise ErrorTransitorio("el proveedor no respondió")


class IniciarConOtraEnCursoTest(TestDeAPI):
    def setUp(self):
        super().setUp()
        self.anterior = servicio.iniciar(
            self.usuario, puesto_de("frontend"), nivel_de("junior"), proveedor=FakeProveedorIA()
        )

    def test_responde_409_con_la_entrevista_en_curso_y_sin_llamar_a_la_ia(self):
        prohibido = mock.Mock(side_effect=AssertionError("No debe llamar a la IA"))

        with mock.patch("apps.entrevistas.services.get_proveedor", prohibido):
            respuesta = self.client.post(URL, DATOS, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(respuesta.data["entrevista_en_curso"]["id"], self.anterior.pk)
        self.assertIn("fecha_limite", respuesta.data["entrevista_en_curso"])
        self.assertEqual(Entrevista.objects.filter(usuario=self.usuario).count(), 1)
        prohibido.assert_not_called()

    def test_una_vencida_no_bloquea(self):
        Entrevista.objects.filter(pk=self.anterior.pk).update(
            fecha_inicio=timezone.now() - timedelta(minutes=MINUTOS_DE_ENTREVISTA + 1)
        )

        respuesta = self.client.post(URL, DATOS, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.anterior.refresh_from_db()
        self.assertEqual(self.anterior.estado, Entrevista.Estado.ABANDONADA)

    def test_abandonar_en_curso_abandona_la_anterior_y_crea_la_nueva(self):
        respuesta = self.client.post(URL, {**DATOS, "abandonar_en_curso": True}, format="json")

        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.anterior.refresh_from_db()
        self.assertEqual(self.anterior.estado, Entrevista.Estado.ABANDONADA)
        self.assertIsNotNone(self.anterior.fecha_fin)
        nueva = Entrevista.objects.get(pk=respuesta.data["entrevista"]["id"])
        self.assertEqual(nueva.estado, Entrevista.Estado.EN_PROGRESO)

    def test_si_la_ia_falla_la_anterior_queda_intacta(self):
        with self.assertRaises(ErrorTransitorio):
            servicio.iniciar(
                self.usuario,
                puesto_de("backend"),
                nivel_de("junior"),
                proveedor=ProveedorQueFalla(),
                abandonar_en_curso=True,
            )

        self.anterior.refresh_from_db()
        self.assertEqual(self.anterior.estado, Entrevista.Estado.EN_PROGRESO)
        self.assertIsNone(self.anterior.fecha_fin)
        self.assertEqual(Entrevista.objects.filter(usuario=self.usuario).count(), 1)

    def test_otro_usuario_no_choca(self):
        otro = crear_usuario(email="otro@example.com")

        servicio.iniciar(otro, puesto_de("backend"), nivel_de("junior"), proveedor=FakeProveedorIA())

        self.anterior.refresh_from_db()
        self.assertEqual(self.anterior.estado, Entrevista.Estado.EN_PROGRESO)


class IndiceUnicoTest(TestCase):
    def test_la_base_impide_dos_en_curso_del_mismo_usuario(self):
        usuario = crear_usuario()
        crear_entrevista(usuario)

        with self.assertRaises(IntegrityError), transaction.atomic():
            crear_entrevista(usuario)

    def test_las_terminadas_no_cuentan(self):
        usuario = crear_usuario()
        crear_entrevista(usuario, estado=Entrevista.Estado.FINALIZADA)
        crear_entrevista(usuario, estado=Entrevista.Estado.ABANDONADA)
        crear_entrevista(usuario)  # no lanza


class MigracionDeLimpiezaTest(TestCase):
    """`0011` deja la más reciente de cada usuario y abandona las demás.

    Para armar el estado anterior al índice se lo quita durante el test: Postgres
    hace el DDL dentro de la transacción del test, y el rollback del final lo
    restaura. No se vuelve a crear aquí: con las filas recién insertadas hay
    eventos de trigger pendientes y el CREATE INDEX falla — el mismo motivo por
    el que la limpieza (0011) y el índice (0012) son migraciones separadas.
    """

    def test_conserva_la_mas_reciente_y_abandona_las_demas(self):
        migracion = importlib.import_module("apps.entrevistas.migrations.0011_cerrar_en_curso_sobrantes")
        indice = next(c for c in Entrevista._meta.constraints if c.name == "una_entrevista_en_curso_por_usuario")
        usuario = crear_usuario()
        otro = crear_usuario(email="otro@example.com")

        with connection.schema_editor() as editor:
            editor.remove_constraint(Entrevista, indice)
        viejas = [crear_entrevista(usuario) for _ in range(2)]
        for dias, entrevista in enumerate(viejas, start=1):
            Entrevista.objects.filter(pk=entrevista.pk).update(fecha_inicio=timezone.now() - timedelta(days=dias))
        reciente = crear_entrevista(usuario)
        sola = crear_entrevista(otro)

        migracion.cerrar_sobrantes(registro, None)

        estados = dict(Entrevista.objects.values_list("pk", "estado"))
        self.assertEqual(estados[reciente.pk], Entrevista.Estado.EN_PROGRESO)
        self.assertEqual(estados[sola.pk], Entrevista.Estado.EN_PROGRESO)
        for vieja in viejas:
            self.assertEqual(estados[vieja.pk], Entrevista.Estado.ABANDONADA)

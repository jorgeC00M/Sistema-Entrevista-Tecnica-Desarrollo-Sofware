"""El proveedor falso clasifica un aviso de videojuegos sin red, como lo haría la IA."""

import unittest

from integrations.ia.fake import FakeProveedorIA
from integrations.ia.prompts.analista_convocatoria import (
    EntradaDeConvocatoria,
    OpcionDeNivel,
    OpcionDePuesto,
    OpcionDeTecnologia,
)

PUESTOS = (
    OpcionDePuesto(
        "videojuegos",
        "Desarrollador de Videojuegos",
        (
            OpcionDeTecnologia("videojuegos_unity", "Unity (C#)"),
            OpcionDeTecnologia("videojuegos_godot", "Godot (GDScript)"),
        ),
    ),
    OpcionDePuesto("movil", "Desarrollador Móvil", (OpcionDeTecnologia("movil_flutter", "Flutter"),)),
)
NIVELES = (OpcionDeNivel("junior", "Junior", "Inicial"),)


def _entrada(texto: str) -> EntradaDeConvocatoria:
    return EntradaDeConvocatoria(
        texto=texto, terminos=(), anos_requeridos=None, cargo=None, puestos=PUESTOS, niveles=NIVELES
    )


class FakeVideojuegosTest(unittest.TestCase):
    def test_un_aviso_de_videojuegos_con_unity(self):
        perfil = FakeProveedorIA().analizar_convocatoria(_entrada("Buscamos Desarrollador de videojuegos con Unity y C#"))

        self.assertEqual((perfil.puesto, perfil.tecnologias), ("videojuegos", ("videojuegos_unity",)))

    def test_juegos_moviles_con_unity_son_de_videojuegos(self):
        perfil = FakeProveedorIA().analizar_convocatoria(_entrada("Game developer para juegos mobile con Unity"))

        self.assertEqual(perfil.puesto, "videojuegos")

    def test_un_aviso_movil_sigue_siendo_movil(self):
        perfil = FakeProveedorIA().analizar_convocatoria(_entrada("Desarrollador Flutter para apps mobile"))

        self.assertEqual(perfil.puesto, "movil")

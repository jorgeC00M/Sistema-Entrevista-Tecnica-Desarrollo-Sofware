"""Un CV o una convocatoria de videojuegos se lee con los mismos términos que el resto."""

import unittest

from integrations.documentos.brecha import DECLARADO, DEMOSTRADO, calcular
from integrations.documentos.extractor import DocumentoExtraido
from integrations.documentos.terminos import encontrar, primer_cargo


def _cv(texto: str) -> DocumentoExtraido:
    return DocumentoExtraido(texto=texto, formato="pdf", paginas=1)


class TerminosDeVideojuegosTest(unittest.TestCase):
    def test_reconoce_los_motores(self):
        self.assertEqual(encontrar("Experiencia con Godot y Unity"), {"Godot", "Unity"})
        self.assertEqual(encontrar("Proyecto en UE5 con Unreal Engine"), {"Unreal Engine"})

    def test_reconoce_frameworks_y_lenguajes_del_sector(self):
        self.assertEqual(
            encontrar("Juegos en C++ con SDL2, scripts en Lua y un prototipo en Bevy"),
            {"C++", "SDL", "Lua", "Bevy"},
        )
        self.assertEqual(encontrar("Roblox Studio con Luau"), {"Roblox", "Luau"})

    def test_love_solo_cuenta_como_framework_si_se_escribe_love2d(self):
        """Sin la diéresis, "love" encajaría en cualquier frase en inglés."""
        self.assertNotIn("LÖVE", encontrar("I love clean code"))
        self.assertIn("LÖVE", encontrar("Un plataformas hecho con LÖVE2D"))

    def test_el_cargo_en_ingles_es_el_mismo_que_en_espanol(self):
        self.assertEqual(primer_cargo("Game Developer en un estudio indie"), "Desarrollador de Videojuegos")
        self.assertEqual(primer_cargo("Buscamos programador de videojuegos"), "Desarrollador de Videojuegos")


class BrechaDeVideojuegosTest(unittest.TestCase):
    CONVOCATORIA = "Requisitos:\n- Godot\n- Unity\n"

    CV = """Ana Quispe
ana@example.com

Experiencia
Programadora en un estudio indie
- Publiqué un plataformas en Godot y reduje los tiempos de carga 30%

Habilidades
Godot, Unity
"""

    def test_un_motor_usado_en_la_experiencia_esta_demostrado(self):
        brecha = calcular(self.CONVOCATORIA, _cv(self.CV))

        estados = {r.termino: r.estado for r in brecha.obligatorios.requisitos}
        self.assertEqual(estados["Godot"], DEMOSTRADO)
        self.assertEqual(estados["Unity"], DECLARADO)

"""Límites de la rúbrica.

`banda_de` se ejecuta en cada evaluación serializada y en cada observación de
la retroalimentación acumulada, así que sus cortes son parte del contrato
visible: un cambio silencioso aquí recolorea el historial entero del usuario.
"""

from django.test import SimpleTestCase

from apps.evaluaciones.rubricas import BANDAS, banda_de


class BandaDeTest(SimpleTestCase):
    def test_limites_de_cada_banda(self):
        casos = [
            (0, "insuficiente"),
            (40, "insuficiente"),
            (41, "en_desarrollo"),
            (60, "en_desarrollo"),
            (61, "aceptable"),
            (80, "aceptable"),
            (81, "solido"),
            (100, "solido"),
        ]
        for puntuacion, codigo in casos:
            with self.subTest(puntuacion=puntuacion):
                self.assertEqual(banda_de(puntuacion).codigo, codigo)

    def test_fuera_de_rango_por_arriba(self):
        with self.assertRaises(ValueError):
            banda_de(101)

    def test_fuera_de_rango_por_abajo(self):
        with self.assertRaises(ValueError):
            banda_de(-1)

    def test_las_bandas_cubren_todo_el_rango_sin_solaparse(self):
        """Invariante estructural: si alguien añade o mueve una banda, los
        cortes siguen cubriendo 0-100 exactamente una vez."""
        for puntuacion in range(0, 101):
            coincidencias = [banda for banda in BANDAS if banda.contiene(puntuacion)]
            self.assertEqual(
                len(coincidencias), 1, f"La puntuación {puntuacion} cae en {len(coincidencias)} bandas"
            )

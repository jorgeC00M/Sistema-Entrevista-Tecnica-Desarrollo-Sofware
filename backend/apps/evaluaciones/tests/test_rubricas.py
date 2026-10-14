"""Límites de la rúbrica.

`banda_de` se ejecuta en cada evaluación serializada y en cada observación de
la retroalimentación acumulada, así que sus cortes son parte del contrato
visible: un cambio silencioso aquí recolorea el historial entero del usuario.
"""

from django.test import SimpleTestCase

from apps.evaluaciones.rubricas import BANDAS, CRITERIOS, NIVEL_MAXIMO, PESOS, banda_de, puntuacion_de
from integrations.ia.prompts.schemas import Niveles


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


class PuntuacionDeTest(SimpleTestCase):
    """La fórmula es lo que se defiende ante el tribunal: cada nota debe poder
    reconstruirse a mano desde los niveles, así que se fija entera."""

    # Suma de niveles S (0-12) -> nota esperada = round(100·S/12).
    TABLA = {0: 0, 1: 8, 2: 17, 3: 25, 4: 33, 5: 42, 6: 50, 7: 58, 8: 67, 9: 75, 10: 83, 11: 92, 12: 100}

    @staticmethod
    def _niveles_con_suma(suma):
        """Reparte una suma entre los tres criterios, cada uno en 0-4."""
        correccion = min(NIVEL_MAXIMO, suma)
        completitud = min(NIVEL_MAXIMO, suma - correccion)
        return Niveles(correccion=correccion, completitud=completitud, claridad=suma - correccion - completitud)

    def test_tabla_completa_de_las_trece_notas_posibles(self):
        for suma, esperada in self.TABLA.items():
            with self.subTest(suma=suma):
                self.assertEqual(puntuacion_de(self._niveles_con_suma(suma)), esperada)

    def test_con_pesos_iguales_solo_importa_la_suma(self):
        """3/2/3 y 2/3/3 son la misma nota: ningún criterio pesa más."""
        self.assertEqual(
            puntuacion_de(Niveles(correccion=3, completitud=2, claridad=3)),
            puntuacion_de(Niveles(correccion=2, completitud=3, claridad=3)),
        )
        self.assertEqual(puntuacion_de(Niveles(correccion=3, completitud=2, claridad=3)), 67)

    def test_extremos(self):
        self.assertEqual(puntuacion_de(Niveles(correccion=4, completitud=4, claridad=4)), 100)
        self.assertEqual(puntuacion_de(Niveles(correccion=0, completitud=0, claridad=0)), 0)

    def test_acepta_el_dict_guardado_en_evaluacion_json(self):
        self.assertEqual(puntuacion_de({"correccion": 3, "completitud": 3, "claridad": 3}), 75)

    def test_los_pesos_ponderan(self):
        """El mecanismo de pesos funciona aunque hoy sean iguales."""
        pesos = {"correccion": 2, "completitud": 1, "claridad": 1}
        niveles = Niveles(correccion=4, completitud=0, claridad=0)
        self.assertEqual(puntuacion_de(niveles, pesos), 50)

    def test_cada_nota_cae_en_la_banda_prevista(self):
        """Las bandas, leídas en niveles: Aceptable es un nivel medio de 2,67 a 3
        — "correcta pero incompleta o poco clara"."""
        previstas = {
            "insuficiente": range(0, 5),
            "en_desarrollo": range(5, 8),
            "aceptable": range(8, 10),
            "solido": range(10, 13),
        }
        for codigo, sumas in previstas.items():
            for suma in sumas:
                with self.subTest(suma=suma):
                    self.assertEqual(banda_de(self.TABLA[suma]).codigo, codigo)

    def test_los_pesos_vigentes_son_iguales(self):
        self.assertEqual(set(PESOS.values()), {1})
        self.assertEqual(set(PESOS), set(CRITERIOS))

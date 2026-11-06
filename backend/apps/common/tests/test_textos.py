"""La huella de texto no puede cambiar: las cachés de CV y convocatoria la guardan."""

import unittest

from apps.common.textos import hash_de_texto


class HuellaTest(unittest.TestCase):
    def test_valores_conocidos(self):
        self.assertEqual(
            hash_de_texto(""), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        )
        self.assertEqual(
            hash_de_texto("hola"), "b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79"
        )

    def test_ignora_los_espacios_de_los_extremos(self):
        self.assertEqual(hash_de_texto("  hola\n"), hash_de_texto("hola"))

    def test_coincide_con_el_relleno_de_la_migracion(self):
        """La `0004` de curriculums guardó el hash del vacío calculado a mano."""
        from importlib import import_module

        migracion = import_module("apps.curriculums.migrations.0004_rellenar_hash_de_convocatoria_vacia")
        self.assertEqual(hash_de_texto(""), migracion.HASH_DE_VACIO)

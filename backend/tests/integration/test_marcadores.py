"""Las marcas que reconocen los parsers de IA son las que escribe el enmascarado.

`integrations/ia/prompts/marcadores.py` no importa `anonimizar.py` (la capa de IA
no depende de otro módulo del proyecto), así que las dos listas se escriben por
separado. Si alguien añade o renombra una marca en un lado, un texto enmascarado
dejaría de reconocerse como tal y podría llegar al usuario como "[DNI]".
"""

import unittest

from integrations.documentos.anonimizar import (
    CORREO_MASCARA,
    ENLACE_MASCARA,
    NOMBRE_MASCARA,
    TELEFONO_MASCARA,
    enmascarar,
)
from integrations.ia.prompts.marcadores import MARCADOR


class MarcadoresTest(unittest.TestCase):
    def test_el_parser_reconoce_cada_marca_del_enmascarado(self):
        for marca in (CORREO_MASCARA, TELEFONO_MASCARA, ENLACE_MASCARA, NOMBRE_MASCARA):
            with self.subTest(marca=marca):
                self.assertRegex(marca, MARCADOR)

    def test_un_texto_enmascarado_queda_marcado(self):
        texto = enmascarar(
            "Jorge Condori, jorge@example.com, +591 71234567, https://github.com/jcondori",
            nombre="Jorge Condori",
        )

        self.assertEqual(
            sorted(MARCADOR.findall(texto)),
            sorted([NOMBRE_MASCARA, CORREO_MASCARA, TELEFONO_MASCARA, ENLACE_MASCARA]),
        )

    def test_un_texto_sin_marcas_no_se_confunde(self):
        self.assertIsNone(MARCADOR.search("Experiencia con [Django] y APIs REST"))

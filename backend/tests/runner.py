"""Runner de pruebas que aísla la suite del proveedor de IA configurado.

`factory.get_proveedor()` lee `IA_PROVEEDOR` de las variables de entorno en
cada llamada, y `.env` es lo que las puebla. Eso significa que, en cuanto
alguien pone `IA_PROVEEDOR=gemini` para probar la aplicación a mano, la suite
entera empieza a llamar a la API real: gasta cuota de pago en cada corrida,
tarda decenas de segundos por test y —lo peor— falla de forma intermitente
cuando el proveedor responde lento o devuelve un 503 de alta demanda, porque
un fallo a mitad de una entrevista deja el flujo en un estado que el test no
esperaba.

Las pruebas del flujo tienen que ser deterministas, así que aquí se fija el
proveedor falso para toda la suite. Los adaptadores reales no quedan sin
cubrir: `tests/integration/test_adaptadores_errores.py` los ejercita
sustituyendo el cliente del SDK, que es la forma de probarlos sin red.
"""

from __future__ import annotations

import os

from django.test.runner import DiscoverRunner

PROVEEDOR_EN_PRUEBAS = "fake"


class RunnerAislado(DiscoverRunner):
    def setup_test_environment(self, **kwargs):
        # Antes de que se importe o ejecute cualquier test: el valor del .env
        # no debe decidir contra qué habla la suite.
        os.environ["IA_PROVEEDOR"] = PROVEEDOR_EN_PRUEBAS
        super().setup_test_environment(**kwargs)

"""Valores que comparten los parsers que anclan la respuesta del modelo.

Viven aquí y no se importan de `integrations/documentos/anonimizar.py` a
propósito: la capa de IA no depende de ningún otro módulo del proyecto. Que las
marcas coincidan con las que escribe `anonimizar.enmascarar` lo fija
`tests/integration/test_marcadores.py`.
"""

from __future__ import annotations

import re

#: Lo que el modelo responde cuando ningún puesto del catálogo encaja. Es un
#: valor del enum y no `null` porque no todos los proveedores aceptan tipos
#: anulables en el esquema.
SIN_PUESTO = "ninguno"

#: Las marcas que deja `anonimizar.enmascarar`. Una sugerencia o un requisito que
#: las contenga le mostraría al usuario "[CORREO]" en lugar de su texto.
MARCADOR = re.compile(r"\[(?:CORREO|TELÉFONO|ENLACE|NOMBRE)\]")

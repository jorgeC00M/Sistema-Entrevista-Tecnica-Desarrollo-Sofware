"""Enmascarado de datos personales antes de enviar texto de un CV a la IA.

Es la **segunda** barrera, no la primera. La primera es la minimización: lo que
se envía son solo los bloques de las secciones reconocidas (`segmentar()`), que
por construcción dejan fuera el encabezado donde viven el nombre, el correo, el
teléfono y la dirección. Esto cubre lo que a veces se cuela dentro de una
sección —"contacto: juan@x.com" al final de la experiencia, un enlace al
portafolio—.

No se intenta enmascarar direcciones: no hay forma fiable de reconocer una sin un
modelo, y fingir que se hace sería peor. Lo que las protege es que viven en el
encabezado, que no se envía.

Los detectores son los mismos que usa `ats.py` (viven en `contacto.py`): si cada
módulo tuviera su propia idea de qué es un teléfono, el espejo podría reconocer
uno que el enmascarado deja pasar.
"""

from __future__ import annotations

import re

from integrations.documentos.contacto import CORREO, telefonos

CORREO_MASCARA = "[CORREO]"
TELEFONO_MASCARA = "[TELÉFONO]"
ENLACE_MASCARA = "[ENLACE]"
NOMBRE_MASCARA = "[NOMBRE]"

# El patrón de `contacto.URL` solo marca el comienzo de un enlace (para detectarlo);
# para taparlo hace falta la palabra entera.
_ENLACE = re.compile(r"\S*(?:https?://|www\.|linkedin\.com|github\.com)\S*", re.IGNORECASE)

#: Palabras del nombre más cortas que esto no se enmascaran por separado: "de",
#: "la" o "Li" aparecen en cualquier frase.
LARGO_MINIMO_DE_PALABRA_DEL_NOMBRE = 3


def enmascarar(texto: str, nombre: str = "") -> str:
    """Sustituye correos, enlaces, teléfonos y el nombre por marcadores.

    El orden importa: correos y enlaces primero, porque traen dígitos que el
    detector de teléfonos podría tomar por un número. El nombre se tapa entero y
    también palabra por palabra, porque "Condori" puede aparecer suelto ("el
    proyecto de Condori").
    """
    resultado = CORREO.sub(CORREO_MASCARA, texto)
    resultado = _ENLACE.sub(ENLACE_MASCARA, resultado)

    for telefono in telefonos(resultado):
        resultado = resultado.replace(telefono, TELEFONO_MASCARA)

    if nombre.strip():
        resultado = re.sub(re.escape(nombre.strip()), NOMBRE_MASCARA, resultado, flags=re.IGNORECASE)
        for palabra in nombre.split():
            if len(palabra) >= LARGO_MINIMO_DE_PALABRA_DEL_NOMBRE:
                resultado = re.sub(rf"\b{re.escape(palabra)}\b", NOMBRE_MASCARA, resultado, flags=re.IGNORECASE)

    return resultado

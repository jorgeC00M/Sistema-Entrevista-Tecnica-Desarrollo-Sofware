"""Detectores de los datos de contacto de un CV: correo, teléfono, enlaces y nombre.

Los usa `ats.py` para armar la ficha que vería el ATS, y `anonimizar.py` para
tapar esos mismos datos antes de que un texto llegue a la IA. Viven aparte del
reglamento para que enmascarar no tenga que cargar todas las reglas: lo que se
detecta y lo que se tapa siguen saliendo del mismo patrón.
"""

from __future__ import annotations

import re

from integrations.documentos import fechas

CORREO = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
# Tolerante a propósito: separadores variados y prefijo internacional opcional,
# porque un número boliviano se escribe de muchas formas (+591 7xx xx xxx,
# 7xxxxxxx, 7-xxx-xxxx).
# Los grupos admiten uno a cuatro dígitos, no dos a cuatro: con el mínimo en dos
# un número escrito «+591 7 123 4567» empezaba a encajar recién en «123 4567» y
# el espejo le mostraba al usuario su teléfono truncado. Lo que evita que el
# patrón se desborde no es su rigidez sino el mínimo de dígitos que exige
# `detectar_telefono`.
_TELEFONO = re.compile(r"(?:\+\s?\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?){2,5}\d{2,4}")
URL = re.compile(r"(?:https?://|www\.|linkedin\.com|github\.com)", re.IGNORECASE)


def telefonos(texto: str) -> list[str]:
    """Todos los teléfonos del texto, descartando antes lo que se les parece.

    Un rango de fechas como «2016-02 – 2021» encaja en cualquier patrón de
    teléfono razonablemente tolerante, y un correo o una URL también traen
    dígitos. Se eliminan primero, y al final se exige un mínimo de dígitos: en
    Bolivia un celular tiene ocho y una línea fija siete, así que menos de siete
    no es un teléfono.

    Devuelve todos y no solo el primero porque el enmascarado que precede a
    cualquier envío a la IA tiene que taparlos todos.
    """
    MINIMO_DE_DIGITOS = 7

    sin_ruido = URL.sub(" ", CORREO.sub(" ", texto))
    for patron in fechas.FORMATOS_DE_FECHA.values():
        sin_ruido = patron.sub(" ", sin_ruido)

    candidatos = (candidato.group(0).strip() for candidato in _TELEFONO.finditer(sin_ruido))
    return [
        candidato
        for candidato in candidatos
        if sum(1 for caracter in candidato if caracter.isdigit()) >= MINIMO_DE_DIGITOS
    ]


def detectar_telefono(texto: str) -> str:
    """El primer teléfono del texto, o cadena vacía: el que vería el ATS."""
    encontrados = telefonos(texto)
    return encontrados[0] if encontrados else ""


def detectar_nombre(texto: str) -> str:
    """Heurística: el nombre es de las primeras líneas con aspecto de nombre.

    Es una heurística declarada, no un reconocedor de entidades. Un ATS real usa
    modelos entrenados para esto; replicarlo queda fuera del alcance. Lo que sí
    reproduce es la condición que de verdad importa: que el nombre esté como
    texto corriente cerca del inicio. Si está dentro de una imagen o de un cuadro
    de texto, no aparece y eso es justo lo que hay que avisar.
    """
    for linea in texto.splitlines()[:8]:
        candidato = linea.strip()
        if not candidato or len(candidato) > 60:
            continue
        if CORREO.search(candidato) or URL.search(candidato) or any(c.isdigit() for c in candidato):
            continue
        palabras = candidato.split()
        if 2 <= len(palabras) <= 5 and all(palabra[:1].isupper() for palabra in palabras):
            return candidato
    return ""

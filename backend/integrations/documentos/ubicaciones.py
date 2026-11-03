"""Lugares que un ATS reconoce como ubicación del candidato.

Los reclutadores filtran por ubicación antes de leer nada —en Workday o en
LinkedIn Recruiter es un filtro más, junto al cargo—, así que un CV sin ciudad
queda fuera de esa búsqueda aunque todo lo demás encaje.

Es una lista curada, del mismo tipo que `terminos.py`: las ciudades y
departamentos de Bolivia, las capitales de la región a las que suele postular un
egresado y la modalidad remota. Solo se busca en el encabezado del CV; "Santa
Cruz" dentro de una experiencia puede ser el nombre de una empresa.

Su límite: una ciudad ausente de la lista no se reconoce. Ampliar la cobertura es
añadir una entrada; lo que nunca hace es afirmar una ubicación que el texto no
nombra.
"""

from __future__ import annotations

import re

from integrations.documentos.terminos import normalizar

#: Nombre a mostrar → variantes normalizadas (minúscula, sin acentos).
UBICACIONES: dict[str, tuple[str, ...]] = {
    # Bolivia: departamentos y ciudades principales.
    "La Paz": ("la paz",),
    "El Alto": ("el alto",),
    "Cochabamba": ("cochabamba", "cbba"),
    "Santa Cruz": ("santa cruz", "santa cruz de la sierra", "scz"),
    "Oruro": ("oruro",),
    "Potosí": ("potosi",),
    "Sucre": ("sucre",),
    "Chuquisaca": ("chuquisaca",),
    "Tarija": ("tarija",),
    "Beni": ("beni",),
    "Trinidad": ("trinidad",),
    "Pando": ("pando",),
    "Cobija": ("cobija",),
    "Quillacollo": ("quillacollo",),
    "Sacaba": ("sacaba",),
    "Montero": ("montero",),
    "Bolivia": ("bolivia",),
    # Región.
    "Lima": ("lima",),
    "Perú": ("peru",),
    "Santiago": ("santiago de chile",),
    "Chile": ("chile",),
    "Buenos Aires": ("buenos aires",),
    "Argentina": ("argentina",),
    "Bogotá": ("bogota",),
    "Colombia": ("colombia",),
    "Quito": ("quito",),
    "Ecuador": ("ecuador",),
    "Asunción": ("asuncion",),
    "Paraguay": ("paraguay",),
    "Montevideo": ("montevideo",),
    "Uruguay": ("uruguay",),
    "São Paulo": ("sao paulo",),
    "Brasil": ("brasil", "brazil"),
    "Ciudad de México": ("ciudad de mexico", "cdmx"),
    "México": ("mexico",),
    "España": ("espana", "spain"),
    # Modalidad: también es lo que filtra un reclutador de un puesto remoto.
    "Remoto": ("remoto", "remote", "teletrabajo"),
}

_PATRONES: dict[str, tuple[re.Pattern[str], ...]] = {
    nombre: tuple(re.compile(rf"\b{re.escape(variante)}\b") for variante in variantes)
    for nombre, variantes in UBICACIONES.items()
}


def del_encabezado(encabezado: str, nombre: str) -> list[str]:
    """La ubicación que el ATS lee del CV: los lugares del encabezado, sin la
    línea del nombre.

    Solo en el encabezado: "Santa Cruz" en una experiencia puede ser una empresa,
    y "Lima" o "Pando" son también apellidos. La usan el espejo y el filtro de
    ubicación de la convocatoria, para que nunca digan dos cosas distintas.
    """
    lineas = [linea for linea in encabezado.splitlines() if linea.strip() != nombre]
    return encontrar("\n".join(lineas))


def encontrar(texto: str) -> list[str]:
    """Los lugares que el texto nombra, en el orden en que aparecen.

    En orden de aparición y no alfabético: "Cochabamba, Bolivia" debe mostrarse
    así, no como "Bolivia, Cochabamba".
    """
    normalizado = normalizar(texto)
    posiciones: list[tuple[int, str]] = []
    for nombre, patrones in _PATRONES.items():
        inicios = [m.start() for patron in patrones if (m := patron.search(normalizado))]
        if inicios:
            posiciones.append((min(inicios), nombre))
    return [nombre for _, nombre in sorted(posiciones)]

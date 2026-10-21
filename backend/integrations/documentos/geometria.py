"""Lo que se mide con las coordenadas de las palabras de un PDF.

Separado de `ats.py` porque es el único cálculo del reglamento que trabaja sobre
posiciones y no sobre texto, y el que se prueba contra PDF reales
(`tests/fixtures/cv/`) en lugar de documentos construidos en código.
"""

from __future__ import annotations

from integrations.documentos.extractor import Palabra


def hay_dos_columnas(palabras: list[Palabra]) -> bool:
    """Busca un canal vertical sin texto que parta la página en dos.

    Un CV a dos columnas deja una franja vertical vacía entre ellas. Se mide el
    ancho real del contenido —no el de la página, que incluye márgenes— y se
    busca en su zona central una franja que ninguna palabra cruce, con suficiente
    texto a ambos lados para descartar que sea una tabulación suelta.
    """
    ANCHO_MINIMO_DEL_CANAL = 0.06  # 6% del ancho del contenido
    ZONA_CENTRAL = (0.25, 0.75)
    PROPORCION_MINIMA_POR_LADO = 0.2

    for pagina in {palabra.pagina for palabra in palabras}:
        de_la_pagina = [p for p in palabras if p.pagina == pagina]
        if len(de_la_pagina) < 40:
            continue

        izquierda = min(p.x0 for p in de_la_pagina)
        derecha = max(p.x1 for p in de_la_pagina)
        ancho = derecha - izquierda
        if ancho <= 0:
            continue

        inicio_zona = izquierda + ancho * ZONA_CENTRAL[0]
        fin_zona = izquierda + ancho * ZONA_CENTRAL[1]

        # Se recorre la zona central en pasos y se mide la franja contigua más
        # ancha que ninguna palabra atraviesa.
        PASOS = 60
        paso = (fin_zona - inicio_zona) / PASOS
        mejor_canal = 0.0
        canal_actual = 0.0
        centro_del_canal = 0.0

        for indice in range(PASOS):
            x = inicio_zona + paso * indice
            if any(p.x0 <= x <= p.x1 for p in de_la_pagina):
                canal_actual = 0.0
            else:
                canal_actual += paso
                if canal_actual > mejor_canal:
                    mejor_canal = canal_actual
                    centro_del_canal = x - canal_actual / 2

        if mejor_canal < ancho * ANCHO_MINIMO_DEL_CANAL:
            continue

        a_la_izquierda = sum(1 for p in de_la_pagina if p.x1 <= centro_del_canal)
        a_la_derecha = sum(1 for p in de_la_pagina if p.x0 >= centro_del_canal)
        minimo = len(de_la_pagina) * PROPORCION_MINIMA_POR_LADO
        if a_la_izquierda >= minimo and a_la_derecha >= minimo:
            return True

    return False

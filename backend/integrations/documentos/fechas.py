"""Fechas de un currículum: en qué formatos están y cuánta experiencia suman.

Vive aparte de `ats.py` porque ya no tiene un solo usuario. `ats.py` lo usa para
la ficha —la antigüedad y los formatos mezclados— y `brecha.py` para comparar la
experiencia calculada con los años que pide una convocatoria. Si cada uno leyera
las fechas a su manera, el espejo podría decir "2 años y 4 meses" y el mapa de
requisitos "1 año" sobre el mismo CV.

Lo que se calcula es lo que haría un ATS: sumar los periodos con inicio y fin de
la sección de experiencia. No se intenta adivinar lo que el texto no dice; un
periodo escrito solo con años se cuenta entero y el resultado se marca como
aproximado, en vez de presentarlo con una precisión que no tiene.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date

from integrations.documentos.secciones import segmentar

MESES = (
    "ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic"
    "|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre"
    "|jan|apr|aug|dec|january|february|march|april|june|july|august|september|october|november|december"
)

# Familias de formato de fecha. Mezclarlas es la causa más común de que un ATS
# no pueda calcular la antigüedad: el candidato con ocho años de experiencia
# aparece en la base con tres.
FORMATOS_DE_FECHA = {
    "mes_año": re.compile(rf"\b(?:{MESES})\.?\s+\d{{4}}\b", re.IGNORECASE),
    "mes_año_corto": re.compile(rf"\b(?:{MESES})\.?\s*['’]\d{{2}}\b", re.IGNORECASE),
    "numerico": re.compile(r"\b\d{1,2}[/-]\d{4}\b"),
    "iso": re.compile(r"\b\d{4}-\d{1,2}\b"),
    "solo_año": re.compile(r"(?<![\d/-])\b(?:19|20)\d{2}\b(?![\d/-])"),
}

SEPARADOR_DE_RANGO = r"(?:\s*(?:-|–|—|a|al|hasta|to)\s*)"
FIN_ABIERTO = r"(?:actualidad|presente|actual|hoy|present|current|now)"

_CUALQUIER_FECHA = "|".join(patron.pattern for patron in FORMATOS_DE_FECHA.values())

# Un único patrón que admite cualquiera de los formatos a cada lado del
# separador. Contar por formato y sumar contaba dos veces el mismo rango: "Ene
# 2020 – Mar 2023" encaja en `mes_año` y sus años sueltos además en `solo_año`.
_RANGO = re.compile(
    rf"(?P<inicio>{_CUALQUIER_FECHA}){SEPARADOR_DE_RANGO}(?P<fin>{_CUALQUIER_FECHA}|{FIN_ABIERTO})",
    re.IGNORECASE,
)

_FIN_ABIERTO_EXACTO = re.compile(rf"^{FIN_ABIERTO}$", re.IGNORECASE)

#: Prefijo de tres letras → número de mes. "set" es "setiembre", la grafía que
#: también se usa en Bolivia.
_NUMERO_DE_MES = {
    "ene": 1, "jan": 1, "feb": 2, "mar": 3, "abr": 4, "apr": 4, "may": 5,
    "jun": 6, "jul": 7, "ago": 8, "aug": 8, "sep": 9, "set": 9, "oct": 10,
    "nov": 11, "dic": 12, "dec": 12,
}


@dataclass(frozen=True)
class Periodo:
    """Un periodo con inicio y fin, en meses absolutos (año × 12 + mes − 1).

    Los dos extremos son inclusivos: "Ene 2020 – Dic 2020" son doce meses.
    """

    inicio: int
    fin: int
    #: Algún extremo se escribió solo con el año y se completó con enero o diciembre.
    solo_año: bool = False

    @property
    def meses(self) -> int:
        return self.fin - self.inicio + 1


@dataclass(frozen=True)
class Experiencia:
    """La experiencia que un ATS calcularía para este CV.

    `meses` es `None` cuando no hay ningún periodo legible, que no es lo mismo que
    cero: el candidato puede tener años de experiencia escritos de forma que nadie
    puede sumar.
    """

    meses: int | None
    aproximado: bool
    #: Si se calculó sobre la sección de experiencia o, por no reconocerla, sobre
    #: el CV completo (que puede incluir la carrera).
    desde_la_seccion: bool

    @property
    def descripcion(self) -> str:
        if self.meses is None:
            return ""
        texto = describir(self.meses)
        return f"{texto} (aprox.)" if self.aproximado else texto


def _absoluto(año: int, mes: int) -> int:
    return año * 12 + mes - 1


def _año_de_dos_cifras(cifras: int, hoy: date) -> int:
    """'21 es 2021, pero '98 es 1998: un año de dos cifras posterior al actual
    no puede ser una fecha de trabajo pasada."""
    return 2000 + cifras if cifras <= hoy.year % 100 else 1900 + cifras


def _leer_fecha(texto: str, hoy: date, es_fin: bool) -> tuple[int, bool] | None:
    """Convierte un extremo del rango en (mes absoluto, solo_año).

    Un año suelto cuenta desde enero si es el inicio y hasta diciembre si es el
    fin: es la lectura más generosa, y la que hace cualquier ATS que lo acepte.
    """
    texto = texto.strip()
    if _FIN_ABIERTO_EXACTO.match(texto):
        return _absoluto(hoy.year, hoy.month), False

    if coincidencia := re.fullmatch(rf"({MESES})\.?\s*['’]?(\d{{2}}|\d{{4}})", texto, re.IGNORECASE):
        mes = _NUMERO_DE_MES[coincidencia.group(1)[:3].lower()]
        cifras = coincidencia.group(2)
        año = int(cifras) if len(cifras) == 4 else _año_de_dos_cifras(int(cifras), hoy)
        return _absoluto(año, mes), False

    if coincidencia := re.fullmatch(r"(\d{1,2})[/-](\d{4})", texto):
        mes, año = int(coincidencia.group(1)), int(coincidencia.group(2))
        return (_absoluto(año, mes), False) if 1 <= mes <= 12 else None

    if coincidencia := re.fullmatch(r"(\d{4})-(\d{1,2})", texto):
        año, mes = int(coincidencia.group(1)), int(coincidencia.group(2))
        return (_absoluto(año, mes), False) if 1 <= mes <= 12 else None

    if re.fullmatch(r"(?:19|20)\d{2}", texto):
        return _absoluto(int(texto), 12 if es_fin else 1), True

    return None


def periodos(texto: str, hoy: date) -> list[Periodo]:
    """Los periodos con inicio y fin, incluidos los abiertos ("– Actualidad").

    `hoy` es un parámetro y no `date.today()`: un periodo abierto llega hasta la
    fecha del análisis, y sin poder fijarla los tests cambiarían de resultado con
    el calendario.

    Se descartan los periodos imposibles —fin antes del inicio— y los que
    empiezan en el futuro; un fin futuro se recorta a hoy.
    """
    actual = _absoluto(hoy.year, hoy.month)
    encontrados: list[Periodo] = []

    for coincidencia in _RANGO.finditer(texto):
        inicio = _leer_fecha(coincidencia.group("inicio"), hoy, es_fin=False)
        fin = _leer_fecha(coincidencia.group("fin"), hoy, es_fin=True)
        if inicio is None or fin is None:
            continue
        (mes_inicio, inicio_solo_año), (mes_fin, fin_solo_año) = inicio, fin
        mes_fin = min(mes_fin, actual)
        if mes_inicio > mes_fin:
            continue
        encontrados.append(
            Periodo(inicio=mes_inicio, fin=mes_fin, solo_año=inicio_solo_año or fin_solo_año)
        )

    return encontrados


def meses_de_experiencia(lista: list[Periodo]) -> int:
    """Suma los meses fusionando los periodos que se solapan.

    Dos empleos simultáneos no son el doble de experiencia: de Ene 2020 a Dic
    2021 y de Jun 2021 a Dic 2022 hay tres años, no tres años y medio.
    """
    total = 0
    fin_cubierto = None
    for periodo in sorted(lista, key=lambda p: p.inicio):
        if fin_cubierto is None or periodo.inicio > fin_cubierto:
            total += periodo.meses
            fin_cubierto = periodo.fin
        elif periodo.fin > fin_cubierto:
            total += periodo.fin - fin_cubierto
            fin_cubierto = periodo.fin
    return total


def describir(meses: int) -> str:
    """"2 años y 4 meses", "1 año", "8 meses"."""
    años, resto = divmod(meses, 12)
    partes = []
    if años:
        partes.append(f"{años} año{'s' if años != 1 else ''}")
    if resto or not años:
        partes.append(f"{resto} mes{'es' if resto != 1 else ''}")
    return " y ".join(partes)


def formatos_presentes(texto: str) -> set[str]:
    """Las familias de formato que aparecen en el texto.

    "solo_año" no cuenta como formato propio cuando hay uno más específico: un CV
    con "Ene 2020 – Mar 2023" también contiene los años sueltos, y tratarlo como
    mezcla sería un falso positivo.
    """
    presentes = {nombre for nombre, patron in FORMATOS_DE_FECHA.items() if patron.search(texto)}
    if len(presentes) > 1:
        presentes.discard("solo_año")
    return presentes


def experiencia(texto: str, hoy: date) -> Experiencia:
    """La experiencia laboral del CV, calculada sobre su sección de experiencia.

    Sumar el texto entero contaría la carrera universitaria como experiencia. Si
    no se reconoce la sección —títulos creativos, columnas— se cae al texto
    completo y se deja constancia en `desde_la_seccion`, para que quien lo muestra
    pueda decirlo.
    """
    bloque = segmentar(texto).get("experiencia")
    desde_la_seccion = bloque is not None
    lista = periodos(bloque if desde_la_seccion else texto, hoy)

    if not lista:
        return Experiencia(meses=None, aproximado=False, desde_la_seccion=desde_la_seccion)

    return Experiencia(
        meses=meses_de_experiencia(lista),
        aproximado=any(periodo.solo_año for periodo in lista),
        desde_la_seccion=desde_la_seccion,
    )

"""Verificaciones de parseabilidad: qué vería un ATS de este currículum.

Nada aquí usa IA, y es deliberado. Un modelo de lenguaje no puede saber si un PDF
tiene capa de texto ni si está maquetado a dos columnas; si se le pregunta,
responde con seguridad y una parte inventada. Todo lo que este módulo afirma sale
de medir el documento, así que es reproducible y se puede explicar regla por
regla.

Tampoco se calcula un "puntaje ATS sobre 100". Los ATS grandes no puntúan:
Workday parsea a campos que el reclutador busca y filtra, Taleo hace búsquedas
booleanas, Greenhouse no puntúa. El mecanismo real por el que un candidato queda
fuera no es un rechazo con nota, es que sus datos no entraron a los campos y por
eso no aparece en la búsqueda. Lo que se reporta, entonces, es **qué campos se
extrajeron y qué los rompió**.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

from integrations.documentos.extractor import DocumentoExtraido, Palabra
from integrations.documentos.secciones import SECCIONES_CRITICAS, titulo_de

# Severidades, de mayor a menor. `critica` es "el ATS no te ve"; `alta` es "pierde
# parte de tu información"; `media` es "puede revolverla"; `info` no es un
# problema, solo contexto.
SEVERIDADES = ("critica", "alta", "media", "info")

MAXIMO_PAGINAS_RECOMENDADO = 2

_CORREO = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
# Tolerante a propósito: separadores variados y prefijo internacional opcional,
# porque un número boliviano se escribe de muchas formas (+591 7xx xx xxx,
# 7xxxxxxx, 7-xxx-xxxx).
# Los grupos admiten uno a cuatro dígitos, no dos a cuatro: con el mínimo en dos
# un número escrito «+591 7 123 4567» empezaba a encajar recién en «123 4567» y
# el espejo le mostraba al usuario su teléfono truncado. Lo que evita que el
# patrón se desborde no es su rigidez sino el mínimo de dígitos que exige
# `_detectar_telefono`.
_TELEFONO = re.compile(r"(?:\+\s?\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?){2,5}\d{2,4}")
_URL = re.compile(r"(?:https?://|www\.|linkedin\.com|github\.com)", re.IGNORECASE)

_MESES = (
    "ene|feb|mar|abr|may|jun|jul|ago|sep|set|oct|nov|dic"
    "|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre"
    "|jan|apr|aug|dec|january|february|march|april|june|july|august|september|october|november|december"
)

# Familias de formato de fecha. Mezclarlas es la causa más común de que un ATS
# no pueda calcular la antigüedad: el candidato con ocho años de experiencia
# aparece en la base con tres.
_FORMATOS_DE_FECHA = {
    "mes_año": re.compile(rf"\b(?:{_MESES})\.?\s+\d{{4}}\b", re.IGNORECASE),
    "mes_año_corto": re.compile(rf"\b(?:{_MESES})\.?\s*['’]\d{{2}}\b", re.IGNORECASE),
    "numerico": re.compile(r"\b\d{1,2}[/-]\d{4}\b"),
    "iso": re.compile(r"\b\d{4}-\d{1,2}\b"),
    "solo_año": re.compile(r"(?<![\d/-])\b(?:19|20)\d{2}\b(?![\d/-])"),
}

_SEPARADOR_DE_RANGO = r"(?:\s*(?:-|–|—|a|al|hasta|to)\s*)"
_FIN_ABIERTO = r"(?:actualidad|presente|actual|hoy|present|current|now)"


@dataclass(frozen=True)
class Hallazgo:
    """Una observación sobre el documento.

    `favorable` separa las fortalezas de las debilidades. Se reportan las dos:
    decirle al usuario solo lo que está mal no le dice qué conservar al corregir.
    """

    codigo: str
    severidad: str
    titulo: str
    detalle: str
    favorable: bool = False


@dataclass(frozen=True)
class Campo:
    """Un campo de la ficha que el ATS armaría, y si se pudo llenar."""

    nombre: str
    detectado: bool
    valor: str = ""
    nota: str = ""


@dataclass
class Analisis:
    """El resultado completo: la ficha que vería el ATS más lo que la rompió."""

    campos: list[Campo] = field(default_factory=list)
    hallazgos: list[Hallazgo] = field(default_factory=list)
    paginas: int = 0
    formato: str = ""

    @property
    def campos_detectados(self) -> int:
        return sum(1 for campo in self.campos if campo.detectado)

    @property
    def parseabilidad(self) -> str:
        """Métrica honesta: campos extraídos sobre campos intentados.

        No es un puntaje de calidad del CV ni una predicción de contratación. Es
        exactamente lo que dice: cuántos de los campos que un ATS intenta llenar
        se pudieron llenar con este documento.
        """
        return f"{self.campos_detectados}/{len(self.campos)}"

    @property
    def debilidades(self) -> list[Hallazgo]:
        orden = {severidad: indice for indice, severidad in enumerate(SEVERIDADES)}
        return sorted(
            (h for h in self.hallazgos if not h.favorable),
            key=lambda h: orden.get(h.severidad, len(SEVERIDADES)),
        )

    @property
    def fortalezas(self) -> list[Hallazgo]:
        return [h for h in self.hallazgos if h.favorable]


def analizar(documento: DocumentoExtraido) -> Analisis:
    """Aplica las verificaciones de parseabilidad sobre un documento extraído."""
    analisis = Analisis(paginas=documento.paginas, formato=documento.formato)

    # Sin capa de texto no hay nada más que verificar: el resto de las reglas
    # mediría un texto vacío y produciría una lista de debilidades falsas que
    # ahogaría la única que importa.
    if not documento.tiene_capa_de_texto:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="sin_capa_de_texto",
                severidad="critica",
                titulo="El ATS no puede leer nada de tu CV",
                detalle=(
                    "El archivo no contiene texto seleccionable: es una imagen. "
                    "Suele pasar cuando el CV se imprimió y se escaneó, o se exportó "
                    "como imagen. Un ATS extrae cero caracteres, así que no apareces "
                    "en ninguna búsqueda del reclutador. Exporta el CV directamente "
                    "desde Word o Google Docs, sin pasar por el escáner."
                ),
            )
        )
        analisis.campos = [
            Campo(nombre=nombre, detectado=False, nota="sin texto que leer")
            for nombre in ("Nombre", "Correo", "Teléfono", "Experiencia", "Educación", "Habilidades", "Antigüedad")
        ]
        return analisis

    texto = documento.texto

    _verificar_contacto(texto, analisis)
    _verificar_secciones(texto, analisis)
    _verificar_fechas(texto, analisis)
    _verificar_geometria(documento, analisis)
    _verificar_formato(documento, analisis)

    return analisis


def _verificar_contacto(texto: str, analisis: Analisis) -> None:
    nombre = _detectar_nombre(texto)
    analisis.campos.append(
        Campo(
            nombre="Nombre",
            detectado=bool(nombre),
            valor=nombre,
            nota="" if nombre else "no se encontró un nombre en las primeras líneas",
        )
    )

    correo = _CORREO.search(texto)
    analisis.campos.append(
        Campo(
            nombre="Correo",
            detectado=bool(correo),
            valor=correo.group(0) if correo else "",
        )
    )
    if not correo:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="sin_correo",
                severidad="critica",
                titulo="No se detectó tu correo electrónico",
                detalle=(
                    "Es el campo con el que el reclutador te contacta. Si está dentro "
                    "de una imagen, de un icono o del encabezado del documento, el ATS "
                    "no lo extrae. Escríbelo como texto normal en el cuerpo del CV."
                ),
            )
        )

    telefono = _detectar_telefono(texto)
    analisis.campos.append(
        Campo(nombre="Teléfono", detectado=bool(telefono), valor=telefono)
    )
    if not telefono:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="sin_telefono",
                severidad="media",
                titulo="No se detectó un número de teléfono",
                detalle=(
                    "No todos los procesos lo exigen, pero muchos formularios de "
                    "postulación lo rellenan automáticamente desde el CV y lo dejan "
                    "vacío si no lo encuentran."
                ),
            )
        )

    if correo and telefono and nombre:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="contacto_completo",
                severidad="info",
                titulo="Tus datos de contacto se extraen bien",
                detalle="Nombre, correo y teléfono se detectan como texto, que es lo que necesita el ATS.",
                favorable=True,
            )
        )


def _detectar_telefono(texto: str) -> str:
    """Busca un teléfono descartando antes lo que se le parece.

    Un rango de fechas como «2016-02 – 2021» encaja en cualquier patrón de
    teléfono razonablemente tolerante, y un correo o una URL también traen
    dígitos. Se eliminan primero, y al final se exige un mínimo de dígitos: en
    Bolivia un celular tiene ocho y una línea fija siete, así que menos de siete
    no es un teléfono.
    """
    MINIMO_DE_DIGITOS = 7

    sin_ruido = _URL.sub(" ", _CORREO.sub(" ", texto))
    for patron in _FORMATOS_DE_FECHA.values():
        sin_ruido = patron.sub(" ", sin_ruido)

    for candidato in _TELEFONO.finditer(sin_ruido):
        encontrado = candidato.group(0).strip()
        if sum(1 for caracter in encontrado if caracter.isdigit()) >= MINIMO_DE_DIGITOS:
            return encontrado
    return ""


def _detectar_nombre(texto: str) -> str:
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
        if _CORREO.search(candidato) or _URL.search(candidato) or any(c.isdigit() for c in candidato):
            continue
        palabras = candidato.split()
        if 2 <= len(palabras) <= 5 and all(palabra[:1].isupper() for palabra in palabras):
            return candidato
    return ""


def _verificar_secciones(texto: str, analisis: Analisis) -> None:
    # `titulo_de` vive en `secciones.py` y es el mismo criterio que usa
    # `segmentar()`. Compartirlo no es solo evitar duplicación: si los dos
    # divergieran, el análisis podría reportar una sección como reconocida y a la
    # vez no encontrar su bloque, y el usuario vería dos afirmaciones que se
    # contradicen.
    encontradas = {
        seccion
        for linea in texto.splitlines()
        if (seccion := titulo_de(linea)) is not None
    }

    etiquetas = {"experiencia": "Experiencia", "educacion": "Educación", "habilidades": "Habilidades"}
    for seccion, etiqueta in etiquetas.items():
        detectada = seccion in encontradas
        analisis.campos.append(
            Campo(
                nombre=etiqueta,
                detectado=detectada,
                nota="" if detectada else "no hay un título de sección que el ATS reconozca",
            )
        )

    faltantes = [etiquetas[s] for s in SECCIONES_CRITICAS if s not in encontradas]
    if faltantes:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="secciones_no_reconocidas",
                severidad="alta",
                titulo=f"El ATS no reconoce tus secciones de {' y '.join(faltantes)}",
                detalle=(
                    "El parser decide dónde guardar cada bloque leyendo el título que "
                    "lo encabeza. Con títulos creativos como «Mi trayectoria» o "
                    "«Toolkit» no sabe en qué campo ponerlo, y el contenido puede no "
                    "registrarse en ninguno. Usa títulos convencionales: "
                    "«Experiencia», «Educación», «Habilidades»."
                ),
            )
        )
    else:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="secciones_reconocidas",
                severidad="info",
                titulo="Tus títulos de sección son los que el ATS espera",
                detalle="Experiencia y Habilidades se mapean a los campos que el reclutador busca.",
                favorable=True,
            )
        )


def _verificar_fechas(texto: str, analisis: Analisis) -> None:
    presentes = {nombre for nombre, patron in _FORMATOS_DE_FECHA.items() if patron.search(texto)}

    # "solo_año" no cuenta como formato propio cuando hay uno más específico: un
    # CV con "Ene 2020 – Mar 2023" también contiene los años sueltos, y tratarlo
    # como mezcla sería un falso positivo.
    if len(presentes) > 1:
        presentes.discard("solo_año")

    rangos = _contar_rangos(texto)
    analisis.campos.append(
        Campo(
            nombre="Antigüedad",
            detectado=rangos > 0,
            valor=f"{rangos} periodo{'s' if rangos != 1 else ''} con fechas de inicio y fin" if rangos else "",
            nota="" if rangos else "no se encontró ningún periodo con fecha de inicio y fin",
        )
    )

    if rangos == 0:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="antiguedad_no_calculable",
                severidad="alta",
                titulo="El ATS no puede calcular tus años de experiencia",
                detalle=(
                    "No se encontró ningún periodo con fecha de inicio y fin. Los "
                    "reclutadores filtran por antigüedad, y un candidato cuya "
                    "experiencia no se puede calcular queda por debajo de otros con "
                    "menos trayectoria pero fechas legibles. Escribe cada empleo como "
                    "«Ene 2020 – Mar 2023» o «Ene 2023 – Actualidad»."
                ),
            )
        )

    if len(presentes) > 1:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="formatos_de_fecha_mezclados",
                severidad="alta",
                titulo="Mezclas varios formatos de fecha",
                detalle=(
                    f"Se detectaron {len(presentes)} formatos distintos en el mismo "
                    "documento. Es la causa más frecuente de error de parseo: el ATS "
                    "no puede sumar periodos escritos de formas distintas y subestima "
                    "tu antigüedad. Unifícalos en «Mes Año», que es el que parsea con "
                    "más fiabilidad."
                ),
            )
        )
    elif rangos > 0:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="fechas_consistentes",
                severidad="info",
                titulo="Tus fechas son consistentes y se pueden sumar",
                detalle=f"Un solo formato en todo el CV y {rangos} periodos delimitados.",
                favorable=True,
            )
        )


def _contar_rangos(texto: str) -> int:
    """Cuenta periodos con inicio y fin, incluyendo los abiertos ("– Actualidad").

    Se usa un único patrón que admite cualquiera de los formatos a cada lado del
    separador, en vez de contar por formato y sumar. Sumar contaba dos veces el
    mismo rango: "Ene 2020 – Mar 2023" encaja en `mes_año` y sus años sueltos
    encajan además en `solo_año`.
    """
    cualquier_fecha = "|".join(patron.pattern for patron in _FORMATOS_DE_FECHA.values())
    rango = re.compile(
        rf"(?:{cualquier_fecha}){_SEPARADOR_DE_RANGO}(?:(?:{cualquier_fecha})|{_FIN_ABIERTO})",
        re.IGNORECASE,
    )
    return len(rango.findall(texto))


def _verificar_geometria(documento: DocumentoExtraido, analisis: Analisis) -> None:
    """Columnas y tablas: lo que revuelve el orden de lectura.

    Solo aplica a PDF. Un DOCX no tiene coordenadas absolutas; su maquetación en
    columnas se hace con tablas, que se verifican aparte.
    """
    if documento.formato == "pdf" and documento.palabras and _hay_dos_columnas(documento.palabras):
        analisis.hallazgos.append(
            Hallazgo(
                codigo="dos_columnas",
                severidad="alta",
                titulo="Tu CV está maquetado a dos columnas",
                detalle=(
                    "El ATS lee línea por línea, de arriba abajo, y no sabe qué columna "
                    "va primero. El texto sale intercalado: un puesto de trabajo puede "
                    "quedar separado de su fecha, y una habilidad terminar dentro de la "
                    "descripción de otro empleo. Pasa el CV a una sola columna."
                ),
            )
        )

    if documento.tablas:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="contiene_tablas",
                severidad="media",
                titulo=f"Se detectaron {documento.tablas} tabla{'s' if documento.tablas != 1 else ''}",
                detalle=(
                    "El orden en que un parser recorre las celdas es impredecible, así "
                    "que el contenido de una tabla puede salir desordenado. Si usaste "
                    "una tabla para alinear las habilidades o las fechas, reemplázala "
                    "por texto corrido."
                ),
            )
        )

    # Imágenes con la sección de habilidades ausente es el patrón de las barras
    # de nivel ("Python ████░░ 80%"): decorativas para el lector, invisibles
    # para el parser. Por separado, cada señal es débil; juntas son concluyentes.
    habilidades_detectadas = any(c.nombre == "Habilidades" and c.detectado for c in analisis.campos)
    if documento.imagenes and not habilidades_detectadas:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="habilidades_en_graficos",
                severidad="alta",
                titulo="Tus habilidades podrían estar dentro de gráficos",
                detalle=(
                    f"El documento tiene {documento.imagenes} "
                    f"imagen{'es' if documento.imagenes != 1 else ''} y no se detectó una "
                    "sección de habilidades legible. Las barras de nivel y los iconos "
                    "son invisibles para el ATS: crees haber declarado tus tecnologías "
                    "y en la base de datos del reclutador no existe ninguna. Escríbelas "
                    "como una lista de texto."
                ),
            )
        )
    elif documento.imagenes:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="contiene_imagenes",
                severidad="media",
                titulo=f"El documento tiene {documento.imagenes} imagen{'es' if documento.imagenes != 1 else ''}",
                detalle=(
                    "El ATS no extrae texto de las imágenes. No es grave si son "
                    "decorativas, pero revisa que no contengan información que solo "
                    "esté ahí."
                ),
            )
        )


def _hay_dos_columnas(palabras: list[Palabra]) -> bool:
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


def _verificar_formato(documento: DocumentoExtraido, analisis: Analisis) -> None:
    if documento.formato == "pdf" and documento.paginas > MAXIMO_PAGINAS_RECOMENDADO:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="demasiadas_paginas",
                severidad="media",
                titulo=f"Tu CV tiene {documento.paginas} páginas",
                detalle=(
                    f"No rompe el parseo, pero para un perfil de egresado "
                    f"{MAXIMO_PAGINAS_RECOMENDADO} página"
                    f"{'s' if MAXIMO_PAGINAS_RECOMENDADO != 1 else ''} es lo habitual. "
                    "Un reclutador revisa decenas de CV y lo que está en la tercera "
                    "página rara vez se lee."
                ),
            )
        )

    if documento.formato == "pdf" and not documento.tablas and not documento.imagenes:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="estructura_limpia",
                severidad="info",
                titulo="La estructura del documento parsea limpio",
                detalle="Sin tablas ni imágenes que puedan revolver el orden de lectura.",
                favorable=True,
            )
        )

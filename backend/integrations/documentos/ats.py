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

Cada regla es una función `_verificar_*` registrada en `_VERIFICACIONES`, que
`analizar()` recorre en orden. Añadir una regla es escribir una función y
añadirla al registro; el flujo no cambia.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import date

from integrations.documentos import fechas, ubicaciones
from integrations.documentos.extractor import DocumentoExtraido, Palabra
from integrations.documentos.secciones import SECCIONES_CRITICAS, encabezado, segmentar, titulo_de
from integrations.documentos.terminos import escritos_de_una_sola_forma

#: Versión del conjunto de reglas. Se guarda con cada análisis para que uno hecho
#: con reglas anteriores se recalcule al volver a subir el mismo CV, en vez de
#: mostrarle al usuario un diagnóstico que ya no es el vigente. **Hay que subirla
#: cada vez que cambie lo que el análisis o la brecha producen.**
VERSION_DE_REGLAS = 2

#: Los campos de la ficha que arma el ATS, en el orden en que se muestran. Es la
#: única lista: el caso sin capa de texto la recorre y un test comprueba que las
#: verificaciones emiten exactamente estos.
CAMPOS_DE_LA_FICHA = (
    "Nombre",
    "Correo",
    "Teléfono",
    "Ubicación",
    "Experiencia",
    "Educación",
    "Habilidades",
    "Antigüedad",
)

# Severidades, de mayor a menor. `critica` es "el ATS no te ve"; `alta` es "pierde
# parte de tu información"; `media` es "puede revolverla"; `info` no es un
# problema, solo contexto.
SEVERIDADES = ("critica", "alta", "media", "info")

MAXIMO_PAGINAS_RECOMENDADO = 2

#: Menos que esto puede ser un espacio o un punto blanco suelto de la plantilla.
MINIMO_CARACTERES_OCULTOS = 20

#: Cuántas líneas se miran como encabezado cuando no hay títulos que lo delimiten.
LINEAS_DE_ENCABEZADO_SIN_TITULOS = 8

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


@dataclass
class _Contexto:
    """Lo que varias reglas necesitan, calculado una sola vez por análisis."""

    documento: DocumentoExtraido
    hoy: date
    secciones: dict[str, str]
    encabezado: str
    experiencia: fechas.Experiencia
    #: Campo de contacto → zona que el ATS no lee donde sí aparece. Lo llena la
    #: verificación de zonas ocultas, que corre antes que la de contacto.
    contacto_oculto: dict[str, str] = field(default_factory=dict)

    @property
    def texto(self) -> str:
        return self.documento.texto


#: Hallazgo que necesita el CV y la convocatoria a la vez, así que no lo emite
#: `analizar()` sino quien los combina. Vive aquí para que todos los hallazgos
#: estén en el mismo sitio.
IDIOMA_DISTINTO = Hallazgo(
    codigo="idioma_distinto",
    severidad="alta",
    titulo="Tu CV y la convocatoria están en idiomas distintos",
    detalle=(
        "La búsqueda del reclutador usa las palabras de la convocatoria. Los nombres "
        "de tecnologías coinciden en cualquier idioma, pero «experiencia en desarrollo "
        "de APIs» no encuentra «API development experience». Si la oferta está en "
        "otro idioma, envía tu CV en ese idioma."
    ),
)


def analizar(documento: DocumentoExtraido, hoy: date | None = None) -> Analisis:
    """Aplica las verificaciones de parseabilidad sobre un documento extraído.

    `hoy` fija hasta cuándo llega un periodo abierto ("– Actualidad"); por
    defecto, la fecha actual.
    """
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
            Campo(nombre=nombre, detectado=False, nota="sin texto que leer") for nombre in CAMPOS_DE_LA_FICHA
        ]
        return analisis

    hoy = hoy or date.today()
    texto = documento.texto
    contexto = _Contexto(
        documento=documento,
        hoy=hoy,
        secciones=segmentar(texto),
        # Sin títulos no hay dónde cortar: se toman las primeras líneas, que es
        # donde cualquier plantilla pone los datos personales.
        encabezado=encabezado(texto)
        or "\n".join(texto.splitlines()[:LINEAS_DE_ENCABEZADO_SIN_TITULOS]),
        experiencia=fechas.experiencia(texto, hoy),
    )

    for verificar in _VERIFICACIONES:
        verificar(contexto, analisis)

    return analisis


def _extracto(texto: str, largo: int = 80) -> str:
    plano = " ".join(texto.split())
    return plano if len(plano) <= largo else plano[: largo - 1].rstrip() + "…"


def _contacto_en(texto: str) -> dict[str, bool]:
    return {
        "Nombre": bool(detectar_nombre(texto)),
        "Correo": bool(CORREO.search(texto)),
        "Teléfono": bool(detectar_telefono(texto)),
    }


def _verificar_zonas_ocultas(contexto: _Contexto, analisis: Analisis) -> None:
    """Cuadros de texto y encabezado/pie de página: lo que muchos ATS no leen.

    Corre antes que la verificación de contacto porque decide el motivo de que un
    dato falte. Si el correo está en el encabezado, el hallazgo crítico es este y
    reemplaza al genérico "no se detectó tu correo": un mismo fallo con dos avisos
    le haría creer al usuario que tiene dos problemas.
    """
    documento = contexto.documento
    en_el_cuerpo = _contacto_en(contexto.texto)

    zonas = (
        ("texto_en_cuadros", documento.texto_en_cuadros, "un cuadro de texto", "alta"),
        ("texto_en_encabezado", documento.texto_en_encabezado, "el encabezado o pie de página", "media"),
    )

    for codigo, texto_de_la_zona, zona, severidad in zonas:
        if not texto_de_la_zona.strip():
            continue

        escondidos = [
            campo
            for campo, esta in _contacto_en(texto_de_la_zona).items()
            if esta and not en_el_cuerpo[campo] and campo not in contexto.contacto_oculto
        ]
        for campo in escondidos:
            contexto.contacto_oculto[campo] = zona

        if escondidos:
            datos = " y ".join(campo.lower() for campo in escondidos)
            analisis.hallazgos.append(
                Hallazgo(
                    codigo=codigo,
                    severidad="critica",
                    titulo=f"Tu {datos} {'está' if len(escondidos) == 1 else 'están'} en {zona}",
                    detalle=(
                        f"Muchos ATS no leen {zona}, así que para el reclutador tu "
                        f"{datos} no existe aunque se vea en el documento. Escríbelo "
                        "como texto normal en el cuerpo del CV, debajo de tu nombre. "
                        f"Lo que hay ahí: «{_extracto(texto_de_la_zona)}»."
                    ),
                )
            )
        else:
            analisis.hallazgos.append(
                Hallazgo(
                    codigo=codigo,
                    severidad=severidad,
                    titulo=f"Parte de tu CV está en {zona}",
                    detalle=(
                        f"Muchos ATS no leen {zona}: lo que pongas ahí puede no llegar "
                        "a la búsqueda del reclutador. Pásalo al cuerpo del documento "
                        f"como texto normal. Lo que hay ahí: «{_extracto(texto_de_la_zona)}»."
                    ),
                )
            )


def _nota_de_contacto(contexto: _Contexto, campo: str, sin_dato: str) -> str:
    if zona := contexto.contacto_oculto.get(campo):
        return f"está en {zona}, que el ATS no lee"
    return sin_dato


def _verificar_contacto(contexto: _Contexto, analisis: Analisis) -> None:
    texto = contexto.texto

    nombre = detectar_nombre(texto)
    analisis.campos.append(
        Campo(
            nombre="Nombre",
            detectado=bool(nombre),
            valor=nombre,
            nota="" if nombre else _nota_de_contacto(
                contexto, "Nombre", "no se encontró un nombre en las primeras líneas"
            ),
        )
    )

    correo = CORREO.search(texto)
    analisis.campos.append(
        Campo(
            nombre="Correo",
            detectado=bool(correo),
            valor=correo.group(0) if correo else "",
            nota="" if correo else _nota_de_contacto(contexto, "Correo", ""),
        )
    )
    if not correo and "Correo" not in contexto.contacto_oculto:
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

    telefono = detectar_telefono(texto)
    analisis.campos.append(
        Campo(
            nombre="Teléfono",
            detectado=bool(telefono),
            valor=telefono,
            nota="" if telefono else _nota_de_contacto(contexto, "Teléfono", ""),
        )
    )
    if not telefono and "Teléfono" not in contexto.contacto_oculto:
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


def _verificar_ubicacion(contexto: _Contexto, analisis: Analisis) -> None:
    """La ciudad, en el encabezado: es un filtro del reclutador.

    Solo en el encabezado y sin la línea del nombre: "Santa Cruz" en una
    experiencia puede ser una empresa, y "Lima" o "Pando" son también apellidos.
    """
    nombre = detectar_nombre(contexto.texto)
    lineas = [linea for linea in contexto.encabezado.splitlines() if linea.strip() != nombre]
    lugares = ubicaciones.encontrar("\n".join(lineas))

    analisis.campos.append(
        Campo(
            nombre="Ubicación",
            detectado=bool(lugares),
            valor=", ".join(lugares),
            nota="" if lugares else "no se encontró una ciudad o país junto a tus datos",
        )
    )

    if not lugares:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="sin_ubicacion",
                severidad="media",
                titulo="No se detectó tu ciudad",
                detalle=(
                    "Los reclutadores filtran candidatos por ubicación antes de leer "
                    "nada más, y un CV sin ciudad queda fuera de ese filtro. Escribe tu "
                    "ciudad y país junto a tus datos de contacto, por ejemplo "
                    "«Cochabamba, Bolivia». Si buscas trabajo remoto, dilo también."
                ),
            )
        )


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

def _verificar_secciones(contexto: _Contexto, analisis: Analisis) -> None:
    # `titulo_de` vive en `secciones.py` y es el mismo criterio que usa
    # `segmentar()`. Compartirlo no es solo evitar duplicación: si los dos
    # divergieran, el análisis podría reportar una sección como reconocida y a la
    # vez no encontrar su bloque, y el usuario vería dos afirmaciones que se
    # contradicen.
    encontradas = {
        seccion
        for linea in contexto.texto.splitlines()
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


def _verificar_fechas(contexto: _Contexto, analisis: Analisis) -> None:
    """La antigüedad que calcularía el ATS, y si las fechas se pueden sumar.

    Se calcula sobre la sección de experiencia (`fechas.experiencia`): sumar el CV
    completo contaría la carrera universitaria. Si la sección no se reconoce se
    cae al texto completo, y la nota del campo lo dice.
    """
    experiencia = contexto.experiencia
    calculable = experiencia.meses is not None

    nota = ""
    if not calculable:
        nota = "no se encontró ningún periodo con fecha de inicio y fin"
    elif not experiencia.desde_la_seccion:
        nota = "calculada sobre todo el CV porque no se reconoció la sección de experiencia; puede incluir estudios"

    analisis.campos.append(
        Campo(nombre="Antigüedad", detectado=calculable, valor=experiencia.descripcion, nota=nota)
    )

    if not calculable:
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

    presentes = fechas.formatos_presentes(contexto.texto)
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
    elif calculable:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="fechas_consistentes",
                severidad="info",
                titulo="Tus fechas son consistentes y se pueden sumar",
                detalle=f"Un solo formato en todo el CV: el ATS calcula {experiencia.descripcion} de experiencia.",
                favorable=True,
            )
        )


def _verificar_geometria(contexto: _Contexto, analisis: Analisis) -> None:
    """Columnas y tablas: lo que revuelve el orden de lectura.

    Solo aplica a PDF. Un DOCX no tiene coordenadas absolutas; su maquetación en
    columnas se hace con tablas, que se verifican aparte.
    """
    documento = contexto.documento
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

def _verificar_texto_oculto(contexto: _Contexto, analisis: Analisis) -> None:
    """Texto blanco o diminuto: invisible para quien lee, no para el ATS."""
    ocultos = contexto.documento.caracteres_ocultos
    if ocultos < MINIMO_CARACTERES_OCULTOS:
        return
    analisis.hallazgos.append(
        Hallazgo(
            codigo="texto_oculto",
            severidad="alta",
            titulo="Tu CV tiene texto que no se ve",
            detalle=(
                f"Se encontraron {ocultos} caracteres en blanco o en un tamaño menor a "
                "4 puntos. El ATS los lee igual, y muchos le muestran al reclutador el "
                "texto extraído: palabras clave escondidas se ven como un intento de "
                "engañar al filtro y suelen descartar la candidatura. Comprueba si es "
                "intencional; si no lo es, elimínalo."
            ),
        )
    )


def _verificar_siglas(contexto: _Contexto, analisis: Analisis) -> None:
    """Términos escritos solo como sigla o solo con su nombre largo.

    Un único hallazgo con todos los términos: uno por término inundaría la lista
    con avisos que son, en el fondo, el mismo consejo.
    """
    sugerencias = escritos_de_una_sola_forma(contexto.texto)
    if not sugerencias:
        return
    analisis.hallazgos.append(
        Hallazgo(
            codigo="solo_sigla_o_solo_nombre",
            severidad="info",
            titulo="Algunos términos aparecen de una sola forma",
            detalle=(
                "La búsqueda de un ATS es literal: quien busca «Amazon Web Services» "
                "no encuentra «AWS», y al revés. Escríbelos una vez de las dos formas: "
                + ", ".join(f"«{sugerencia}»" for sugerencia in sugerencias)
                + "."
            ),
        )
    )


def _verificar_formato(contexto: _Contexto, analisis: Analisis) -> None:
    documento = contexto.documento
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


#: El orden importa en dos puntos: las zonas ocultas antes que el contacto —deciden
#: por qué falta un dato— y las secciones antes que la geometría, que mira si
#: Habilidades se reconoció. El resto sigue el orden de la ficha.
_VERIFICACIONES: tuple[Callable[[_Contexto, Analisis], None], ...] = (
    _verificar_zonas_ocultas,
    _verificar_contacto,
    _verificar_ubicacion,
    _verificar_secciones,
    _verificar_fechas,
    _verificar_geometria,
    _verificar_texto_oculto,
    _verificar_siglas,
    _verificar_formato,
)

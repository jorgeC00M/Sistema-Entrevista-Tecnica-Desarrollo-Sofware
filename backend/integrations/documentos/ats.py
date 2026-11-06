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

from collections.abc import Callable
from dataclasses import dataclass, field, replace
from datetime import date

from integrations.documentos import fechas, ubicaciones
from integrations.documentos.contacto import CORREO, detectar_nombre, detectar_telefono
from integrations.documentos.extractor import DocumentoExtraido
# Los ejemplos y los tipos del resultado viven aparte; se importan aquí (y se
# reexportan) para que `from integrations.documentos.ats import …` siga igual.
from integrations.documentos.ejemplos_ats import (  # noqa: F401
    EJEMPLO_DE_CONTACTO,
    EJEMPLO_DE_SECCIONES,
    EJEMPLO_DE_PERIODO,
    EJEMPLO_DE_FECHAS,
    EJEMPLO_DE_HABILIDADES,
    EJEMPLO_DE_UNA_COLUMNA,
    EJEMPLO_SIN_TABLAS,
    EJEMPLO_DE_SIGLA,
)
from integrations.documentos.modelos_ats import SEVERIDADES, Analisis, Campo, Hallazgo  # noqa: F401
from integrations.documentos.geometria import hay_dos_columnas
from integrations.documentos.secciones import SECCIONES_CRITICAS, encabezado_del_cv, titulo_de
from integrations.documentos.terminos import escritos_de_una_sola_forma

#: Versión del conjunto de reglas. Se guarda con cada análisis para que uno hecho
#: con reglas anteriores se recalcule al volver a subir el mismo CV, en vez de
#: mostrarle al usuario un diagnóstico que ya no es el vigente. **Hay que subirla
#: cada vez que cambie lo que el análisis o la brecha producen.**
VERSION_DE_REGLAS = 8

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

MAXIMO_PAGINAS_RECOMENDADO = 2

#: Menos que esto puede ser un espacio o un punto blanco suelto de la plantilla.
MINIMO_CARACTERES_OCULTOS = 20


@dataclass
class _Contexto:
    """Lo que varias reglas necesitan, calculado una sola vez por análisis."""

    documento: DocumentoExtraido
    encabezado: str
    experiencia: fechas.Experiencia
    #: El nombre que vería el ATS, o cadena vacía. Lo leen la ficha y la regla de
    #: ubicación, que descarta su línea.
    nombre: str
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
    accion="Envía tu CV en el idioma del aviso",
    detalle=(
        "El reclutador busca con las palabras de la convocatoria. Los nombres de "
        "tecnologías coinciden en cualquier idioma, pero «experiencia en desarrollo de "
        "APIs» no encuentra «API development experience». Si la oferta está en otro "
        "idioma, prepara una versión de tu CV en ese idioma."
    ),
)


def _detalle_sin_capa_de_texto(documento: DocumentoExtraido) -> str:
    """Por qué el ATS no lee nada, según el formato: la causa y el arreglo
    cambian, y decir "se escaneó" de un DOCX sería afirmar algo falso.

    Un DOCX no se escanea: llega sin texto legible porque el contenido vive en
    cuadros de texto (que `texto` excluye a propósito) o porque es una imagen
    pegada en el documento.
    """
    final = "Un ATS extrae cero caracteres, así que no apareces en ninguna búsqueda del reclutador."
    if documento.formato == "docx":
        if documento.texto_en_cuadros.strip():
            return (
                "Tu texto está dentro de cuadros de texto, y un ATS no lee lo que hay en ellos. "
                f"{final} Copia el contenido al cuerpo del documento, fuera de los cuadros, y "
                "elimina los cuadros."
            )
        return (
            "El documento no contiene texto que el ATS pueda leer: suele ser porque el "
            f"contenido está pegado como imagen. {final} Escribe el CV como texto en Word "
            "o Google Docs."
        )
    return (
        "El archivo no contiene texto seleccionable: es una imagen. Suele pasar cuando el CV "
        f"se imprimió y se escaneó, o se exportó como imagen. {final} Exporta el CV "
        "directamente desde Word o Google Docs, sin pasar por el escáner."
    )


def analizar(documento: DocumentoExtraido, hoy: date | None = None) -> Analisis:
    """Aplica las verificaciones de parseabilidad sobre un documento extraído.

    `hoy` fija hasta cuándo llega un periodo abierto ("– Actualidad"); por
    defecto, la fecha actual.
    """
    analisis = Analisis()

    # Sin capa de texto no hay nada más que verificar: el resto de las reglas
    # mediría un texto vacío y produciría una lista de debilidades falsas que
    # ahogaría la única que importa.
    if not documento.tiene_capa_de_texto:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="sin_capa_de_texto",
                severidad="critica",
                titulo="El ATS no puede leer nada de tu CV",
                accion="Genera tu CV como texto, no como imagen",
                detalle=_detalle_sin_capa_de_texto(documento),
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
        encabezado=encabezado_del_cv(texto),
        experiencia=fechas.experiencia(texto, hoy),
        nombre=detectar_nombre(texto),
    )

    for verificar in _VERIFICACIONES:
        verificar(contexto, analisis)

    _marcar_incompletos(analisis)
    return analisis


#: Hallazgo → (campos que deja incompletos si se detectaron, por qué). Solo
#: hallazgos que ya existen: ninguna detección nueva decide un estado. No está
#: `habilidades_en_graficos`: solo se emite con las habilidades sin detectar.
_INCOMPLETOS_POR_HALLAZGO: dict[str, tuple[tuple[str, ...], str]] = {
    "formatos_de_fecha_mezclados": (("Experiencia",), "las fechas mezclan formatos y el ATS puede no ordenarlas"),
    "dos_columnas": (
        ("Experiencia", "Educación", "Habilidades"),
        "a dos columnas el ATS puede leer esta sección desordenada",
    ),
}


def _marcar_incompletos(analisis: Analisis) -> None:
    """Marca incompletos los campos detectados que un hallazgo ya medido daña."""
    notas: dict[str, str] = {}
    for hallazgo in analisis.debilidades:
        afectados, nota = _INCOMPLETOS_POR_HALLAZGO.get(hallazgo.codigo, ((), ""))
        for nombre in afectados:
            notas.setdefault(nombre, nota)
    analisis.campos = [
        replace(campo, incompleto=True, nota=notas[campo.nombre])
        if campo.detectado and campo.nombre in notas
        else campo
        for campo in analisis.campos
    ]


#: Los datos sin los que el reclutador no puede encontrarte ni contactarte: el
#: contacto, la experiencia y las habilidades. Copia en `hallazgos.ts::CAMPOS_CLAVE`.
CAMPOS_CLAVE = ("Nombre", "Correo", "Teléfono", "Experiencia", "Habilidades")


def _dato(campo, nombre: str, defecto=None):
    return campo.get(nombre, defecto) if isinstance(campo, dict) else getattr(campo, nombre, defecto)


def estado_del_cv(campos) -> str:
    """El estado del CV, derivado de sus campos (objetos `Campo` o el JSON guardado).

    - `perdidas_importantes`: falta algún dato clave.
    - `legible_con_perdidas`: están los clave, pero algún dato quedó incompleto
      o falta uno que no es clave.
    - `legible`: los datos se extrajeron completos.

    Es la misma regla que `hallazgos.ts::veredictoDeLegibilidad`. Un campo
    guardado con reglas anteriores no trae `incompleto` y cuenta como completo.
    """
    if any(_dato(c, "nombre") in CAMPOS_CLAVE and not _dato(c, "detectado") for c in campos):
        return "perdidas_importantes"
    if any(not _dato(c, "detectado") or _dato(c, "incompleto", False) for c in campos):
        return "legible_con_perdidas"
    return "legible"


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

    # (código, texto, zona, severidad, dónde quitar el dato, acción si no hay datos de contacto)
    zonas = (
        (
            "texto_en_cuadros",
            documento.texto_en_cuadros,
            "un cuadro de texto",
            "alta",
            "del cuadro de texto",
            "Pasa el texto de los cuadros al cuerpo del CV",
        ),
        (
            "texto_en_encabezado",
            documento.texto_en_encabezado,
            "el encabezado o pie de página",
            "media",
            "del encabezado",
            "Pasa el encabezado y el pie al cuerpo del CV",
        ),
    )

    for codigo, texto_de_la_zona, zona, severidad, de_la_zona, accion in zonas:
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
                    accion=f"Saca tu {datos} {de_la_zona}",
                    ejemplo=EJEMPLO_DE_CONTACTO,
                    detalle=(
                        f"Muchos ATS no leen {zona}, así que para el reclutador tu "
                        f"{datos} no existe aunque tú lo veas en el documento. Escríbelo "
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
                    accion=accion,
                    detalle=(
                        f"Muchos ATS no leen {zona}: lo que pongas ahí puede no llegar "
                        "a la búsqueda del reclutador. Escríbelo en el cuerpo del "
                        f"documento como texto normal. Lo que hay ahí: «{_extracto(texto_de_la_zona)}»."
                    ),
                )
            )


def _nota_de_contacto(contexto: _Contexto, campo: str, sin_dato: str) -> str:
    if zona := contexto.contacto_oculto.get(campo):
        return f"está en {zona}, que el ATS no lee"
    return sin_dato


def _verificar_contacto(contexto: _Contexto, analisis: Analisis) -> None:
    texto = contexto.texto

    nombre = contexto.nombre
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
                accion="Escribe tu correo como texto",
                ejemplo="ana.quispe@gmail.com",
                detalle=(
                    "Es el dato con el que el reclutador te contacta. Si está dentro de "
                    "una imagen o de un ícono, el ATS no lo lee y tu ficha queda sin "
                    "correo. Escríbelo como texto normal debajo de tu nombre."
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
                accion="Agrega tu número de teléfono",
                ejemplo="+591 70000000",
                detalle=(
                    "No todos los procesos lo exigen, pero muchos formularios de "
                    "postulación lo llenan solos desde el CV y lo dejan vacío si no lo "
                    "encuentran. Escríbelo junto a tu correo, con el código de país."
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
    lugares = ubicaciones.del_encabezado(contexto.encabezado, contexto.nombre)

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
                accion="Escribe tu ciudad y país",
                ejemplo="Cochabamba, Bolivia",
                detalle=(
                    "Los reclutadores filtran candidatos por ubicación antes de leer "
                    "nada más, y un CV sin ciudad queda fuera de ese filtro. Escribe tu "
                    "ciudad y país junto a tus datos de contacto. Si buscas trabajo "
                    "remoto, dilo también."
                ),
            )
        )


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
                accion="Usa títulos de sección convencionales",
                ejemplo=EJEMPLO_DE_SECCIONES,
                detalle=(
                    "El ATS decide dónde guardar cada parte de tu CV leyendo el título "
                    "que la encabeza. Con títulos creativos como «Mi trayectoria» o "
                    "«Toolkit» no sabe en qué campo ponerla, y lo que escribiste puede "
                    "no guardarse en ninguno. Usa los títulos de siempre, uno por "
                    "línea."
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
                accion="Pon fecha de inicio y fin a cada empleo",
                ejemplo=EJEMPLO_DE_PERIODO,
                detalle=(
                    "No se encontró ningún periodo con fecha de inicio y fin. Los "
                    "reclutadores filtran por años de experiencia, y si el ATS no puede "
                    "calcular los tuyos quedas por debajo de candidatos con menos "
                    "trayectoria pero fechas claras. Escribe en cada empleo el mes y "
                    "el año de inicio y de fin, o «Actualidad» si sigues ahí."
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
                accion="Usa un solo formato de fecha",
                ejemplo=EJEMPLO_DE_FECHAS,
                detalle=(
                    f"Se detectaron {len(presentes)} formatos distintos en el mismo "
                    "documento. El ATS no puede sumar periodos escritos de formas "
                    "distintas, así que calcula menos experiencia de la que tienes. "
                    "Escríbelas todas como «Mes Año», que es el formato que los ATS "
                    "leen mejor."
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
    if documento.formato == "pdf" and documento.palabras and hay_dos_columnas(documento.palabras):
        analisis.hallazgos.append(
            Hallazgo(
                codigo="dos_columnas",
                severidad="alta",
                titulo="Tu CV está maquetado a dos columnas",
                accion="Pásalo a una sola columna",
                ejemplo=EJEMPLO_DE_UNA_COLUMNA,
                detalle=(
                    "El ATS lee cada línea de izquierda a derecha, sin saber que hay dos "
                    "columnas, y mezcla una con la otra: un puesto queda separado de su "
                    "fecha y una habilidad termina dentro de otro empleo. Usa una sola "
                    "columna: tus datos arriba y debajo cada sección, una tras otra."
                ),
            )
        )

    if documento.tablas:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="contiene_tablas",
                severidad="media",
                titulo=f"Se detectaron {documento.tablas} tabla{'s' if documento.tablas != 1 else ''}",
                accion="Cambia las tablas por texto",
                ejemplo=EJEMPLO_SIN_TABLAS,
                detalle=(
                    "El ATS sí lee el texto de una tabla, pero no siempre en el orden de "
                    "las celdas: una fecha puede quedar pegada al puesto equivocado. Si "
                    "usaste una tabla para alinear habilidades o fechas, escríbelas "
                    "como texto normal, una línea por dato."
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
                accion="Escribe tus habilidades como texto",
                ejemplo=EJEMPLO_DE_HABILIDADES,
                detalle=(
                    f"El documento tiene {documento.imagenes} "
                    f"imagen{'es' if documento.imagenes != 1 else ''} y no se detectó una "
                    "sección de habilidades legible. En una barra de nivel o un círculo "
                    "el ATS no ve el nombre ni el nivel de la habilidad: crees haber "
                    "puesto tus tecnologías y para el reclutador no existe ninguna. "
                    "Escríbelas como una lista de texto; si quieres mostrar el nivel, "
                    "escríbelo entre paréntesis."
                ),
            )
        )
    elif documento.imagenes:
        analisis.hallazgos.append(
            Hallazgo(
                codigo="contiene_imagenes",
                severidad="media",
                titulo=f"El documento tiene {documento.imagenes} imagen{'es' if documento.imagenes != 1 else ''}",
                accion="Revisa que tus imágenes no tengan información",
                detalle=(
                    "El ATS no lee el texto que hay dentro de una imagen, como un logo o "
                    "un ícono con tu teléfono. No es grave si son decorativas, pero si "
                    "una imagen tiene un dato que no está en el texto, escríbelo también "
                    "como texto."
                ),
            )
        )


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
            accion="Elimina el texto que no se ve",
            detalle=(
                f"Se encontraron {ocultos} caracteres en blanco o en un tamaño menor a "
                "4 puntos. El ATS los lee igual y muchos le muestran al reclutador el "
                "texto que extrajeron: palabras clave escondidas se ven como un intento "
                "de engañar al filtro y suelen descartar la postulación. Si no lo "
                "pusiste a propósito, bórralo."
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
            accion="Escribe cada sigla también con su nombre",
            ejemplo=EJEMPLO_DE_SIGLA,
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
                accion=f"Resúmelo en {MAXIMO_PAGINAS_RECOMENDADO} página{'s' if MAXIMO_PAGINAS_RECOMENDADO != 1 else ''}",
                detalle=(
                    f"El ATS lo lee entero, pero para un perfil de egresado "
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

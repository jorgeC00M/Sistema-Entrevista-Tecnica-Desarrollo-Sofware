"""Dónde evidencia el currículum cada requisito que la convocatoria pide.

No es una lista de presente/ausente, y esa es la decisión que define el módulo.
Por cada requisito hay tres respuestas posibles:

- **demostrado**: aparece en la experiencia o en los proyectos.
- **declarado**: aparece solo en la lista de habilidades.
- **ausente**: no aparece.

El motivo: "Django" en una lista separada por comas y "Django" dentro de un logro
indexan igual para la máquina y valen muy distinto para la persona que lee. Un
reclutador hace esa diferencia; el candidato promedio no sabe que existe. Decírselo
es lo que ninguna comparación binaria da.

Además de las tecnologías se comparan los requisitos del puesto: los años de
experiencia —contra lo que el ATS calcula de las fechas—, el cargo y las
preguntas de filtro de `filtros.py` (título, idioma, ubicación).

Como el resto de la capa, aquí no hay IA: todo sale de buscar términos literales en
bloques de texto delimitados.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from integrations.documentos import fechas, idioma
from integrations.documentos.convocatoria import partir
from integrations.documentos.extractor import DocumentoExtraido
from integrations.documentos.filtros import Filtro, preguntas_de_filtro
from integrations.documentos.secciones import SECCIONES_DE_EVIDENCIA, segmentar
from integrations.documentos.terminos import encontrar, menciona_cargo

#: Estados de un requisito, del más fuerte al más débil.
DEMOSTRADO = "demostrado"
DECLARADO = "declarado"
AUSENTE = "ausente"
#: Cuando no se pudo segmentar el CV: se sabe que está, no dónde.
PRESENTE = "presente"

#: Estados del requisito de experiencia.
CUMPLE = "cumple"
NO_ALCANZA = "no_alcanza"
NO_CALCULABLE = "no_calculable"


@dataclass(frozen=True)
class Requisito:
    termino: str
    estado: str

    @property
    def cubierto(self) -> bool:
        """`declarado` cuenta como cubierto: la tecnología está en el CV.

        Lo que el estado matiza es la **fuerza** de la evidencia, no su
        existencia. Tratar `declarado` como no cubierto sería injusto con quien sí
        la domina y solo la redactó mal.
        """
        return self.estado != AUSENTE


@dataclass(frozen=True)
class Grupo:
    """Un bloque de requisitos con su cobertura.

    `cubiertos` y `cobertura` son campos y no propiedades para que
    `dataclasses.asdict` los incluya: así la brecha se serializa entera sin que
    nadie tenga que acordarse de copiarlos a mano.
    """

    requisitos: tuple[Requisito, ...]
    cubiertos: int
    #: En texto ("4/6") y no en porcentaje, por lo mismo que `parseabilidad`. Un
    #: número sobre 100 se leería como una probabilidad de ser contratado, que es
    #: justo lo que este módulo no calcula.
    cobertura: str

    @classmethod
    def de(cls, requisitos: tuple[Requisito, ...]) -> Grupo:
        cubiertos = sum(1 for requisito in requisitos if requisito.cubierto)
        return cls(requisitos=requisitos, cubiertos=cubiertos, cobertura=f"{cubiertos}/{len(requisitos)}")


@dataclass(frozen=True)
class RequisitoDeExperiencia:
    """Los años que pide la convocatoria frente a los que el ATS calcula.

    Es la versión medible de la pregunta de filtro "¿tienes N años de
    experiencia?", el único rechazo automático real de un ATS.
    """

    requeridos: int
    #: `None` cuando el CV no tiene periodos legibles; no es lo mismo que cero.
    calculados_meses: int | None
    #: Para mostrar: "2 años y 4 meses", con "(aprox.)" si hay fechas solo de año.
    calculados: str
    estado: str
    #: Si el cálculo puede quedarse corto por fechas mezcladas o solo con año. No
    #: se le dice al usuario que cambie su experiencia: se le dice que el ATS
    #: puede estar contando menos de la que tiene.
    posible_subestimacion: bool


@dataclass(frozen=True)
class Brecha:
    obligatorios: Grupo
    deseables: Grupo
    #: Lo que el CV evidencia y la convocatoria no pidió. No cuenta ni a favor ni
    #: en contra: informa de qué ocupa espacio sin aportar a *esta* postulación.
    extras: tuple[str, ...]
    #: Si la convocatoria separaba obligatorios de deseables. Cuando es falso, el
    #: grupo de deseables está vacío porque el texto no los distinguía, no porque
    #: no los tuviera.
    separada: bool
    #: Si se pudo precisar *dónde* está cada término. Cuando es falso los estados
    #: son `presente`/`ausente` y hay que decirle al usuario por qué se perdió el
    #: detalle.
    con_evidencia: bool
    #: `None` si la convocatoria no pide años de experiencia.
    experiencia: RequisitoDeExperiencia | None = None
    #: `None` si la convocatoria no nombra un cargo reconocible.
    cargo: Requisito | None = None
    #: Si el CV y la convocatoria están, con claridad, en idiomas distintos.
    idioma_distinto: bool = False
    #: Las preguntas de filtro del bloque obligatorio (título, idioma,
    #: ubicación). Como la experiencia, no cuentan en la cobertura.
    filtros: tuple[Filtro, ...] = ()


def calcular(texto_convocatoria: str, cv: DocumentoExtraido, hoy: date | None = None) -> Brecha | None:
    """Compara una convocatoria con un currículum.

    Recibe el documento y no su texto a propósito: `tiene_capa_de_texto` es el
    único sitio donde vive el umbral de "esto es legible", y replicarlo aquí
    acabaría con los dos criterios divergiendo. Es la misma firma que
    `ats.analizar()`, por la misma razón.

    Devuelve `None` cuando no hay nada que comparar: un CV ilegible, o una
    convocatoria que no menciona ningún requisito reconocible. En los dos casos
    una brecha vacía sería una afirmación falsa — "no cumples ninguno de los 4
    requisitos" cuando la verdad es que nadie puede leer el documento— y quien
    llama debe informar la causa real en su lugar.

    Un PDF escaneado trae algún artefacto suelto, así que comprobar que el texto
    no esté vacío no basta: era el fallo que este cambio corrigió.

    `hoy` fija hasta dónde llega un periodo abierto; por defecto, la fecha actual.
    """
    if not cv.tiene_capa_de_texto:
        return None

    texto_cv = cv.texto

    convocatoria = partir(texto_convocatoria)
    if not convocatoria.tiene_requisitos:
        return None

    bloques = segmentar(texto_cv)
    # Sin títulos reconocidos no hay bloques, así que no se puede decir dónde está
    # cada término. Se degrada a presente/ausente y se deja constancia: encadena
    # con `secciones_no_reconocidas`, que `ats.py` ya reporta. Una debilidad de
    # formato degrada el análisis de contenido, y decirlo es más honesto que
    # mostrar un mapa a medias sin explicación.
    con_evidencia = bool(bloques)
    texto_de_evidencia = "\n".join(bloques.get(seccion, "") for seccion in SECCIONES_DE_EVIDENCIA)

    if con_evidencia:
        en_evidencia = encontrar(texto_de_evidencia)
        en_habilidades = encontrar(bloques.get("habilidades", ""))
    else:
        en_evidencia = set()
        en_habilidades = set()
    # El CV completo y no solo los bloques: un término puede estar en una sección
    # que no se reconoció, y seguiría estando en el CV.
    en_todo = encontrar(texto_cv)

    def estado_de(termino: str) -> str:
        if not con_evidencia:
            return PRESENTE if termino in en_todo else AUSENTE
        if termino in en_evidencia:
            return DEMOSTRADO
        if termino in en_habilidades:
            return DECLARADO
        # Está en el CV pero fuera de las secciones conocidas: no es demostrado,
        # y llamarlo declarado sería inexacto porque no está en habilidades.
        return PRESENTE if termino in en_todo else AUSENTE

    def grupo_de(terminos: frozenset[str]) -> Grupo:
        # Orden alfabético para que el resultado sea estable entre análisis: los
        # conjuntos no lo garantizan y el usuario vería las filas saltando de
        # sitio al reanalizar el mismo CV.
        return Grupo.de(
            tuple(Requisito(termino=termino, estado=estado_de(termino)) for termino in sorted(terminos))
        )

    pedidos = convocatoria.obligatorios | convocatoria.deseables
    return Brecha(
        obligatorios=grupo_de(convocatoria.obligatorios),
        deseables=grupo_de(convocatoria.deseables),
        extras=tuple(sorted(en_todo - pedidos)),
        separada=convocatoria.separada,
        con_evidencia=con_evidencia,
        experiencia=_experiencia(convocatoria.anos_requeridos, texto_cv, hoy or date.today()),
        cargo=_cargo(convocatoria.cargo, texto_cv, texto_de_evidencia, con_evidencia),
        idioma_distinto=idioma.son_distintos(texto_cv, texto_convocatoria),
        filtros=preguntas_de_filtro(convocatoria.texto_obligatorio, texto_cv),
    )


def _experiencia(requeridos: int | None, texto_cv: str, hoy: date) -> RequisitoDeExperiencia | None:
    if requeridos is None:
        return None

    calculada = fechas.experiencia(texto_cv, hoy)
    if calculada.meses is None:
        estado = NO_CALCULABLE
    elif calculada.meses >= requeridos * 12:
        estado = CUMPLE
    else:
        estado = NO_ALCANZA

    return RequisitoDeExperiencia(
        requeridos=requeridos,
        calculados_meses=calculada.meses,
        calculados=calculada.descripcion,
        estado=estado,
        posible_subestimacion=calculada.aproximado or len(fechas.formatos_presentes(texto_cv)) > 1,
    )


def _cargo(cargo: str | None, texto_cv: str, texto_de_evidencia: str, con_evidencia: bool) -> Requisito | None:
    """El cargo, con los mismos estados que una tecnología.

    `demostrado` si aparece en la experiencia o los proyectos —se ejerció—;
    `declarado` si aparece en otro sitio, típicamente como titular bajo el nombre.
    """
    if cargo is None:
        return None
    if not menciona_cargo(texto_cv, cargo):
        estado = AUSENTE
    elif not con_evidencia:
        estado = PRESENTE
    elif menciona_cargo(texto_de_evidencia, cargo):
        estado = DEMOSTRADO
    else:
        estado = DECLARADO
    return Requisito(termino=cargo, estado=estado)

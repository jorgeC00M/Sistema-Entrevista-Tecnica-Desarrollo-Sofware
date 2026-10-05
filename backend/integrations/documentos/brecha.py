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

Como el resto de la capa, aquí no hay IA: todo sale de buscar términos literales en
bloques de texto delimitados.
"""

from __future__ import annotations

from dataclasses import dataclass

from integrations.documentos.convocatoria import partir
from integrations.documentos.extractor import DocumentoExtraido
from integrations.documentos.secciones import SECCIONES_DE_EVIDENCIA, segmentar
from integrations.documentos.terminos import encontrar

#: Estados de un requisito, del más fuerte al más débil.
DEMOSTRADO = "demostrado"
DECLARADO = "declarado"
AUSENTE = "ausente"
#: Cuando no se pudo segmentar el CV: se sabe que está, no dónde.
PRESENTE = "presente"


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
    """Un bloque de requisitos con su cobertura."""

    requisitos: tuple[Requisito, ...]

    @property
    def cubiertos(self) -> int:
        return sum(1 for requisito in self.requisitos if requisito.cubierto)

    @property
    def cobertura(self) -> str:
        """En texto ("4/6") y no en porcentaje, por lo mismo que `parseabilidad`.

        Un número sobre 100 se leería como una probabilidad de ser contratado, que
        es justo lo que este módulo no calcula.
        """
        return f"{self.cubiertos}/{len(self.requisitos)}"


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


def calcular(texto_convocatoria: str, cv: DocumentoExtraido) -> Brecha | None:
    """Compara una convocatoria con un currículum.

    Recibe el documento y no su texto a propósito: `tiene_capa_de_texto` es el
    único sitio donde vive el umbral de "esto es legible", y replicarlo aquí
    acabaría con los dos criterios divergiendo. Es la misma firma que
    `ats.analizar()`, por la misma razón.

    Devuelve `None` cuando no hay nada que comparar: un CV ilegible, o una
    convocatoria que no menciona ningún término reconocible. En los dos casos una
    brecha vacía sería una afirmación falsa — "no cumples ninguno de los 4
    requisitos" cuando la verdad es que nadie puede leer el documento— y quien
    llama debe informar la causa real en su lugar.

    Un PDF escaneado trae algún artefacto suelto, así que comprobar que el texto
    no esté vacío no basta: era el fallo que este cambio corrigió.
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

    if con_evidencia:
        en_evidencia = encontrar(
            "\n".join(bloques.get(seccion, "") for seccion in SECCIONES_DE_EVIDENCIA)
        )
        en_habilidades = encontrar(bloques.get("habilidades", ""))
        # El CV completo y no solo los bloques: un término puede estar en una
        # sección que no se reconoció, y seguiría estando en el CV.
        en_todo = encontrar(texto_cv)
    else:
        en_evidencia = set()
        en_habilidades = set()
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
        return Grupo(
            requisitos=tuple(
                Requisito(termino=termino, estado=estado_de(termino))
                for termino in sorted(terminos)
            )
        )

    pedidos = convocatoria.obligatorios | convocatoria.deseables
    return Brecha(
        obligatorios=grupo_de(convocatoria.obligatorios),
        deseables=grupo_de(convocatoria.deseables),
        extras=tuple(sorted(en_todo - pedidos)),
        separada=convocatoria.separada,
        con_evidencia=con_evidencia,
    )

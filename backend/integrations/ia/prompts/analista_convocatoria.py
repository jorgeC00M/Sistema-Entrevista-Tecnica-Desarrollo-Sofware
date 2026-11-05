"""Prompt del analista de convocatorias: ubica un aviso de trabajo en el catálogo.

La regla es la del módulo de CV: el código decide qué es posible, la IA propone.
El código ya extrajo del aviso las tecnologías reconocidas, los años y el cargo
(`integrations/documentos/convocatoria.py`), y conoce el catálogo; la IA elige
puesto, tecnologías y nivel **entre esas opciones** y resume los requisitos.

**El parser descarta lo que no está anclado.** Un puesto fuera del catálogo deja
el perfil como no identificado —no se inventa uno por defecto—; una tecnología
que no es del puesto se descarta, no se reemplaza, y queda a lo sumo una por
capa (en Full Stack, una de frontend y una de backend); un requisito que no
aparece en el aviso ni entre los términos reconocidos se ignora. El prompt pide lo
mismo, pero un prompt no es una garantía.

Esta capa no conoce la base de datos: las opciones del catálogo llegan en la
entrada, y el aviso llega ya enmascarado (sin correos, teléfonos ni enlaces).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..exceptions import RespuestaIAInvalida
from .guardas import comparable
from .marcadores import MARCADOR, SIN_PUESTO

MAXIMO_REQUISITOS = 8
MAXIMO_FUERA_DE_ALCANCE = 5


@dataclass(frozen=True)
class OpcionDeTecnologia:
    codigo: str
    nombre: str
    #: "frontend" o "backend" en un puesto que se practica con una por capa;
    #: vacía en los demás.
    capa: str = ""


@dataclass(frozen=True)
class OpcionDePuesto:
    codigo: str
    nombre: str
    tecnologias: tuple[OpcionDeTecnologia, ...]


@dataclass(frozen=True)
class OpcionDeNivel:
    codigo: str
    nombre: str
    #: "Inicial", "Intermedio", "Avanzado".
    grado: str


@dataclass(frozen=True)
class EntradaDeConvocatoria:
    """Lo único que viaja al proveedor."""

    #: El aviso, ya enmascarado.
    texto: str
    #: Tecnologías y prácticas que el código reconoció en el aviso (canónicas).
    terminos: tuple[str, ...]
    anos_requeridos: int | None
    cargo: str | None
    #: El catálogo activo: lo único que el modelo puede elegir.
    puestos: tuple[OpcionDePuesto, ...]
    #: En orden de exigencia; el primero es el que se supone si el modelo falla.
    niveles: tuple[OpcionDeNivel, ...]


@dataclass(frozen=True)
class PerfilDetectado:
    identificado: bool
    puesto: str | None = None
    #: Códigos del puesto, a lo sumo uno por capa: uno, o dos en Full Stack.
    tecnologias: tuple[str, ...] = ()
    nivel: str | None = None
    #: El modelo no devolvió un nivel válido y se tomó el primero (el inicial).
    nivel_supuesto: bool = False
    requisitos: tuple[str, ...] = ()
    #: Lo que el aviso pide y el simulador no evalúa (nube, orquestadores…).
    fuera_de_alcance: tuple[str, ...] = ()

    def como_dict(self) -> dict[str, Any]:
        return {
            "identificado": self.identificado,
            "puesto": self.puesto,
            "tecnologias": list(self.tecnologias),
            "nivel": self.nivel,
            "nivel_supuesto": self.nivel_supuesto,
            "requisitos": list(self.requisitos),
            "fuera_de_alcance": list(self.fuera_de_alcance),
        }


NO_IDENTIFICADO = PerfilDetectado(identificado=False)


def sistema(entrada: EntradaDeConvocatoria) -> str:
    puestos = "\n".join(
        f"- {p.codigo} ({p.nombre}); tecnologías: "
        + ", ".join(f"{t.codigo} = {t.nombre}" + (f" [{t.capa}]" if t.capa else "") for t in p.tecnologias)
        for p in entrada.puestos
    )
    niveles = "\n".join(f"- {n.codigo} ({n.nombre}, nivel {n.grado.lower()})" for n in entrada.niveles)
    return f"""\
Eres un analista que lee convocatorias de trabajo de desarrollo de software y las \
ubica en el catálogo de un simulador de entrevistas técnicas.

Puestos posibles (código, nombre y sus tecnologías):
{puestos}

Niveles posibles:
{niveles}

Reglas:
- puesto: el código del puesto que mejor describe el aviso; "{SIN_PUESTO}" si el aviso \
no es de desarrollo de software o no se puede saber.
- tecnologias: los códigos de las tecnologías **de ese puesto** que el aviso pida, a lo sumo \
una por capa: si el puesto marca [frontend] y [backend], una de cada una; si no, una sola. \
Lista vacía si no pide ninguna de la lista.
- nivel: el código del nivel según la experiencia o el rango que pida el aviso.
- requisitos: hasta {MAXIMO_REQUISITOS} conocimientos técnicos concretos que el aviso pide \
(p. ej. "APIs REST", "PostgreSQL"), con las palabras del aviso. No agregues lo que no dice.
- fuera_de_alcance: hasta {MAXIMO_FUERA_DE_ALCANCE} requisitos que una entrevista técnica \
simulada no puede evaluar (servicios de nube, certificaciones, idiomas, herramientas \
corporativas), con las palabras del aviso.
- Responde solo con el objeto json pedido."""


def usuario(entrada: EntradaDeConvocatoria) -> str:
    pistas = [f"Términos técnicos reconocidos: {', '.join(entrada.terminos) or 'ninguno'}"]
    if entrada.anos_requeridos is not None:
        pistas.append(f"Años de experiencia que pide: {entrada.anos_requeridos}")
    if entrada.cargo:
        pistas.append(f"Cargo que nombra: {entrada.cargo}")
    return "Convocatoria:\n" + entrada.texto + "\n\n" + "\n".join(pistas) + "\n\nUbica esta convocatoria en el catálogo."


def esquema(entrada: EntradaDeConvocatoria) -> dict[str, Any]:
    return {
        "type": "object",
        "properties": {
            "puesto": {"type": "string", "enum": [*(p.codigo for p in entrada.puestos), SIN_PUESTO]},
            "tecnologias": {"type": "array", "items": {"type": "string"}},
            "nivel": {"type": "string", "enum": [n.codigo for n in entrada.niveles]},
            "requisitos": {"type": "array", "items": {"type": "string"}, "maxItems": MAXIMO_REQUISITOS},
            "fuera_de_alcance": {
                "type": "array",
                "items": {"type": "string"},
                "maxItems": MAXIMO_FUERA_DE_ALCANCE,
            },
        },
        "required": ["puesto", "tecnologias", "nivel", "requisitos", "fuera_de_alcance"],
        "additionalProperties": False,
    }


def _textos(datos: dict[str, Any], clave: str) -> list[str]:
    lista = datos.get(clave)
    if not isinstance(lista, list):
        raise RespuestaIAInvalida(f"Campo '{clave}' ausente o no es una lista en el análisis de la convocatoria")
    return [item.strip() for item in lista if isinstance(item, str) and item.strip()]


def _anclados(candidatos: list[str], entrada: EntradaDeConvocatoria, maximo: int) -> tuple[str, ...]:
    """Los que aparecen en el aviso o entre los términos reconocidos, sin repetir."""
    aviso = comparable(entrada.texto)
    reconocidos = {comparable(t): t for t in entrada.terminos}
    vistos: set[str] = set()
    resultado: list[str] = []
    for candidato in candidatos:
        clave = comparable(candidato)
        if MARCADOR.search(candidato) or clave in vistos or not (clave in aviso or clave in reconocidos):
            continue
        vistos.add(clave)
        # Si es un término reconocido, se muestra con su nombre canónico.
        resultado.append(reconocidos.get(clave, candidato))
        if len(resultado) == maximo:
            break
    return tuple(resultado)


def _tecnologias_del_puesto(pedidas: Any, puesto: OpcionDePuesto) -> tuple[str, ...]:
    """Las pedidas que son del puesto, en el orden del modelo, una por capa.

    Con capas (Full Stack) quedan hasta dos, una de frontend y una de backend;
    sin capas, todas comparten la capa vacía y queda una. Una ajena se
    descarta, no se reemplaza."""
    if not isinstance(pedidas, list):
        return ()
    del_puesto = {t.codigo: t for t in puesto.tecnologias}
    elegidas: dict[str, str] = {}
    for codigo in (str(c).strip() for c in pedidas):
        tecnologia = del_puesto.get(codigo)
        if tecnologia is not None and tecnologia.capa not in elegidas:
            elegidas[tecnologia.capa] = codigo
    return tuple(elegidas.values())


def parsear_perfil(datos: dict[str, Any], entrada: EntradaDeConvocatoria) -> PerfilDetectado:
    """Valida la forma y ancla cada valor al catálogo o al aviso.

    Solo una forma rota es un error. Valores sueltos fuera de lo posible se
    descartan: un puesto imposible deja el perfil sin identificar, una tecnología
    ajena se quita y un nivel inválido se supone inicial.
    """
    if not isinstance(datos, dict):
        raise RespuestaIAInvalida(f"Se esperaba un objeto JSON, se recibió {type(datos).__name__}")

    puestos = {p.codigo: p for p in entrada.puestos}
    puesto = puestos.get(str(datos.get("puesto", "")).strip())
    if puesto is None:
        return NO_IDENTIFICADO

    niveles = [n.codigo for n in entrada.niveles]
    nivel = str(datos.get("nivel", "")).strip()
    nivel_supuesto = nivel not in niveles
    if nivel_supuesto:
        nivel = niveles[0] if niveles else None

    return PerfilDetectado(
        identificado=True,
        puesto=puesto.codigo,
        tecnologias=_tecnologias_del_puesto(datos.get("tecnologias"), puesto),
        nivel=nivel,
        nivel_supuesto=nivel_supuesto,
        requisitos=_anclados(_textos(datos, "requisitos"), entrada, MAXIMO_REQUISITOS),
        fuera_de_alcance=_anclados(_textos(datos, "fuera_de_alcance"), entrada, MAXIMO_FUERA_DE_ALCANCE),
    )

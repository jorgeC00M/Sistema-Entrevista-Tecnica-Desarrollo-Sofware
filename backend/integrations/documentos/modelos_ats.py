"""Lo que produce el análisis ATS: hallazgos, campos de la ficha y el resultado.

Separado de `ats.py`, que tiene las reglas: estos tipos los leen también la
brecha, los serializers y los tests. `ats.py` los reexporta, así que importarlos
desde ahí sigue funcionando.
"""

from __future__ import annotations

from dataclasses import dataclass, field

# Severidades, de mayor a menor. `critica` es "el ATS no te ve"; `alta` es "pierde
# parte de tu información"; `media` es "puede revolverla"; `info` no es un
# problema, solo contexto.
SEVERIDADES = ("critica", "alta", "media", "info")


@dataclass(frozen=True)
class Hallazgo:
    """Una observación sobre el documento.

    `favorable` separa las fortalezas de las debilidades. Se reportan las dos:
    decirle al usuario solo lo que está mal no le dice qué conservar al corregir.

    En una debilidad, `accion` es lo que hay que hacer, en imperativo («Pásalo a
    una sola columna»), y es el título que ve el usuario; `titulo` queda como el
    diagnóstico («Tu CV está maquetado a dos columnas») y `detalle` explica qué le
    pasa al CV dentro del ATS y cómo arreglarlo. Las fortalezas no llevan acción.

    `ejemplo` muestra cómo debe quedar, en texto fijo con datos inventados —nunca
    copiado del CV— y que pasa las propias reglas del módulo (`EjemploTest`).
    Vacío donde un ejemplo no ayuda, y siempre en las fortalezas.
    """

    codigo: str
    severidad: str
    titulo: str
    detalle: str
    favorable: bool = False
    accion: str = ""
    ejemplo: str = ""


@dataclass(frozen=True)
class Campo:
    """Un campo de la ficha que el ATS armaría, y si se pudo llenar.

    `incompleto` marca un campo que sí se llenó pero que un hallazgo ya medido
    dice que llega dañado (fechas mezcladas, dos columnas); su `nota` dice por
    qué. Nunca es verdadero en un campo sin detectar.
    """

    nombre: str
    detectado: bool
    valor: str = ""
    nota: str = ""
    incompleto: bool = False


@dataclass
class Analisis:
    """El resultado completo: la ficha que vería el ATS más lo que la rompió."""

    campos: list[Campo] = field(default_factory=list)
    hallazgos: list[Hallazgo] = field(default_factory=list)

    @property
    def campos_detectados(self) -> int:
        return sum(1 for campo in self.campos if campo.detectado)

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

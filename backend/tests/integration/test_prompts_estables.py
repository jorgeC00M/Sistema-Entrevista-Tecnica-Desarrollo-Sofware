"""El texto exacto que reciben los proveedores no cambia por un refactor.

Los demás tests de prompts comprueban que el texto *contiene* ciertas piezas;
este compara el prompt completo, carácter a carácter, contra una copia
guardada en `tests/fixtures/prompts/`. Un espacio de más, una línea reordenada
o una frase perdida al mover código de sitio lo hacen fallar.

Si un cambio del prompt es intencionado, se regenera la copia con
`python -m tests.integration.test_prompts_estables` y el diff de los `.txt`
muestra exactamente qué leerá el modelo distinto.
"""

import unittest
from pathlib import Path

from integrations.ia.prompts import entrevistador, evaluador
from integrations.ia.prompts.schemas import (
    PREGUNTAS_POR_ENTREVISTA,
    AreaTecnica,
    ContextoDeEntrevista,
    Nivel,
    Puesto,
    TemaEvaluado,
)

COPIAS = Path(__file__).resolve().parent.parent / "fixtures" / "prompts"

UNA_CAPA = ContextoDeEntrevista(puesto=Puesto.BACKEND, nivel=Nivel.JUNIOR, tecnologia="Django")
DOS_CAPAS = ContextoDeEntrevista(
    puesto=Puesto.FULL_STACK,
    nivel=Nivel.SENIOR,
    tecnologia="React + Node.js",
    requisitos=("TypeScript", "PostgreSQL", "Docker"),
)
SIN_TECNOLOGIA = ContextoDeEntrevista(puesto=Puesto.FRONTEND, nivel=Nivel.SEMI_SENIOR)

PREVIAS = [
    TemaEvaluado(pregunta="¿Qué es una transacción?", puntuacion=75),
    TemaEvaluado(pregunta="¿Cómo funciona el ORM de Django?", puntuacion=50),
]


def prompts() -> dict[str, str]:
    """Cada prompt que se envía a un proveedor, con un nombre estable."""
    salida = {}
    for nombre, contexto in (
        ("una_capa", UNA_CAPA),
        ("dos_capas", DOS_CAPAS),
        ("sin_tecnologia", SIN_TECNOLOGIA),
    ):
        areas = [AreaTecnica.PROGRAMACION, AreaTecnica.BASES_DE_DATOS]
        salida[f"calentamiento_sistema_{nombre}"] = entrevistador.sistema_de_calentamiento(
            contexto, areas, PREGUNTAS_POR_ENTREVISTA
        )
        salida[f"calentamiento_usuario_{nombre}"] = entrevistador.usuario_de_calentamiento(areas)
        salida[f"pregunta_sistema_{nombre}"] = entrevistador.sistema(
            contexto, AreaTecnica.BASES_DE_DATOS, 3, PREGUNTAS_POR_ENTREVISTA
        )
        salida[f"pregunta_usuario_{nombre}"] = entrevistador.usuario(3, PREVIAS)
        salida[f"evaluador_sistema_{nombre}"] = evaluador.sistema(
            contexto, AreaTecnica.BASES_DE_DATOS
        )
    salida["evaluador_usuario"] = evaluador.usuario(
        "¿Qué es un índice?", "Una estructura que acelera las búsquedas."
    )
    return salida


class PromptsEstablesTest(unittest.TestCase):
    def test_cada_prompt_coincide_con_su_copia(self):
        for nombre, texto in prompts().items():
            with self.subTest(prompt=nombre):
                copia = (COPIAS / f"{nombre}.txt").read_text(encoding="utf-8")
                self.assertEqual(texto, copia)


if __name__ == "__main__":
    COPIAS.mkdir(parents=True, exist_ok=True)
    for nombre, texto in prompts().items():
        (COPIAS / f"{nombre}.txt").write_text(texto, encoding="utf-8", newline="")
    print(f"{len(prompts())} copias escritas en {COPIAS}")

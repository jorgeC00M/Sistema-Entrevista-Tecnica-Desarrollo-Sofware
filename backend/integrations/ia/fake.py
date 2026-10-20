"""Proveedor determinista para pruebas y desarrollo del flujo sin consumir cuota."""

from __future__ import annotations

from collections.abc import Sequence

from .base import ProveedorIA
from .prompts.analista_convocatoria import (
    NO_IDENTIFICADO,
    EntradaDeConvocatoria,
    PerfilDetectado,
    comparable,
)
from .exceptions import ErrorTransitorio
from .prompts.revisor_cv import (
    EntradaDeRevision,
    PreguntaProbable,
    RevisionDeCV,
    SugerenciaDeRequisito,
    VinetaReescrita,
)
from .prompts.schemas import (
    AreaTecnica,
    ContextoDeEntrevista,
    Evaluacion,
    Pregunta,
    Puesto,
    TemaEvaluado,
    parsear_evaluacion,
    parsear_pregunta,
    parsear_preguntas,
)


class FakeProveedorIA(ProveedorIA):
    """Genera preguntas y evaluaciones fijas, sin red ni cuota.

    `fallar_en` simula una caída del proveedor en una llamada concreta —
    contando generación y evaluación por igual, en el orden en que ocurren —
    para probar reintentos e idempotencia sin depender de un fallo real.
    """

    nombre = "fake"
    modelo = "fake-1"
    # No sale de la máquina: no hay a quién filtrar nada.
    apto_para_datos_personales = True

    def __init__(self, fallar_en: int | None = None):
        self._fallar_en = fallar_en
        self._llamadas = 0

    def _contar_llamada(self) -> None:
        self._llamadas += 1
        if self._fallar_en is not None and self._llamadas == self._fallar_en:
            raise ErrorTransitorio(f"Fallo simulado en la llamada #{self._llamadas}")

    def _texto(
        self, contexto: ContextoDeEntrevista, area: AreaTecnica, numero: int
    ) -> str:
        # El área va en el texto para que los tests puedan comprobar que una
        # entrevista recorrió los temas que el puesto manda, sin pedirle nada a
        # un proveedor real.
        # La tecnología también, para comprobar que llega a cada pregunta.
        tecnologia = f"[{contexto.tecnologia}]" if contexto.tecnologia else ""
        return (
            f"[{contexto.puesto.etiqueta}/{contexto.nivel.etiqueta}]{tecnologia}"
            f"[{area.etiqueta}] Pregunta simulada #{numero}"
        )

    def generar_preguntas_iniciales(
        self, contexto: ContextoDeEntrevista, areas: Sequence[AreaTecnica]
    ) -> list[Pregunta]:
        # Una sola llamada para todas, igual que un proveedor real: es lo que
        # hace que `fallar_en` cuente lo mismo aquí y allá.
        self._contar_llamada()
        return parsear_preguntas(
            {
                "preguntas": [
                    {"pregunta": self._texto(contexto, area, numero)}
                    for numero, area in enumerate(areas, start=1)
                ]
            },
            desde_numero=1,
            cuantas=len(areas),
        )

    def generar_pregunta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        numero: int,
        previas: list[TemaEvaluado],
    ) -> Pregunta:
        self._contar_llamada()
        return parsear_pregunta(
            {"pregunta": self._texto(contexto, area, numero)}, numero=numero
        )

    def evaluar_respuesta(
        self,
        contexto: ContextoDeEntrevista,
        area: AreaTecnica,
        pregunta: str,
        respuesta: str,
    ) -> Evaluacion:
        self._contar_llamada()
        return parsear_evaluacion(
            {
                # 3/3/3 da 75 con la fórmula: la misma nota que daba antes de
                # que el evaluador pasara a niveles, para no mover los tests.
                "niveles": {"correccion": 3, "completitud": 3, "claridad": 3},
                "fortalezas": "Respuesta simulada con estructura adecuada.",
                "debilidades": "Faltan detalles técnicos.",
                "sugerencias": "Profundiza con un ejemplo concreto.",
                "puntos_clave": [
                    "Definir el concepto con precisión.",
                    "Explicar cuándo conviene usarlo y cuándo no.",
                    "Ilustrarlo con un ejemplo concreto.",
                ],
            }
        )

    def revisar_cv(self, entrada: EntradaDeRevision) -> RevisionDeCV:
        """Una revisión fija, anclada a la entrada como lo estaría una real.

        Solo devuelve elementos que el parser de un proveedor real dejaría pasar:
        así la interfaz y los tests ven la misma forma sin gastar cuota.
        """
        self._contar_llamada()
        # La primera línea con contenido, no un título de sección ("Experiencia:").
        primera_linea = next(
            (
                linea.strip()
                for linea in entrada.secciones.splitlines()
                if linea.strip() and not linea.strip().endswith(":")
            ),
            "",
        )
        return RevisionDeCV(
            vinetas=tuple(
                VinetaReescrita(original=vineta, sugerida=f"{vineta}, lo que redujo [cifra] el tiempo de respuesta.")
                for vineta in entrada.vinetas
            ),
            requisitos=tuple(
                SugerenciaDeRequisito(
                    termino=requisito.termino,
                    sugerencia=f"Menciona {requisito.termino} dentro de un logro de tu experiencia o de un proyecto.",
                )
                for requisito in entrada.requisitos
            ),
            preguntas=(
                (PreguntaProbable(pregunta="¿Qué fue lo más difícil de ese trabajo y cómo lo resolviste?", motivo=primera_linea),)
                if primera_linea
                else ()
            ),
            puesto_sugerido=Puesto.BACKEND,
            correcciones=(),
        )

    def analizar_convocatoria(self, entrada: EntradaDeConvocatoria) -> PerfilDetectado:
        """Reglas fijas sobre el aviso, ancladas igual que las de un proveedor real.

        El primer puesto cuyas palabras aparezcan gana (de lo más específico a lo
        más general: "full stack" antes que "backend"); de tecnologías, la
        primera de cada capa que el aviso nombre; "senior" o "semi senior" dan el
        nivel. Sin puesto reconocible, no identificado — igual que la IA.
        """
        self._contar_llamada()
        aviso = comparable(entrada.texto)
        puestos = {p.codigo: p for p in entrada.puestos}

        puesto = next(
            (
                puestos[codigo]
                for codigo, palabras in _PALABRAS_DE_PUESTO
                if codigo in puestos and any(palabra in aviso for palabra in palabras)
            ),
            None,
        )
        if puesto is None:
            return NO_IDENTIFICADO

        por_capa: dict[str, str] = {}
        for t in puesto.tecnologias:
            # "Kotlin (Android)" se busca como "kotlin".
            if t.capa not in por_capa and comparable(t.nombre).split("(")[0].strip() in aviso:
                por_capa[t.capa] = t.codigo
        codigos = [n.codigo for n in entrada.niveles]
        if "semi senior" in aviso.replace("-", " ") and "semi_senior" in codigos:
            nivel = "semi_senior"
        elif "senior" in aviso and "senior" in codigos:
            nivel = "senior"
        else:
            nivel = codigos[0] if codigos else None

        return PerfilDetectado(
            identificado=True,
            puesto=puesto.codigo,
            tecnologias=tuple(por_capa.values()),
            nivel=nivel,
            requisitos=entrada.terminos[:8],
        )


# De lo más específico a lo más general: un aviso de "full stack" también dice
# "backend", y uno de QA puede nombrar Selenium para web.
_PALABRAS_DE_PUESTO: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("full_stack", ("full stack", "fullstack", "full-stack")),
    ("qa", ("qa ", "tester", "testing", "automatizacion de pruebas", "quality assurance")),
    ("movil", ("movil", "mobile", "android", "ios", "flutter", "react native")),
    ("escritorio", ("escritorio", "desktop")),
    ("frontend", ("frontend", "front end", "front-end")),
    ("backend", ("backend", "back end", "back-end")),
)

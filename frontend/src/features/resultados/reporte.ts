import { NOMBRE_EN_PANTALLA } from '@/features/resultados/rubricaPorDefecto'
import type { Nivel } from '@/types/catalogos'
import type { Entrevista, Intercambio, ResumenEntrevista } from '@/types/entrevista'
import type { BandaDeRubrica, CodigoDeCriterio, Evaluacion, Retroalimentacion } from '@/types/evaluacion'

/**
 * Lo que el reporte arma por reglas, sin IA: todo sale de las evaluaciones ya
 * guardadas, así que se puede explicar regla por regla y siempre da lo mismo.
 */

type Calificado = Intercambio & { evaluacion: Evaluacion }

const MAXIMO_POR_COLUMNA = 2

/** Si la evaluación trae nota: solo las de una entrevista finalizada. */
export function tieneNota(evaluacion: Evaluacion | Retroalimentacion): evaluacion is Evaluacion {
  return 'puntuacion' in evaluacion
}

function calificados(intercambios: Intercambio[]): Calificado[] {
  return intercambios.filter((i): i is Calificado => i.evaluacion !== null && tieneNota(i.evaluacion))
}

/** De mayor a menor nota (o al revés); los empates, por el número menor. */
function ordenadosPorNota(intercambios: Intercambio[], ascendente: boolean): Calificado[] {
  return [...calificados(intercambios)].sort((a, b) => {
    const diferencia = ascendente
      ? a.evaluacion.puntuacion - b.evaluacion.puntuacion
      : b.evaluacion.puntuacion - a.evaluacion.puntuacion
    return diferencia !== 0 ? diferencia : a.numero - b.numero
  })
}

/** La primera oración de un texto del evaluador, que suele traer varias. */
export function primeraFrase(texto: string): string {
  const limpio = texto.trim()
  const corte = limpio.search(/[.!?](\s|$)/)
  return corte === -1 ? limpio : limpio.slice(0, corte + 1)
}

/** Hasta 2 puntos distintos, tomados en el orden dado. */
function puntos(intercambios: Calificado[], campo: 'fortalezas' | 'debilidades'): string[] {
  const vistos = new Set<string>()
  for (const intercambio of intercambios) {
    const frase = primeraFrase(intercambio.evaluacion[campo])
    if (frase) vistos.add(frase)
    if (vistos.size === MAXIMO_POR_COLUMNA) break
  }
  return [...vistos]
}

/**
 * Fortalezas de las 2 respuestas mejor calificadas y debilidades de las 2 peor
 * calificadas: lo más representativo de cada lado, sin repetir el mismo texto.
 */
export function fortalezasYDebilidades(intercambios: Intercambio[]): {
  fortalezas: string[]
  debilidades: string[]
} {
  return {
    fortalezas: puntos(ordenadosPorNota(intercambios, false), 'fortalezas'),
    debilidades: puntos(ordenadosPorNota(intercambios, true), 'debilidades'),
  }
}

interface TemaARepasar {
  numero: number
  area: string
  puntuacion: number
  /** Lo que debía cubrir una respuesta completa; vacío en evaluaciones antiguas. */
  puntos: string[]
  sugerencia: string
}

/** Las 2 respuestas con menor nota, con lo que debían cubrir. */
export function temasARepasar(intercambios: Intercambio[]): TemaARepasar[] {
  return ordenadosPorNota(intercambios, true)
    .slice(0, MAXIMO_POR_COLUMNA)
    .map((i) => ({
      numero: i.numero,
      area: i.area_display,
      puntuacion: i.evaluacion.puntuacion,
      puntos: i.evaluacion.puntos_clave,
      sugerencia: i.evaluacion.sugerencias,
    }))
}

/** Un consejo fijo por criterio: qué cambiar en la forma de responder. */
const CONSEJOS: Record<CodigoDeCriterio, string> = {
  correccion:
    'Antes de responder, confirma el concepto: define el término con precisión y evita afirmar lo que no sabes; es mejor decir qué harías para comprobarlo.',
  completitud:
    'Cubre la respuesta de punta a punta: qué es, cuándo conviene usarlo, sus límites y un ejemplo breve. Repasa la lista de lo que debía cubrir cada respuesta.',
  claridad:
    'Ordena tu respuesta en tres pasos: el contexto, lo que harías y el resultado. Empieza por la idea principal y después da los detalles.',
}

export function consejoDeComunicacion(criterio: CodigoDeCriterio | null): string {
  return CONSEJOS[criterio ?? 'claridad']
}

interface PracticaRecomendada {
  puesto: string
  puestoNombre: string
  nivel: string
  nivelNombre: string
  /** Se sugiere subir de nivel: la banda fue «Sólido» y hay uno más exigente. */
  subeDeNivel: boolean
}

/**
 * El mismo puesto y nivel; con «Sólido», el nivel siguiente del catálogo si lo
 * hay. Sin catálogo (o con un nivel que ya no está), se queda en el mismo.
 */
export function practicaRecomendada(
  entrevista: Entrevista,
  banda: BandaDeRubrica,
  niveles: Nivel[],
): PracticaRecomendada {
  const indice = niveles.findIndex((n) => n.codigo === entrevista.nivel)
  const siguiente = banda === 'solido' && indice !== -1 ? niveles[indice + 1] : undefined
  return {
    puesto: entrevista.puesto,
    puestoNombre: entrevista.puesto_display,
    nivel: siguiente?.codigo ?? entrevista.nivel,
    nivelNombre: siguiente?.nombre ?? entrevista.nivel_display,
    subeDeNivel: siguiente !== undefined,
  }
}

/**
 * El párrafo que se muestra cuando el veredicto de la IA falta o falló: dice lo
 * mismo que el resumen, en palabras, y no lleva el rótulo de IA.
 */
export function veredictoPorReglas(resumen: ResumenEntrevista): string {
  const criterio = resumen.criterio_mas_debil
    ? ` Tu criterio más bajo fue ${NOMBRE_EN_PANTALLA[resumen.criterio_mas_debil.codigo].toLowerCase()}.`
    : ''
  return (
    `Tu desempeño fue ${resumen.banda_display.toLowerCase()}.${criterio}` +
    ` Prioriza repasar ${resumen.prioridad.area_display}.`
  )
}

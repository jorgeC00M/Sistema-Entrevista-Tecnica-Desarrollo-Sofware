import type { FechaISO } from './api'

/**
 * Bandas de la rúbrica, definidas en `apps/evaluaciones/rubricas.py`.
 *
 * A diferencia de los códigos del catálogo, este sí es un conjunto cerrado:
 * vive en código del backend, no en una tabla, y cambiarlo exige desplegar.
 */
export type BandaDeRubrica = 'insuficiente' | 'en_desarrollo' | 'aceptable' | 'solido'

export interface Evaluacion {
  /** Entero de 0 a 100. */
  puntuacion: number
  banda: BandaDeRubrica
  fortalezas: string
  debilidades: string
  sugerencias: string
}

export interface PromedioPorArea {
  /** Código del área, no su id numérico. */
  area: string
  area_display: string
  promedio: number
  /** En cuántas entrevistas distintas apareció este tema. */
  entrevistas: number
}

/**
 * Un punto del gráfico de progreso: una entrevista completa en el tiempo.
 *
 * Se identifica por el puesto y no por el área, porque una entrevista recorre
 * varios temas — "mi entrevista de Backend", no "mi entrevista de Bases de
 * Datos".
 */
export interface PuntoDeEvolucion {
  entrevista_id: number
  puesto: string
  puesto_display: string
  fecha_fin: FechaISO
  puntuacion_promedio: number
}

export interface Estadisticas {
  entrevistas_completadas: number
  /** `null` mientras el usuario no tenga ninguna entrevista finalizada. */
  promedio_general: number | null
  promedio_por_area: PromedioPorArea[]
  evolucion: PuntoDeEvolucion[]
}

/** Cuántas respuestas del usuario cayeron en cada banda, dentro de un área. */
export type ConteoPorBanda = Record<BandaDeRubrica, number>

export interface RepartoPorArea {
  area: string
  area_display: string
  total_respuestas: number
  promedio: number
  bandas: ConteoPorBanda
}

export interface Observacion {
  entrevista_id: number
  area: string
  area_display: string
  /** Número de la pregunta dentro de su entrevista. */
  numero: number
  pregunta: string
  puntuacion: number
  banda: BandaDeRubrica
  debilidades: string
  sugerencias: string
  fecha: FechaISO
}

/**
 * Retroalimentación acumulada de todas las entrevistas del usuario.
 *
 * A diferencia de `Estadisticas`, cuenta también las respuestas de entrevistas
 * abandonadas: una media necesita entrevistas completas para ser comparable,
 * pero una debilidad detectada a mitad sigue siendo una debilidad real.
 */
export interface RetroalimentacionAcumulada {
  total_respuestas_evaluadas: number
  por_area: RepartoPorArea[]
  /** Acotadas a las más recientes por el backend, de más nueva a más antigua. */
  observaciones: Observacion[]
}

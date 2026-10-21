import type { FechaISO } from './api'

/**
 * Bandas de la rúbrica, definidas en `apps/evaluaciones/rubricas.py`.
 *
 * A diferencia de los códigos del catálogo, este sí es un conjunto cerrado:
 * vive en código del backend, no en una tabla, y cambiarlo exige desplegar.
 */
export type BandaDeRubrica = 'insuficiente' | 'en_desarrollo' | 'aceptable' | 'solido'

/** Los tres criterios de la rúbrica analítica, en el orden en que se publican. */
export type CodigoDeCriterio = 'correccion' | 'completitud' | 'claridad'

/** Nivel de 0 a `rubrica.nivel_maximo` que el evaluador eligió en cada criterio. */
export type Niveles = Record<CodigoDeCriterio, number>

export interface Evaluacion {
  /**
   * Entero de 0 a 100, calculado en el servidor con la fórmula sobre
   * `niveles`, no escrito por la IA.
   */
  puntuacion: number
  banda: BandaDeRubrica
  /**
   * `null` en las evaluaciones anteriores a la rúbrica por niveles: conservan
   * su nota pero no tienen desglose que mostrar.
   */
  niveles: Niveles | null
  version_rubrica: number | null
  fortalezas: string
  debilidades: string
  sugerencias: string
  /** Lo que una respuesta completa debía cubrir. Vacía en evaluaciones anteriores. */
  puntos_clave: string[]
}

/** Cuántas respuestas del usuario cayeron en cada banda, dentro de un área. */
type ConteoPorBanda = Record<BandaDeRubrica, number>

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
 * Cuenta también las respuestas de entrevistas abandonadas: una debilidad
 * detectada a mitad sigue siendo una debilidad real.
 */
export interface RetroalimentacionAcumulada {
  total_respuestas_evaluadas: number
  por_area: RepartoPorArea[]
  /** Acotadas a las más recientes por el backend, de más nueva a más antigua. */
  observaciones: Observacion[]
}

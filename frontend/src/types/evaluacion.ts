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
  entrevistas: number
}

export interface PuntoDeEvolucion {
  entrevista_id: number
  area: string
  area_display: string
  fecha_fin: FechaISO
  /**
   * Número, no texto.
   *
   * Sale de una agregación devuelta con `.values()`, que no pasa por el
   * serializer — a diferencia de `Entrevista.puntuacion_promedio`, que DRF
   * convierte a cadena. Mismo nombre, distinto tipo según el endpoint.
   */
  puntuacion_promedio: number
}

export interface Estadisticas {
  entrevistas_completadas: number
  /** `null` mientras el usuario no tenga ninguna entrevista finalizada. */
  promedio_general: number | null
  promedio_por_area: PromedioPorArea[]
  evolucion: PuntoDeEvolucion[]
}

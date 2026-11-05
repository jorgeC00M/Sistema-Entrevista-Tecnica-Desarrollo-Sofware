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

/**
 * Lo que una entrevista no finalizada publica de cada respuesta: qué estuvo
 * bien y qué mejorar, sin puntaje ni niveles. Lo incompleto no se califica.
 */
export type Retroalimentacion = Pick<Evaluacion, 'fortalezas' | 'debilidades' | 'sugerencias'>

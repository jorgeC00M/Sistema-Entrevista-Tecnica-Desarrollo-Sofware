import type { FechaISO } from './api'
import type { BandaDeRubrica, CodigoDeCriterio, Evaluacion, Niveles } from './evaluacion'

export type EstadoEntrevista = 'en_progreso' | 'finalizada' | 'abandonada'

export interface Entrevista {
  id: number
  /** Código del catálogo (`"backend"`), no el id numérico del puesto. */
  puesto: string
  puesto_display: string
  nivel: string
  nivel_display: string
  /** `null` solo en entrevistas anteriores al catálogo por puesto. */
  tecnologia: string | null
  /** La de backend en un puesto con capas (Full Stack); si no, `null`. */
  segunda_tecnologia: string | null
  /** "React", o "React + Node.js" con dos capas. */
  tecnologia_display: string | null
  estado: EstadoEntrevista
  estado_display: string
  fecha_inicio: FechaISO
  /** `null` mientras la entrevista no haya terminado. */
  fecha_fin: FechaISO | null
  /**
   * Media sobre 100; `null` mientras la entrevista siga en curso.
   *
   * Número, no texto: `COERCE_DECIMAL_TO_STRING = False` hace que DRF
   * serialice los decimales como números, igual que ya llegaban los valores
   * agregados de `/api/estadisticas/`. Trae decimales (`75.5`), así que las
   * pantallas lo redondean antes de mostrarlo.
   */
  puntuacion_promedio: number | null
  /**
   * Media de lo respondido en una entrevista **abandonada**, la misma que su
   * reporte llama "parcial"; `null` en cualquier otro estado. Una en curso la
   * trae nula aunque ya tenga respuestas calificadas: la nota no se publica
   * hasta terminar.
   */
  puntuacion_parcial: number | null
  /**
   * Sobre cuántas preguntas se calculó `puntuacion_promedio`. En una
   * abandonada es menor que `preguntas_previstas` y la nota es parcial.
   */
  preguntas_calificadas: number
  preguntas_previstas: number
  /** Se inició desde una convocatoria: sus requisitos orientaron las preguntas. */
  desde_convocatoria: boolean
}

export interface Pregunta {
  numero: number
  texto: string
}

export interface Intercambio {
  numero: number
  /**
   * Tema de esta pregunta. Una entrevista recorre varias áreas según el puesto,
   * así que el área vive aquí y no en la cabecera.
   */
  area: string
  area_display: string
  pregunta: string
  /** Cadena vacía mientras el intercambio siga sin responder. */
  respuesta: string
  /** Segundos medidos en el servidor; `null` si aún no se respondió. */
  tiempo_respuesta: number | null
  /** `null` hasta que la respuesta se califica. */
  evaluacion: Evaluacion | null
}

export interface RespuestaIniciarEntrevista {
  entrevista: Entrevista
  /**
   * `null` si el intercambio ya existía y no quedaba nada pendiente — la
   * vista lo contempla, así que el tipo también.
   */
  pregunta: Pregunta | null
  total_preguntas: number
}

export interface RespuestaEstadoEntrevista {
  entrevista: Entrevista
  /** `null` cuando ya no queda ninguna pregunta por responder. */
  pregunta_pendiente: Pregunta | null
  total_preguntas: number
}

/**
 * Responder no devuelve calificación.
 *
 * La respuesta se evalúa en el servidor —es lo que calibra la exigencia de las
 * preguntas siguientes— pero la nota solo se publica cuando la entrevista
 * termina. Devolverla aquí la dejaría visible en la pestaña de red, que es lo
 * mismo que mostrarla.
 */
export interface RespuestaResponder {
  /** `null` en el último turno: la entrevista pasa a finalizada. */
  siguiente_pregunta: Pregunta | null
  entrevista: Entrevista
}

export interface RespuestaResultados {
  entrevista: Entrevista
  intercambios: Intercambio[]
  /**
   * El reporte consolidado. `null` mientras la entrevista sigue en curso
   * —misma regla que las notas por pregunta— o si nada llegó a calificarse.
   */
  resumen: ResumenEntrevista | null
}

/** Calculado en el servidor a partir de las evaluaciones guardadas, sin IA. */
export interface ResumenEntrevista {
  /** Media simple de las notas; en una abandonada, solo de las respondidas. */
  promedio: number
  banda: BandaDeRubrica
  banda_display: string
  /**
   * Nivel medio (sobre `rubrica.nivel_maximo`) de cada criterio. `null` si
   * ninguna evaluación tiene niveles: son anteriores a la rúbrica por niveles.
   */
  criterios: Niveles | null
  /** Sobre cuántas respuestas se calculó `criterios`. */
  criterios_sobre: number
  criterio_mas_debil: { codigo: CodigoDeCriterio; nombre: string } | null
  /** La respuesta con peor nota: su área y su sugerencia son lo primero a trabajar. */
  prioridad: {
    numero: number
    area: string
    area_display: string
    puntuacion: number
    sugerencia: string
  }
  /** Diferencia con la entrevista finalizada anterior del mismo puesto y nivel. */
  comparacion: { entrevista_id: number; diferencia: number } | null
}

export interface DatosIniciarEntrevista {
  puesto: string
  nivel: string
  /** Código de una tecnología **del puesto**; en Full Stack, la de frontend. */
  tecnologia: string
  /** Solo en un puesto con capas: la de backend. El servidor valida ambas. */
  segunda_tecnologia?: string | null
  /** Id de la convocatoria analizada con que se configuró, si hubo una. */
  convocatoria?: number | null
}

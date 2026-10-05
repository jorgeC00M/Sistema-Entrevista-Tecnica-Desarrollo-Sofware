import type { FechaISO } from './api'
import type { Evaluacion } from './evaluacion'

export type EstadoEntrevista = 'en_progreso' | 'finalizada' | 'abandonada'

export interface Entrevista {
  id: number
  /** Código del catálogo (`"backend"`), no el id numérico del puesto. */
  puesto: string
  puesto_display: string
  nivel: string
  nivel_display: string
  /**
   * `null` cuando el candidato no fijó un stack, que es una respuesta legítima
   * y distinta de una tecnología llamada "indiferente".
   */
  tecnologia: string | null
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
}

export interface DatosIniciarEntrevista {
  puesto: string
  nivel: string
  /** Opcional: sin stack elegido no se envía el campo. */
  tecnologia?: string
}

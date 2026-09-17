import type { DecimalTexto, FechaISO } from './api'
import type { Evaluacion } from './evaluacion'

export type EstadoEntrevista = 'en_progreso' | 'finalizada' | 'abandonada'

export interface Entrevista {
  id: number
  /** Código del catálogo (`"programacion"`), no el id numérico del área. */
  area: string
  area_display: string
  nivel: string
  nivel_display: string
  estado: EstadoEntrevista
  estado_display: string
  fecha_inicio: FechaISO
  /** `null` mientras la entrevista no haya terminado. */
  fecha_fin: FechaISO | null
  /** Texto (`"75.00"`) porque DRF serializa así los decimales; `null` si sigue en curso. */
  puntuacion_promedio: DecimalTexto | null
}

export interface Pregunta {
  numero: number
  texto: string
}

export interface Intercambio {
  numero: number
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
  pregunta: Pregunta
  total_preguntas: number
}

export interface RespuestaEstadoEntrevista {
  entrevista: Entrevista
  /** `null` cuando ya no queda ninguna pregunta por responder. */
  pregunta_pendiente: Pregunta | null
  total_preguntas: number
}

export interface RespuestaResponder {
  evaluacion: Evaluacion
  /** `null` en el último turno: la entrevista pasa a finalizada. */
  siguiente_pregunta: Pregunta | null
  entrevista: Entrevista
}

export interface RespuestaResultados {
  entrevista: Entrevista
  intercambios: Intercambio[]
}

export interface DatosIniciarEntrevista {
  area: string
  nivel: string
}

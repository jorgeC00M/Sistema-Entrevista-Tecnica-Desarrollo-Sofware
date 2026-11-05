import type { FechaISO } from './api'
import type { BandaDeRubrica, CodigoDeCriterio, Evaluacion, Niveles, Retroalimentacion } from './evaluacion'

/**
 * `tiempo_agotado`: venció el límite con alguna respuesta y sin responderlas
 * todas. `abandonada`: el usuario la dejó, o venció sin ninguna respuesta.
 * Solo `finalizada` tiene nota.
 */
export type EstadoEntrevista = 'en_progreso' | 'finalizada' | 'abandonada' | 'tiempo_agotado'

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
  /** Hasta cuándo se puede responder: 30 minutos desde `fecha_inicio`. */
  fecha_limite: FechaISO
  /** La hora del servidor al responder: el reloj cuenta con ella, no con la del dispositivo. */
  ahora: FechaISO
  /**
   * Media sobre 100; solo una `finalizada` la tiene.
   *
   * Número, no texto: `COERCE_DECIMAL_TO_STRING = False` hace que DRF
   * serialice los decimales como números. Trae decimales (`75.5`), así que las
   * pantallas lo redondean antes de mostrarlo.
   */
  puntuacion_promedio: number | null
  /** Cuántas respuestas tienen evaluación: el desglose dice sobre cuántas se calculó. */
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
  /**
   * `null` hasta que la respuesta se califica, y siempre en una entrevista en
   * curso. En una no finalizada llega solo la retroalimentación, sin nota.
   */
  evaluacion: Evaluacion | Retroalimentacion | null
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
   * El reporte consolidado. Solo en una `finalizada`: las demás no tienen nota
   * que resumir.
   */
  resumen: ResumenEntrevista | null
  /**
   * El párrafo de la IA que resume la entrevista. Solo en una `finalizada`; en
   * una que nunca lo pidió (anteriores a esta función) llega `null` y el
   * reporte lo pide con `pedirVeredicto`.
   */
  veredicto: Veredicto | null
}

/**
 * Escrito una sola vez, al terminar. Nunca cambia una nota: el servidor
 * descarta el texto si da una nota o un porcentaje, o si juzga la aptitud.
 */
export interface Veredicto {
  /** `no_disponible`: la IA falló o su texto se descartó; se muestra el respaldo por reglas. */
  estado: 'ok' | 'no_disponible'
  texto: string
  version: number
}

/** Calculado en el servidor a partir de las evaluaciones guardadas, sin IA. */
export interface ResumenEntrevista {
  /** Media simple de las notas de la entrevista. */
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

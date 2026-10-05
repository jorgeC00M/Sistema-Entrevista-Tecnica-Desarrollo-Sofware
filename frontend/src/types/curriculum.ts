/**
 * El análisis de un currículum contra los filtros de un ATS y, opcionalmente,
 * contra una convocatoria concreta.
 *
 * No hay ningún campo de "puntaje": los ATS reales no puntúan. Workday parsea a
 * campos que el reclutador busca y filtra, Taleo hace búsquedas booleanas y
 * Greenhouse no puntúa en absoluto. Lo que deja fuera a un candidato no es una
 * nota baja sino que sus datos no entraron a los campos, y entonces no aparece en
 * la búsqueda. Por eso lo que se publica es `campos` —la ficha que el ATS
 * armaría— y las métricas como texto ("5/7"), que son hechos medibles.
 *
 * Tampoco hay puesto: lo hubo y no afectaba a nada.
 */

/** Gravedad de un hallazgo, de mayor a menor. */
export type Severidad = 'critica' | 'alta' | 'media' | 'info'

export interface Hallazgo {
  codigo: string
  severidad: Severidad
  titulo: string
  detalle: string
  favorable: boolean
}

/** Un dato que el ATS intenta extraer, y si lo consiguió. */
export interface CampoDelEspejo {
  nombre: string
  detectado: boolean
  valor: string
  nota: string
}

/**
 * Dónde está evidenciado un requisito.
 *
 * `declarado` es el estado que da valor al módulo: la tecnología está en el CV
 * pero solo en la lista de habilidades, nunca dentro de un logro. Un reclutador
 * distingue eso de haberla usado; el candidato promedio no sabe que lo distingue.
 *
 * `presente` es el estado degradado: se sabe que aparece, no dónde, porque no se
 * reconocieron las secciones del CV.
 */
export type EstadoDeRequisito = 'demostrado' | 'declarado' | 'presente' | 'ausente'

export interface Requisito {
  termino: string
  estado: EstadoDeRequisito
}

export interface GrupoDeRequisitos {
  requisitos: Requisito[]
  cubiertos: number
  /** Cubiertos sobre pedidos, ya formateado ("4/6"). Nunca un porcentaje. */
  cobertura: string
}

export interface Brecha {
  obligatorios: GrupoDeRequisitos
  deseables: GrupoDeRequisitos
  /** Lo que el CV evidencia y la convocatoria no pidió. No puntúa en ningún sentido. */
  extras: string[]
  /** Si la convocatoria distinguía obligatorios de deseables. */
  separada: boolean
  /** Si se pudo precisar dónde está cada término, o solo si aparece. */
  con_evidencia: boolean
}

export interface AnalisisDeVinetas {
  total: number
  logros: number
  proporcion: string
  sin_resultado: string[]
}

export interface AnalisisATS {
  campos: CampoDelEspejo[]
  fortalezas: Hallazgo[]
  debilidades: Hallazgo[]
  campos_detectados: number
  campos_intentados: number
  /** Campos extraídos sobre campos intentados, ya formateado por el backend. */
  parseabilidad: string
  /** Nulo sin convocatoria, o con una que no menciona ningún término reconocible. */
  brecha: Brecha | null
  /** Los términos legibles del CV. Ocupa el lugar de la brecha cuando no hay convocatoria. */
  inventario: string[]
  /** Nulo cuando el CV no usa viñetas: así la sección se omite en vez de mostrar "0/0". */
  vinetas: AnalisisDeVinetas | null
  fecha: string
}

export interface Curriculum {
  id: number
  nombre_archivo: string
  formato: string
  paginas: number
  fecha: string
  /** Qué ruta se siguió. `brecha` puede ser nula incluso con convocatoria. */
  con_convocatoria: boolean
  analisis: AnalisisATS | null
}

/** Fila del historial: lo justo para ver si el CV mejoró con el tiempo. */
export interface CurriculumEnLista {
  id: number
  nombre_archivo: string
  fecha: string
  parseabilidad: string | null
  con_convocatoria: boolean
}

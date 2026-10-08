/**
 * El análisis de un currículum contra los filtros de un ATS y, opcionalmente,
 * contra una convocatoria concreta.
 *
 * No hay ningún campo de "puntaje": los ATS reales no puntúan. Workday parsea a
 * campos que el reclutador busca y filtra, Taleo hace búsquedas booleanas y
 * Greenhouse no puntúa en absoluto. Lo que deja fuera a un candidato no es una
 * nota baja sino que sus datos no entraron a los campos, y entonces no aparece en
 * la búsqueda. Por eso lo que se publica es `campos` —la ficha que el ATS
 * armaría— y las métricas como texto ("5/8"), que son hechos medibles.
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

/** Los años que pide la convocatoria frente a los que el ATS calcula. */
export type EstadoDeExperiencia = 'cumple' | 'no_alcanza' | 'no_calculable'

export interface RequisitoDeExperiencia {
  requeridos: number
  /** Nulo cuando el CV no tiene periodos legibles, que no es lo mismo que cero. */
  calculados_meses: number | null
  /** Ya formateado ("2 años y 4 meses", con "(aprox.)" si hay fechas solo de año). */
  calculados: string
  estado: EstadoDeExperiencia
  /** Si el ATS puede estar contando menos experiencia de la que hay, por cómo están escritas las fechas. */
  posible_subestimacion: boolean
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
  // Los tres siguientes son opcionales porque un análisis guardado con reglas
  // anteriores no los trae; se completan cuando el usuario vuelve a subir ese CV.
  /** Nulo si la convocatoria no pide años de experiencia. */
  experiencia?: RequisitoDeExperiencia | null
  /** Nulo si la convocatoria no nombra un cargo reconocible. */
  cargo?: Requisito | null
  idioma_distinto?: boolean
}

export interface AnalisisDeVinetas {
  total: number
  logros: number
  proporcion: string
  sin_resultado: string[]
}

/**
 * `ok`: hay sugerencias. `no_disponible`: el proveedor falló y volver a subir el
 * CV lo reintenta. `omitida`: no se envió nada (CV ilegible o sin secciones
 * reconocidas), y `motivo` dice por qué.
 */
export type EstadoDeRevision = 'ok' | 'no_disponible' | 'omitida'

export type TipoDeCorreccion = 'ortografia' | 'persona' | 'tiempo_verbal'

/**
 * Sugerencias de IA, siempre aparte de lo medido: nunca cambian un hallazgo, un
 * estado ni una cobertura. Todo lo que trae está anclado a lo que el usuario ve
 * —el backend descarta lo que la IA devuelva y no se pueda señalar en su CV—.
 */
export interface RevisionIA {
  estado: EstadoDeRevision
  motivo: string
  /** `original` es exactamente una de `vinetas.sin_resultado`. */
  vinetas: { original: string; sugerida: string }[]
  /** `termino` es un requisito o cargo de la brecha, o `"experiencia"` para el de años. */
  requisitos: { termino: string; sugerencia: string }[]
  /** `motivo` es el fragmento del CV o de la convocatoria que motiva la pregunta. */
  preguntas: { pregunta: string; motivo: string }[]
  /** Código de un puesto del catálogo, o nulo si ninguno encaja. */
  puesto_sugerido: string | null
  correcciones: { original: string; sugerido: string; tipo: TipoDeCorreccion }[]
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
  /** Nulo en análisis anteriores a la revisión con IA, hasta que se vuelve a subir el CV. */
  revision_ia: RevisionIA | null
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

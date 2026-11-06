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
  /**
   * Qué hacer, en imperativo («Pásalo a una sola columna»): el título de la
   * corrección. Vacía en las fortalezas y ausente en análisis de reglas < 6.
   */
  accion?: string
  /**
   * Cómo debe quedar, en texto fijo que no viene de la IA ni del CV; puede tener
   * saltos de línea. Vacío donde un ejemplo no ayuda y ausente en reglas < 7.
   */
  ejemplo?: string
}

/** Un dato que el ATS intenta extraer, y si lo consiguió. */
export interface CampoDelEspejo {
  nombre: string
  detectado: boolean
  valor: string
  nota: string
  /**
   * Detectado pero dañado por un hallazgo ya medido (fechas mezcladas, dos
   * columnas); `nota` dice por qué. Ausente en análisis de reglas < 8.
   */
  incompleto?: boolean
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

interface RequisitoDeExperiencia {
  requeridos: number
  /** Nulo cuando el CV no tiene periodos legibles, que no es lo mismo que cero. */
  calculados_meses: number | null
  /** Ya formateado ("2 años y 4 meses", con "(aprox.)" si hay fechas solo de año). */
  calculados: string
  estado: EstadoDeExperiencia
  /** Si el ATS puede estar contando menos experiencia de la que hay, por cómo están escritas las fechas. */
  posible_subestimacion: boolean
}

/**
 * Una pregunta de filtro del aviso (título, idioma, ubicación) comprobada en el
 * CV. Nunca hay un «no cumples»: `no_aparece` es que el CV no lo dice, y
 * `no_verificable` que lo dice pero no alcanza para decidir; `nota` explica cuál.
 */
export type EstadoDeFiltro = 'cumple' | 'no_aparece' | 'no_verificable'

export interface Filtro {
  tipo: 'titulo' | 'idioma' | 'ubicacion'
  /** Lo que pide el aviso, ya redactado: «Inglés intermedio». */
  pedido: string
  estado: EstadoDeFiltro
  nota: string
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
  /** Ausente en análisis de reglas anteriores a la 5; se completa al volver a subir el CV. */
  filtros?: Filtro[]
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
type EstadoDeRevision = 'ok' | 'no_disponible' | 'omitida'

export type TipoDeCorreccion = 'ortografia' | 'persona' | 'tiempo_verbal'

/**
 * Sugerencias de IA, siempre aparte de lo medido: nunca cambian un hallazgo, un
 * estado ni una cobertura. Todo lo que trae está anclado a lo que el usuario ve
 * —el backend descarta lo que la IA devuelva y no se pueda señalar en su CV—.
 */
/** La sugerencia de IA para un requisito; los dos caminos solo llegan para un `ausente`. */
export interface SugerenciaDeRequisito {
  termino: string
  sugerencia: string
  /** Si ya lo usó: cómo escribirlo en un logro. Revisiones de la versión 1 no lo traen. */
  muestralo?: string
  /** Una viñeta de ejemplo, con [cifra] en lugar de números. */
  ejemplo?: string
  /** Si aún no: cómo conseguir la experiencia. */
  aprendelo?: string
}

export interface RevisionIA {
  estado: EstadoDeRevision
  /** Ausente en las revisiones de antes de la versión 2, que se vuelven a pedir. */
  version?: number
  motivo: string
  /** Resumen del match sin juzgar la aptitud; vacío sin convocatoria o si se descartó. */
  lectura?: string
  /** `original` es exactamente una de `vinetas.sin_resultado`. */
  vinetas: { original: string; sugerida: string }[]
  /** `termino` es un requisito o cargo de la brecha, o `"experiencia"` para el de años. */
  requisitos: SugerenciaDeRequisito[]
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
/** El estado del CV por sus datos clave: la regla está en `hallazgos.ts::veredictoDeLegibilidad`. */
export type NivelDeLegibilidad = 'perdidas_importantes' | 'legible_con_perdidas' | 'legible'

export interface CurriculumEnLista {
  id: number
  nombre_archivo: string
  fecha: string
  parseabilidad: string | null
  /** Calculado por el backend con la misma regla del Resumen; nulo sin análisis. */
  veredicto: NivelDeLegibilidad | null
  con_convocatoria: boolean
}

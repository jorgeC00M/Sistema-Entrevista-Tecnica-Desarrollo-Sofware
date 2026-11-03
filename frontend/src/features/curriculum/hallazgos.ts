import type { NombreDeIcono } from '@/components/ui/trazosDeIconos'
import type { AnalisisATS, Hallazgo, NivelDeLegibilidad, Severidad } from '@/types/curriculum'

/** Menor peso, más grave: lo que deja el CV fuera de la búsqueda va primero. */
const PESO: Record<Severidad, number> = { critica: 0, alta: 1, media: 2, info: 3 }

/**
 * Cómo se rotula cada gravedad: por lo que le hace al ATS, no como veredicto
 * sobre el CV. El módulo se niega a dar un puntaje para ser defendible, y
 * "Crítico" en rojo sobre el primer CV de alguien era también un veredicto sin
 * contexto. Los colores de estado no cambian. `info` no lleva rótulo: un
 * hallazgo favorable no necesita gravedad.
 */
export const SEVERIDADES: Record<Severidad, { etiqueta: string; clases: string; icono: string }> = {
  critica: { etiqueta: 'Impide la lectura', clases: 'bg-error-fondo text-error-texto', icono: 'text-error-texto' },
  alta: { etiqueta: 'Resta visibilidad', clases: 'bg-progreso-fondo text-progreso-texto', icono: 'text-progreso-texto' },
  media: { etiqueta: 'Detalle', clases: 'bg-vidrio-field text-vidrio-muted', icono: 'text-vidrio-muted' },
  info: { etiqueta: '', clases: '', icono: 'text-vidrio-muted' },
}

/**
 * El código que emite el backend (`integrations/documentos/ats.py`) cuando el
 * documento no tiene capa de texto. Es el contrato que ya existe: no hace falta
 * un campo nuevo en la API.
 */
export const CODIGO_SIN_CAPA_DE_TEXTO = 'sin_capa_de_texto'

/**
 * Si el ATS no puede leer nada del CV (un PDF escaneado o exportado como
 * imagen). Entonces el resto del análisis está vacío por construcción, y
 * mostrarlo culparía a la causa equivocada: "tus habilidades están en barras",
 * "tu convocatoria no tiene requisitos". No basta con `campos_detectados === 0`:
 * un CV legible con encabezados raros también puede no llenar ningún campo.
 */
export function esIlegible(analisis: Pick<AnalisisATS, 'debilidades'>): boolean {
  return analisis.debilidades.some((h) => h.codigo === CODIGO_SIN_CAPA_DE_TEXTO)
}

/**
 * Las debilidades de la más grave a la menos grave, sin mutar la lista.
 *
 * El orden es estable: entre dos de la misma gravedad se respeta el del
 * backend, que es el orden de sus reglas y por eso es reproducible.
 */
export function debilidadesPorGravedad(hallazgos: readonly Hallazgo[]): Hallazgo[] {
  return [...hallazgos].sort((a, b) => PESO[a.severidad] - PESO[b.severidad])
}

/** Cuántas correcciones encabezan el Resumen; el resto vive en «Plan de Mejora». */
const PRIORITARIAS = 3

/**
 * Las correcciones con más efecto, en orden de gravedad. Las comparten el
 * bloque «Formato» del veredicto (como diagnóstico) y «Lo que debes hacer»
 * (como acción), así que los dos nunca hablan de errores distintos.
 */
export function correccionesPrioritarias(hallazgos: readonly Hallazgo[]): Hallazgo[] {
  return debilidadesPorGravedad(hallazgos).slice(0, PRIORITARIAS)
}

/** El `id` de cada corrección en «Plan de Mejora»: el Resumen enlaza a él para llevar el foco ahí. */
export function idDeHallazgo(codigo: string): string {
  return `hallazgo-${codigo}`
}

/**
 * Cómo se nombra cada nivel: `titulo` en el banner del Resumen, `etiqueta` en
 * la columna «Estado del CV» del historial y en el banner, y `regla`, la
 * condición de `veredictoDeLegibilidad` que lo activa, dicha en palabras. Un
 * solo mapa para que no digan cosas distintas; icono y palabra además del
 * color, nunca color solo.
 */
export const VEREDICTOS: Record<
  NivelDeLegibilidad,
  { etiqueta: string; titulo: string; regla: string; icono: NombreDeIcono; clases: string; tono: string }
> = {
  perdidas_importantes: {
    etiqueta: 'Pérdidas importantes',
    titulo: 'El ATS pierde datos clave de tu CV',
    regla: 'Al menos un dato clave (contacto, experiencia o habilidades) no se pudo extraer.',
    icono: 'cerrar',
    clases: 'bg-error-fondo text-error-texto',
    tono: 'text-error-texto',
  },
  legible_con_perdidas: {
    etiqueta: 'Legible con pérdidas',
    titulo: 'El ATS lee tu CV con pérdidas',
    regla: 'Los datos clave se extrajeron, pero algún dato quedó incompleto o falta.',
    icono: 'mejora',
    clases: 'bg-progreso-fondo text-progreso-texto',
    tono: 'text-progreso-texto',
  },
  legible: {
    etiqueta: 'Legible',
    titulo: 'El ATS lee tu CV completo',
    regla: 'Todos los datos se extrajeron completos.',
    icono: 'fortaleza',
    clases: 'bg-exito-fondo text-exito-texto',
    tono: 'text-exito-texto',
  },
}

/**
 * Los datos sin los que el reclutador no puede encontrarte ni contactarte: el
 * contacto, la experiencia y las habilidades. Copia de `CAMPOS_CLAVE` en
 * `backend/integrations/documentos/ats.py`: si cambia allí, cambia aquí.
 */
export const CAMPOS_CLAVE = ['Nombre', 'Correo', 'Teléfono', 'Experiencia', 'Habilidades'] as const

export type EstadoDelCampo = 'extraido' | 'incompleto' | 'no_extraido'

/** El estado medido de un dato de la ficha. Sin `incompleto` (reglas < 8), extraído o no. */
export function estadoDelCampo(campo: { detectado: boolean; incompleto?: boolean }): EstadoDelCampo {
  if (!campo.detectado) return 'no_extraido'
  return campo.incompleto ? 'incompleto' : 'extraido'
}

/**
 * El estado del CV, derivado de sus datos y nunca escrito a mano:
 * - `perdidas_importantes`: falta algún dato clave (`CAMPOS_CLAVE`).
 * - `legible_con_perdidas`: están los clave, pero algún dato quedó incompleto
 *   o falta uno que no es clave.
 * - `legible`: los datos se extrajeron completos.
 *
 * Mide qué pierde el reclutador, no la gravedad de cada error: los errores
 * siguen en «Formato» y en «Plan de Mejora». Ningún número sobre 100: se
 * explica en una frase. Es la misma regla que `ats.py::estado_del_cv`, que el
 * backend aplica al historial (`AnalisisATS.veredicto`).
 */
export function veredictoDeLegibilidad(analisis: Pick<AnalisisATS, 'campos'>): NivelDeLegibilidad {
  const clave: readonly string[] = CAMPOS_CLAVE
  const estados = analisis.campos.map((campo) => ({ campo, estado: estadoDelCampo(campo) }))
  if (estados.some(({ campo, estado }) => clave.includes(campo.nombre) && estado === 'no_extraido')) {
    return 'perdidas_importantes'
  }
  if (estados.some(({ estado }) => estado !== 'extraido')) return 'legible_con_perdidas'
  return 'legible'
}

/**
 * El título de una corrección: qué hacer. Un análisis de reglas anteriores a la
 * 6 no trae acción, y entonces se muestra su diagnóstico, como antes.
 */
export function accionDe(hallazgo: Pick<Hallazgo, 'accion' | 'titulo'>): string {
  return hallazgo.accion || hallazgo.titulo
}

/** Los dos análisis que se eligen en la entrada: solo el CV, o el CV frente a un aviso. */
export type TipoDeAnalisis = 'general' | 'dirigido'

/** El nombre del tipo de análisis: el mismo en la entrada, la barra del resultado y el historial. */
export function tipoDeRevision(conConvocatoria: boolean): string {
  return conConvocatoria ? 'Análisis dirigido' : 'Análisis general'
}

/**
 * Si el análisis elegido ya tiene lo que necesita: el CV y, en el dirigido, el
 * texto o el archivo de la convocatoria. En el general la convocatoria no
 * cuenta aunque haya algo cargado: no se envía.
 */
export function puedeAnalizar(
  tipo: TipoDeAnalisis,
  archivo: File | null,
  convocatoria: string,
  archivoConvocatoria: File | null,
): boolean {
  if (!archivo) return false
  return tipo === 'general' || convocatoria.trim() !== '' || archivoConvocatoria !== null
}

/**
 * Los datos que el ATS intenta extraer, para «Qué revisamos» en la entrada.
 * Copia de `CAMPOS_DE_LA_FICHA` (`backend/integrations/documentos/ats.py`), en
 * el mismo orden: si la ficha cambia allí, cambia aquí. El resultado de cada
 * análisis trae sus propios campos; esta lista solo anticipa qué se mide.
 */
export const CAMPOS_QUE_BUSCA_EL_ATS = [
  'Nombre',
  'Correo',
  'Teléfono',
  'Ubicación',
  'Experiencia',
  'Educación',
  'Habilidades',
  'Antigüedad',
] as const

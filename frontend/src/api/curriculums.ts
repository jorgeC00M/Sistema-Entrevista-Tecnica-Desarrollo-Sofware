import { peticion } from '@/api/client'
import type { Curriculum, CurriculumEnLista, RevisionIA } from '@/types/curriculum'

/** Extensiones que el backend acepta; el input las usa para filtrar el diálogo. */
export const EXTENSIONES_ACEPTADAS = '.pdf,.docx'

/** Mismo tope que `MAXIMO_BYTES` en el serializer del backend. */
export const MAXIMO_BYTES = 2 * 1024 * 1024

// El mapa inverso de `analizarCurriculum`, para `repartirErrores`. Solo
// `archivo_convocatoria` necesita traducción real: los otros dos nombres ya
// coinciden entre el serializer y el formulario.
const CAMPO_DEL_FORMULARIO: Record<string, string> = {
  archivo: 'archivo',
  convocatoria: 'convocatoria',
  archivo_convocatoria: 'archivoConvocatoria',
}

/** Traduce una clave de error de `analizarCurriculum()` al nombre del formulario. */
export function campoDeCurriculum(campoDelBackend: string): string | undefined {
  return CAMPO_DEL_FORMULARIO[campoDelBackend]
}

interface Entrada {
  archivo: File
  /** Pegada. Excluyente con `archivoConvocatoria`: el backend rechaza las dos. */
  convocatoria?: string
  archivoConvocatoria?: File | null
}

export function analizarCurriculum({
  archivo,
  convocatoria,
  archivoConvocatoria,
}: Entrada): Promise<Curriculum> {
  const formulario = new FormData()
  formulario.append('archivo', archivo)

  // Solo se envía la vía que tenga contenido: mandar la otra vacía haría que el
  // backend viera las dos y rechazara la petición.
  if (convocatoria?.trim()) formulario.append('convocatoria', convocatoria.trim())
  else if (archivoConvocatoria) formulario.append('archivo_convocatoria', archivoConvocatoria)

  // Solo medición: abrir el documento y recorrerlo es trabajo de CPU, y la IA ya
  // no va en esta petición (ver `pedirRevision`). El tope por defecto sobra.
  return peticion<Curriculum>('/api/curriculums/', { method: 'POST', body: formulario })
}

/**
 * Lo que tarda una revisión de IA en el peor caso razonable: 30 s por
 * proveedor, una cadena de respaldo y el arranque en frío del plan gratuito.
 */
const TIEMPO_DE_REVISION_MS = 120_000

/**
 * Las sugerencias de IA de un análisis ya guardado. Es la segunda petición:
 * el diagnóstico llega antes, sin esperar a la IA. Si ya las hay, el servidor
 * las devuelve sin volver a llamar al proveedor; si falló, reintenta.
 */
export async function pedirRevision(id: number, signal?: AbortSignal): Promise<RevisionIA> {
  const { revision_ia } = await peticion<{ revision_ia: RevisionIA }>(`/api/curriculums/${id}/revision/`, {
    method: 'POST',
    signal,
    timeoutMs: TIEMPO_DE_REVISION_MS,
  })
  return revision_ia
}

export function obtenerHistorialDeCurriculums(
  signal?: AbortSignal,
): Promise<CurriculumEnLista[]> {
  return peticion<CurriculumEnLista[]>('/api/curriculums/', { signal })
}

/** Un análisis guardado, con su resultado completo. */
export function obtenerCurriculum(id: number, signal?: AbortSignal): Promise<Curriculum> {
  return peticion<Curriculum>(`/api/curriculums/${id}/`, { signal })
}

import { ErrorAPI } from '@/api/client'

/**
 * Los fallos del servicio de IA, por el `codigo` que agrega el manejador de
 * errores del backend (`apps/common/exceptions.py`).
 *
 * El título dice qué pasó; la pantalla agrega qué se conserva y qué hacer
 * (`AlertaDeIA`). Nunca se nombra al proveedor: con la cadena de respaldo sería
 * engañoso, y al usuario no le sirve para decidir nada.
 */
type CodigoDeErrorDeIA = 'ia_ocupada' | 'ia_rechazo' | 'ia_respuesta_invalida'

export const TITULO_DE_ERROR_DE_IA: Record<CodigoDeErrorDeIA, string> = {
  ia_ocupada: 'La IA está ocupada en este momento.',
  ia_rechazo: 'La IA no pudo atender esta solicitud.',
  ia_respuesta_invalida: 'La IA respondió algo que no pudimos usar.',
}

export interface ErrorDeIA {
  codigo: CodigoDeErrorDeIA
  titulo: string
}

/** El fallo de IA que trae `err`, o `null` si es otro tipo de error. */
export function errorDeIA(err: unknown): ErrorDeIA | null {
  if (!(err instanceof ErrorAPI) || !err.datos) return null
  const codigo = (err.datos as { codigo?: unknown }).codigo
  if (typeof codigo !== 'string' || !(codigo in TITULO_DE_ERROR_DE_IA)) return null
  const conocido = codigo as CodigoDeErrorDeIA
  return { codigo: conocido, titulo: TITULO_DE_ERROR_DE_IA[conocido] }
}

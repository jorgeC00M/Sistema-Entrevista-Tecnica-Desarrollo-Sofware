/**
 * Qué hace el chat con la pregunta pendiente al reconstruirse, como lógica pura.
 *
 * La pendiente es la primera pregunta **sin evaluar**, y puede tener ya
 * respuesta guardada: el usuario recargó mientras la IA evaluaba, o la
 * evaluación falló. Una respuesta guardada nunca se vuelve a pedir y recargar
 * nunca la reenvía: el chat espera a que el servidor termine, o, si el servidor
 * ya dijo que no pudo, ofrece «Reintentar» con la respuesta guardada.
 */

import type { PreguntaPendiente } from '@/types/entrevista'

/**
 * Pasado este tiempo desde que se guardó la respuesta sin evaluación ni marca
 * de fallo, la petición original murió (el servidor se reinició): el cliente
 * espera 90 s al responder, y el servidor corta a los 120 s.
 */
export const ESPERA_MAXIMA_MS = 120_000

/** Cada cuánto se consulta el estado mientras se espera la evaluación. */
export const INTERVALO_DE_CONSULTA_MS = 3_000

type Reanudacion = 'responder' | 'esperar' | 'fallo'

/**
 * `ahoraServidor` es la hora que el servidor dio en la misma respuesta: la
 * comparación usa solo horas del servidor, nunca la del dispositivo.
 */
export function queHacerConLaPendiente(
  pendiente: Pick<PreguntaPendiente, 'respuesta' | 'respondido_en' | 'evaluacion_fallida'>,
  ahoraServidor: string,
): Reanudacion {
  if (pendiente.respuesta === '') return 'responder'
  if (pendiente.evaluacion_fallida) return 'fallo'
  if (pendiente.respondido_en === null) return 'esperar'
  const transcurrido = Date.parse(ahoraServidor) - Date.parse(pendiente.respondido_en)
  return transcurrido >= ESPERA_MAXIMA_MS ? 'fallo' : 'esperar'
}

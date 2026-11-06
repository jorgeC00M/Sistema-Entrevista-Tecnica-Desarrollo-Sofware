/**
 * La reconstrucción del chat al entrar o recargar, como lógica pura.
 */

import type { AutorDeMensaje } from '@/components/ui/BurbujaPregunta'
import type { Intercambio, PreguntaPendiente } from '@/types/entrevista'

export interface MensajeDeChat {
  autor: AutorDeMensaje
  texto: string
}

/**
 * Los turnos ya respondidos y, al final, la pregunta pendiente con su respuesta
 * si ya la tiene guardada.
 *
 * La pendiente se excluye de los respondidos y se agrega aparte: sin eso, una
 * pendiente respondida y aún sin evaluar se pintaba dos veces, la pregunta
 * repetida como si fuera nueva. El criterio es la respuesta y no la
 * evaluación: durante la entrevista la API no publica calificaciones, así que
 * filtrar por evaluación dejaría el historial entero fuera.
 */
export function reconstruirChat(
  intercambios: Pick<Intercambio, 'numero' | 'pregunta' | 'respuesta'>[],
  pendiente: Pick<PreguntaPendiente, 'numero' | 'texto' | 'respuesta'> | null,
): MensajeDeChat[] {
  const previos: MensajeDeChat[] = intercambios
    .filter((i) => i.respuesta !== '' && i.numero !== pendiente?.numero)
    .flatMap((i) => [
      { autor: 'sistema' as const, texto: i.pregunta },
      { autor: 'usuario' as const, texto: i.respuesta },
    ])
  if (!pendiente) return previos
  const actual: MensajeDeChat[] = [{ autor: 'sistema', texto: pendiente.texto }]
  if (pendiente.respuesta !== '') actual.push({ autor: 'usuario', texto: pendiente.respuesta })
  return [...previos, ...actual]
}

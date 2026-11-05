/**
 * El reloj de la entrevista, como lógica pura.
 *
 * El servidor es la autoridad: publica `fecha_limite` y su propia hora
 * (`ahora`). El cliente solo cuenta, corrigiendo la diferencia entre su reloj y
 * el del servidor, así que un dispositivo con la hora mal puesta no da ni quita
 * minutos. Al llegar a 0 la interfaz deja de aceptar respuestas, pero quien
 * cierra la entrevista es el servidor.
 */

/** Cuánto va adelantado el reloj del dispositivo frente al del servidor, en ms. */
export function desfaseDelReloj(ahoraServidor: string, ahoraCliente: number): number {
  return ahoraCliente - Date.parse(ahoraServidor)
}

/** Segundos que quedan hasta `fechaLimite`, nunca negativos. */
export function segundosRestantes(fechaLimite: string, desfaseMs: number, ahoraCliente: number): number {
  const restanteMs = Date.parse(fechaLimite) - (ahoraCliente - desfaseMs)
  return Math.max(0, Math.ceil(restanteMs / 1000))
}

/** `mm:ss`, como lo muestra la cabecera del chat. */
export function formatoReloj(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export type TramoDelReloj = 'normal' | 'aviso5' | 'aviso1' | 'vencido'

/** El aspecto del reloj: avisa al quedar 5 minutos y al quedar 1. */
export function tramoDelReloj(segundos: number): TramoDelReloj {
  if (segundos <= 0) return 'vencido'
  if (segundos <= 60) return 'aviso1'
  if (segundos <= 300) return 'aviso5'
  return 'normal'
}

/** Minutos que quedan, hacia arriba: con 30 s todavía «queda 1 min». */
export function minutosRestantes(segundos: number): number {
  return Math.ceil(segundos / 60)
}

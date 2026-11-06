/**
 * El reloj de la entrevista, como lógica pura.
 *
 * El servidor es la autoridad: publica `fecha_limite` y su propia hora
 * (`ahora`). Lo que queda se calcula **solo con horas del servidor** al llegar
 * su respuesta, y desde ahí se descuenta con `performance.now()`, un reloj
 * monotónico: ni un dispositivo con la hora mal puesta ni alguien que la cambie
 * a mitad de la entrevista dan o quitan minutos. Al llegar a 0 la interfaz deja
 * de aceptar respuestas, pero quien cierra la entrevista es el servidor.
 */

/**
 * Lo que quedaba cuando llegó la respuesta del servidor, y cuándo llegó según
 * el reloj monotónico. `recibidoEn` debe ser el de la llegada, no el de la
 * lectura: un dato de la caché ya envejeció.
 */
export interface AnclaDelReloj {
  restanteMs: number
  recibidoEn: number
}

export function anclaDelReloj(fechaLimite: string, ahoraServidor: string, recibidoEn: number): AnclaDelReloj {
  return { restanteMs: Date.parse(fechaLimite) - Date.parse(ahoraServidor), recibidoEn }
}

/** Segundos que quedan, nunca negativos. `ahoraMonotonico` es `performance.now()`. */
export function segundosRestantes(ancla: AnclaDelReloj, ahoraMonotonico: number): number {
  const restanteMs = ancla.restanteMs - (ahoraMonotonico - ancla.recibidoEn)
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

/**
 * El texto del botón del sidebar: solo los minutos, que es lo que decide si
 * volver ahora. El número de pregunta se ve al entrar al chat.
 */
export function etiquetaDeContinuar(segundos: number): string {
  return `Continuar · ${minutosRestantes(segundos)} min`
}

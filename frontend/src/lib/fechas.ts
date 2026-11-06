/**
 * Las fechas que muestra la app, en un solo lugar: cada formato tiene un uso y
 * el mismo dato no se escribe distinto en dos pantallas.
 */

/** "28 oct 2026": la fecha de un análisis, igual en su barra y en el historial. */
export function fechaLegible(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "28/10/2026": la tabla de entrevistas y los puntos de la evolución, que se comparan entre sí. */
export function fechaNumerica(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** "28 de octubre de 2026": un dato suelto que se lee, como «Miembro desde». */
export function fechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })
}

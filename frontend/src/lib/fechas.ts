/** "28 oct 2026": la fecha de un análisis, igual en su barra y en el historial. */
export function fechaLegible(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })
}

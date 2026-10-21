/**
 * Qué números de página se ofrecen y cómo se normaliza una página pedida.
 *
 * Puro y sin React: es la parte de la paginación que se puede probar con
 * Vitest (el frontend no tiene tests de componentes). `Paginacion` solo lo pinta.
 */

/** Como máximo cuántos números se ven a la vez; el resto se alcanza con ‹ y ›. */
export const MAXIMO_NUMEROS = 3

/**
 * Una ventana de hasta `MAXIMO_NUMEROS` páginas consecutivas, con la actual en
 * el centro. En los extremos se desplaza para seguir mostrando tres:
 * en la 1 de 12, `[1, 2, 3]`; en la 6, `[5, 6, 7]`; en la 12, `[10, 11, 12]`.
 */
export function paginasVisibles(actual: number, total: number): number[] {
  if (total <= 0) return []
  const cuantas = Math.min(MAXIMO_NUMEROS, total)
  const inicio = Math.min(Math.max(1, actual - Math.floor(cuantas / 2)), total - cuantas + 1)
  return Array.from({ length: cuantas }, (_, indice) => inicio + indice)
}

/**
 * La página válida más cercana a la pedida. Llega de `?pagina=`, así que puede
 * ser cualquier cosa: un número fuera de rango, un decimal o `NaN`.
 */
export function recortar(pagina: number, total: number): number {
  if (!Number.isFinite(pagina) || total <= 1) return 1
  return Math.min(Math.max(1, Math.trunc(pagina)), total)
}

/**
 * Si el usuario pidió al sistema reducir el movimiento. Lo consultan las piezas
 * animadas de la landing (contadores, carrusel, demo del hero) y los
 * desplazamientos suaves de la aplicación, para no repetir el `matchMedia` en
 * cada una. El CSS lo respeta por su lado en `styles/base.css`.
 */
export function prefiereMovimientoReducido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

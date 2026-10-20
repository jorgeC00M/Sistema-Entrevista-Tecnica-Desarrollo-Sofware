import { useCallback, useSyncExternalStore } from 'react'

/** Ancho desde el que hay barra lateral fija (de iconos): `md` de Tailwind. */
export const DESDE_TABLET = '(min-width: 768px)'
/** Ancho desde el que la barra lateral es completa y plegable: `lg` de Tailwind. */
export const DESDE_ESCRITORIO = '(min-width: 1024px)'

/**
 * Si la media query se cumple ahora, re-renderizando al cambiar.
 *
 * Con `useSyncExternalStore` y no con un estado más un efecto: React lee el
 * valor en el mismo render, sin un primer pintado con el valor equivocado ni
 * un `setState` dentro de un efecto. Se usa para lo que CSS no alcanza: el
 * contenido del sidebar depende de la prop `plegado`, no de clases.
 */
export function useMediaQuery(consulta: string): boolean {
  const suscribir = useCallback(
    (avisar: () => void) => {
      const lista = window.matchMedia(consulta)
      lista.addEventListener('change', avisar)
      return () => lista.removeEventListener('change', avisar)
    },
    [consulta],
  )
  return useSyncExternalStore(
    suscribir,
    () => window.matchMedia(consulta).matches,
    () => false,
  )
}

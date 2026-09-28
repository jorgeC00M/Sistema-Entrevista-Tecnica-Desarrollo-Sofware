import { useEffect, useRef, useState } from 'react'

/** Compartida con el resto de piezas animadas de la landing (contadores,
 * carrusel, demo del hero) para no repetir el `matchMedia` en cada una. */
export function prefiereMovimientoReducido(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Revela un elemento cuando entra en pantalla.
 *
 * Se resuelve con `IntersectionObserver` y una transición de CSS en lugar de
 * añadir una librería de animación: son unos 70 kB para animar la aparición de
 * cinco secciones de una sola página.
 *
 * Con movimiento reducido activado devuelve `visible` desde el primer render,
 * de modo que el contenido aparece directamente en su estado final y nunca
 * queda oculto si el observador no llegara a dispararse.
 */
export function useRevelarAlEntrar<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(() => prefiereMovimientoReducido())

  useEffect(() => {
    if (visible) return

    const elemento = ref.current
    if (!elemento) return

    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observador.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    observador.observe(elemento)
    return () => observador.disconnect()
  }, [visible])

  return { ref, visible }
}

/** Clases de la transición, para no repetirlas en cada sección. */
export function clasesRevelado(visible: boolean): string {
  return `transition-all duration-500 ease-out motion-reduce:transition-none ${
    visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
  }`
}

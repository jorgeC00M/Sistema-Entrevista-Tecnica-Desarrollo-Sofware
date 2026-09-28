import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface Resultado<C extends HTMLElement, D extends HTMLElement> {
  contenedorRef: RefObject<C | null>
  disparadorRef: RefObject<D | null>
}

/**
 * Atrapa el foco dentro de un contenedor mientras `activo` es `true`.
 *
 * Extraído de `components/layout/useCajonNavegacion.ts`, hoy su único
 * consumidor: el cajón de navegación en pantallas estrechas. Son unas
 * cuarenta líneas frente a los 15-40 kB de `focus-trap` o Radix, consistente
 * con cada otra dependencia de UI que este proyecto ya descartó.
 *
 * Conducta: el primer elemento enfocable recibe el foco al activarse, Tab no
 * se escapa por ninguno de los dos extremos, Escape llama a `onEscape`, y al
 * desactivarse el foco vuelve al elemento que lo disparó. El desplazamiento
 * del fondo se bloquea mientras está activo.
 *
 * Devuelve las dos referencias en vez de recibirlas: así ningún consumidor
 * necesita crear sus propios `useRef` solo para pasárselos de vuelta.
 */
export function useFocusTrap<
  C extends HTMLElement = HTMLElement,
  D extends HTMLElement = HTMLButtonElement,
>(activo: boolean, onEscape: () => void): Resultado<C, D> {
  const contenedorRef = useRef<C>(null)
  const disparadorRef = useRef<D>(null)

  // Devolver el foco a quien lo disparó. Sin esto, desactivar el trampolín
  // deja al teclado al principio del documento.
  useEffect(() => {
    if (activo) return
    disparadorRef.current?.focus()
    // Solo al pasar de activo a inactivo; en el primer render no hay nada que
    // devolver, y enfocar el disparador al cargar sería desconcertante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo])

  useEffect(() => {
    if (!activo) return

    const contenedor = contenedorRef.current
    // El primer elemento recibe el foco al activarse, para no obligar a
    // tabular desde el principio del documento.
    contenedor?.querySelector<HTMLElement>(SELECTOR_ENFOCABLES)?.focus()

    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onEscape()
        return
      }
      if (evento.key !== 'Tab' || !contenedor) return

      const enfocables = Array.from(contenedor.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES))
      if (enfocables.length === 0) return

      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]

      // Confinamiento: al salir por cualquier extremo se vuelve al otro.
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }

    document.addEventListener('keydown', alPulsarTecla)
    const desbordeOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPulsarTecla)
      document.body.style.overflow = desbordeOriginal
    }
  }, [activo, onEscape])

  return { contenedorRef, disparadorRef }
}

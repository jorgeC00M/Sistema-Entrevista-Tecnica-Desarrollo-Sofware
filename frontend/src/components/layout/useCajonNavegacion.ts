import { useCallback, useEffect, useRef, useState } from 'react'

const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Cajón de navegación para pantallas estrechas.
 *
 * Resuelve a mano las cuatro conductas que hacen falta: cerrar con Escape,
 * confinar el foco mientras está abierto, devolverlo al botón que lo abrió, y
 * bloquear el desplazamiento del fondo.
 *
 * Son unas cuarenta líneas frente a los 15-40 kB de `focus-trap` o Radix, que
 * además traerían un modelo de componentes que el proyecto no usa. El alcance
 * es un cajón con enlaces, sin contenido anidado ni foco programático.
 */
export function useCajonNavegacion() {
  const [abierto, setAbierto] = useState(false)
  const cajonRef = useRef<HTMLElement>(null)
  const disparadorRef = useRef<HTMLButtonElement>(null)

  const abrir = useCallback(() => setAbierto(true), [])
  const cerrar = useCallback(() => setAbierto(false), [])
  const alternar = useCallback(() => setAbierto((v) => !v), [])

  // Devolver el foco a quien abrió el cajón. Sin esto, cerrarlo deja al
  // teclado al principio del documento.
  useEffect(() => {
    if (abierto) return
    disparadorRef.current?.focus()
    // Solo cuando pasa de abierto a cerrado; en el primer render no hay nada
    // que devolver, y enfocar el botón de menú al cargar sería desconcertante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto])

  useEffect(() => {
    if (!abierto) return

    const cajon = cajonRef.current
    // El primer enlace recibe el foco al abrir, para no obligar a tabular
    // desde el principio del documento.
    cajon?.querySelector<HTMLElement>(SELECTOR_ENFOCABLES)?.focus()

    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        cerrar()
        return
      }
      if (evento.key !== 'Tab' || !cajon) return

      const enfocables = Array.from(cajon.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES))
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
  }, [abierto, cerrar])

  return { abierto, abrir, cerrar, alternar, cajonRef, disparadorRef }
}

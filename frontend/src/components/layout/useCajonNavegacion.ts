import { useCallback, useEffect, useState } from 'react'

import { useFocusTrap } from '@/hooks/useFocusTrap'
import { DESDE_TABLET } from '@/hooks/useMediaQuery'

/**
 * Cajón de navegación para pantallas estrechas.
 *
 * El foco atrapado (Escape, confinamiento del tabulador, devolución de foco)
 * vive en `useFocusTrap`. Este hook solo añade el
 * estado de abierto/cerrado por encima. El "clic fuera" cierra el cajón
 * porque el fondo oscurecido en `RutaProtegida.tsx` tiene su propio
 * `onClick`, no porque este hook lo escuche.
 */
export function useCajonNavegacion() {
  const [abierto, setAbierto] = useState(false)

  const cerrar = useCallback(() => setAbierto(false), [])
  const alternar = useCallback(() => setAbierto((v) => !v), [])

  // Al ensanchar a tablet aparece la barra fija y el cajón deja de pintarse
  // (`md:hidden`): se cierra para no dejar el foco atrapado en algo invisible.
  useEffect(() => {
    const lista = window.matchMedia(DESDE_TABLET)
    const alCambiar = (evento: MediaQueryListEvent) => {
      if (evento.matches) setAbierto(false)
    }
    lista.addEventListener('change', alCambiar)
    return () => lista.removeEventListener('change', alCambiar)
  }, [])

  const { contenedorRef: cajonRef, disparadorRef } = useFocusTrap<HTMLElement, HTMLButtonElement>(
    abierto,
    cerrar,
  )

  return { abierto, cerrar, alternar, cajonRef, disparadorRef }
}

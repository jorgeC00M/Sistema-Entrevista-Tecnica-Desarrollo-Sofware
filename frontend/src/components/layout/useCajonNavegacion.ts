import { useCallback, useState } from 'react'

import { useFocusTrap } from '@/hooks/useFocusTrap'

/**
 * Cajón de navegación para pantallas estrechas.
 *
 * El foco atrapado (Escape, confinamiento del tabulador, devolución de foco)
 * vive en `useFocusTrap`, compartido con `Modal`. Este hook solo añade el
 * estado de abierto/cerrado por encima. El "clic fuera" cierra el cajón
 * porque el fondo oscurecido en `RutaProtegida.tsx` tiene su propio
 * `onClick`, no porque este hook lo escuche.
 */
export function useCajonNavegacion() {
  const [abierto, setAbierto] = useState(false)

  const abrir = useCallback(() => setAbierto(true), [])
  const cerrar = useCallback(() => setAbierto(false), [])
  const alternar = useCallback(() => setAbierto((v) => !v), [])

  const { contenedorRef: cajonRef, disparadorRef } = useFocusTrap<HTMLElement, HTMLButtonElement>(
    abierto,
    cerrar,
  )

  return { abierto, abrir, cerrar, alternar, cajonRef, disparadorRef }
}

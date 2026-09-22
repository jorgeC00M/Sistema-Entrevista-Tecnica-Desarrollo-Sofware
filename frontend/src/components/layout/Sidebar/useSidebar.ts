import { useEffect, useState } from 'react'
import { matchPath, useLocation } from 'react-router-dom'

import { useCajonNavegacion } from '@/components/layout/useCajonNavegacion'
import { useDestinosDisponibles } from '@/components/layout/useDestinosDisponibles'

/**
 * Todo lo que `RutaProtegida` necesita del sidebar, en un solo hook: antes
 * componía tres hooks por separado directamente en el componente.
 */
export function useSidebar() {
  const [plegado, setPlegado] = useState(false)
  const { pathname } = useLocation()
  const cajon = useCajonNavegacion()
  const { enCurso: entrevistaEnCurso, ultimaFinalizada } = useDestinosDisponibles()

  // Modo enfoque: colapsa al entrar a la conversación de una entrevista.
  //
  // Se dispara solo cuando `pathname` cambia — es decir, al entrar. Las 5
  // preguntas de una entrevista son una sola pantalla, sin navegación entre
  // ellas, así que mientras el estudiante siga ahí el efecto no se repite: si
  // reabre el sidebar a mano, nada lo vuelve a colapsar hasta que cambie de
  // ruta. Al salir tampoco se fuerza nada — el sidebar queda como se dejó.
  // Al entrar a una entrevista nueva, `pathname` cambia de nuevo y se
  // reaplica el colapso.
  useEffect(() => {
    if (matchPath('/entrevista/:id', pathname)) setPlegado(true)
  }, [pathname])

  return {
    plegado,
    alternarPlegado: () => setPlegado((v) => !v),
    entrevistaEnCurso,
    ultimaFinalizada,
    cajon,
  }
}

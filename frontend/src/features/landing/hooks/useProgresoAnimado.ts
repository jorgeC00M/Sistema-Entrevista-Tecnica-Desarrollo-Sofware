import { useEffect, useRef, useState } from 'react'

import { prefiereMovimientoReducido } from '@/features/landing/hooks/useRevelarAlEntrar'

/**
 * Anima un valor de 0 a `destino` con easing, activado por `activo`.
 *
 * Un solo primitivo para los cuatro contadores de la franja de datos, el
 * medidor circular y las barras de rúbrica de "Qué recibes": todos son la
 * misma operación (animar un número en el tiempo desde que entra en
 * pantalla), solo cambia cómo cada consumidor traduce el valor intermedio
 * (texto, `stroke-dashoffset`, `width%`). Con movimiento reducido salta
 * directo al valor final, sin animar.
 */
export function useProgresoAnimado(destino: number, activo: boolean, duracionMs = 1400): number {
  const [valor, setValor] = useState(0)
  const yaAnimoRef = useRef(false)

  useEffect(() => {
    if (!activo || yaAnimoRef.current) return
    yaAnimoRef.current = true

    if (prefiereMovimientoReducido()) {
      setValor(destino)
      return
    }

    let frame: number
    const inicio = performance.now()
    const paso = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracionMs, 1)
      const facilitado = 1 - Math.pow(1 - progreso, 3)
      setValor(Math.round(destino * facilitado))
      if (progreso < 1) frame = requestAnimationFrame(paso)
    }
    frame = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(frame)
  }, [activo, destino, duracionMs])

  return valor
}

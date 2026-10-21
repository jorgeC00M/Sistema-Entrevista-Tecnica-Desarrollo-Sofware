import { useCallback, useEffect, useRef, useState } from 'react'

import { prefiereMovimientoReducido } from '@/lib/movimiento'

interface ResultadoCarrusel {
  indice: number
  maxIndice: number
  ir: (i: number) => void
  siguiente: () => void
  anterior: () => void
  pausar: () => void
  reanudar: () => void
}

/**
 * Índice + avance automático + pausa de un carrusel — sin JSX, el
 * componente solo renderiza. `total`/`porVista` deciden cuántos "grupos"
 * hay; cada navegación (manual o automática) reinicia el temporizador,
 * igual que el mockup de referencia. Sin avance automático si el visitante
 * tiene activado movimiento reducido.
 */
export function useCarrusel(total: number, porVista: number, duracionMs: number): ResultadoCarrusel {
  const maxIndice = Math.max(0, total - porVista)
  const [indice, setIndiceRaw] = useState(0)
  const pausadoRef = useRef(false)

  const ir = useCallback(
    (i: number) => {
      setIndiceRaw(i > maxIndice ? 0 : i < 0 ? maxIndice : i)
    },
    [maxIndice],
  )

  // El total puede cambiar (catálogo recién cargado, o cambia el ancho de
  // ventana) — si el índice actual ya no cabe, se recorta al máximo válido.
  useEffect(() => {
    setIndiceRaw((i) => Math.min(i, maxIndice))
  }, [maxIndice])

  useEffect(() => {
    if (prefiereMovimientoReducido() || maxIndice === 0) return
    const id = window.setInterval(() => {
      if (!pausadoRef.current) ir(indice >= maxIndice ? 0 : indice + 1)
    }, duracionMs)
    return () => window.clearInterval(id)
  }, [indice, maxIndice, duracionMs, ir])

  return {
    indice,
    maxIndice,
    ir,
    siguiente: () => ir(indice + 1),
    anterior: () => ir(indice - 1),
    pausar: () => {
      pausadoRef.current = true
    },
    reanudar: () => {
      pausadoRef.current = false
    },
  }
}

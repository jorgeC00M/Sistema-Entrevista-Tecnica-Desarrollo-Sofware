import { useLayoutEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

import { prefiereMovimientoReducido } from '@/lib/movimiento'
import { recortar } from '@/lib/paginacion'

/**
 * Pagina una lista en el cliente con la página en `?pagina=`, para que recargar
 * o volver con "atrás" la conserve. Cambiar de página apila una entrada en el
 * historial del navegador y lleva el foco a `refInicio` (la tabla), para que el
 * teclado no quede en un botón de páginas que ya no corresponde; al llegar a la
 * pantalla el foco se queda donde lo deja la navegación.
 *
 * Lo usan las dos tablas de historial: entrevistas y análisis de CV.
 */
export function usePaginaEnLaUrl<T>(lista: T[], porPagina: number) {
  const [parametros, setParametros] = useSearchParams()
  const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina))
  const pagina = recortar(Number(parametros.get('pagina') ?? 1), totalPaginas)
  const filas = lista.slice((pagina - 1) * porPagina, pagina * porPagina)

  const refInicio = useRef<HTMLDivElement>(null)
  const moverFoco = useRef(false)

  useLayoutEffect(() => {
    if (!moverFoco.current) return
    moverFoco.current = false
    refInicio.current?.focus({ preventScroll: true })
    refInicio.current?.scrollIntoView({ behavior: prefiereMovimientoReducido() ? 'auto' : 'smooth', block: 'start' })
  }, [pagina])

  const cambiarPagina = (nueva: number) => {
    moverFoco.current = true
    setParametros(
      (previos) => {
        const siguientes = new URLSearchParams(previos)
        if (nueva === 1) siguientes.delete('pagina')
        else siguientes.set('pagina', String(nueva))
        return siguientes
      },
      { preventScrollReset: true },
    )
  }

  return { pagina, totalPaginas, filas, refInicio, cambiarPagina }
}

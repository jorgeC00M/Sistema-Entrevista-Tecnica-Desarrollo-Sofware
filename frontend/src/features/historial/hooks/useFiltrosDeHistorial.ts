import { useSearchParams } from 'react-router-dom'

import {
  type FiltroDeEstado,
  type FiltroDeNivel,
  estadoDesdeURL,
  filtrarEntrevistas,
  nivelDesdeURL,
} from '@/features/historial/historial'
import type { Entrevista } from '@/types/entrevista'

export type ClaveDeFiltro = 'q' | 'estado' | 'nivel'

/** Valor de cada filtro que equivale a "sin filtrar": no se escribe en la URL. */
const SIN_FILTRO: Record<ClaveDeFiltro, string> = { q: '', estado: 'todos', nivel: 'todos' }

export interface FiltrosDeHistorial {
  texto: string
  estado: FiltroDeEstado
  nivel: FiltroDeNivel
  /** Las entrevistas que pasan los filtros: las que pintan la tabla y los gráficos. */
  filtradas: Entrevista[]
  cambiar: (clave: ClaveDeFiltro, valor: string) => void
  limpiar: () => void
}

/**
 * Los filtros del historial, leídos de la URL (`?q=`, `?estado=`, `?nivel=`)
 * y aplicados una sola vez: la tabla y los gráficos reciben la misma lista,
 * así que lo que se dibuja es exactamente lo que se ve en la tabla. Los
 * niveles válidos vienen del catálogo (`codigosDeNivel`).
 *
 * Cambiar un filtro reemplaza la entrada del historial del navegador (no se
 * apila una por letra) y borra `?pagina=`, para volver a la primera página.
 */
export function useFiltrosDeHistorial(
  entrevistas: Entrevista[],
  codigosDeNivel: readonly string[],
): FiltrosDeHistorial {
  const [parametros, setParametros] = useSearchParams()
  const texto = parametros.get('q') ?? ''
  const estado = estadoDesdeURL(parametros.get('estado'))
  const nivel = nivelDesdeURL(parametros.get('nivel'), codigosDeNivel)

  const reescribir = (cambio: (siguientes: URLSearchParams) => void) =>
    setParametros(
      (previos) => {
        const siguientes = new URLSearchParams(previos)
        cambio(siguientes)
        siguientes.delete('pagina')
        return siguientes
      },
      { replace: true, preventScrollReset: true },
    )

  return {
    texto,
    estado,
    nivel,
    filtradas: filtrarEntrevistas(entrevistas, texto, estado, nivel),
    cambiar: (clave, valor) =>
      reescribir((siguientes) => {
        if (valor === SIN_FILTRO[clave]) siguientes.delete(clave)
        else siguientes.set(clave, valor)
      }),
    limpiar: () =>
      reescribir((siguientes) => {
        for (const clave of Object.keys(SIN_FILTRO)) siguientes.delete(clave)
      }),
  }
}

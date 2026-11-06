import { useSearchParams } from 'react-router-dom'

import { type FiltroDeNivel, filtrarEntrevistas, nivelDesdeURL } from '@/features/historial/historial'
import type { Entrevista } from '@/types/entrevista'

type ClaveDeFiltro = 'q' | 'nivel'

/** Valor de cada filtro que equivale a "sin filtrar": no se escribe en la URL. */
const SIN_FILTRO: Record<ClaveDeFiltro, string> = { q: '', nivel: 'todos' }

export interface FiltrosDeHistorial {
  texto: string
  nivel: FiltroDeNivel
  /** Las entrevistas que pasan los filtros: las que pinta la tabla. */
  filtradas: Entrevista[]
  cambiar: (clave: ClaveDeFiltro, valor: string) => void
  limpiar: () => void
}

/**
 * Los filtros del historial, leídos de la URL (`?q=` y `?nivel=`) y aplicados
 * una sola vez para la tabla. (Las gráficas, que antes recibían la misma lista,
 * se mudaron al Inicio y no se filtran.) Los niveles válidos vienen del catálogo (`codigosDeNivel`). Un `?estado=` de
 * una dirección antigua se ignora: ya no hay filtro de estado.
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
    nivel,
    filtradas: filtrarEntrevistas(entrevistas, texto, nivel),
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

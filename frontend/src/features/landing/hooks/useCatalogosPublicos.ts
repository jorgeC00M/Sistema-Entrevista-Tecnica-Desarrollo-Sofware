import { useEffect, useState } from 'react'

import { obtenerCatalogosPublicos } from '@/api/catalogos'
import { ErrorAPI } from '@/api/client'
import type { CatalogosPublicos } from '@/types/catalogos'

interface EstadoCatalogosPublicos {
  catalogos: CatalogosPublicos | null
  cargando: boolean
  error: string
}

/**
 * Catálogo para la landing.
 *
 * A diferencia de la pantalla de selección, aquí un fallo no es fatal: la
 * landing tiene sentido sin la sección de áreas, así que el consumidor la
 * omite en lugar de bloquear la página entera.
 */
export function useCatalogosPublicos(): EstadoCatalogosPublicos {
  const [catalogos, setCatalogos] = useState<CatalogosPublicos | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    obtenerCatalogosPublicos()
      .then((datos) => {
        if (!cancelado) setCatalogos(datos)
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudo cargar el catálogo.')
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { catalogos, cargando: !catalogos && !error, error }
}

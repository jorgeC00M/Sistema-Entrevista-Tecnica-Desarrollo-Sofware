import { useEffect, useState } from 'react'

import { obtenerCatalogos } from '@/api/catalogos'
import { ErrorAPI } from '@/api/client'
import type { Catalogos } from '@/types/catalogos'

interface EstadoCatalogos {
  catalogos: Catalogos | null
  cargando: boolean
  error: string
}

/**
 * Pide el catálogo al montar, sin caché global.
 *
 * Cachearlo al iniciar sesión obligaría a invalidarlo cuando se da de baja un
 * área desde el admin, que es justo el caso que se quiere soportar. Son seis
 * filas y una sola pantalla las consume.
 */
export function useCatalogos(): EstadoCatalogos {
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    obtenerCatalogos()
      .then((datos) => {
        if (!cancelado) setCatalogos(datos)
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudieron cargar las opciones.')
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { catalogos, cargando: !catalogos && !error, error }
}

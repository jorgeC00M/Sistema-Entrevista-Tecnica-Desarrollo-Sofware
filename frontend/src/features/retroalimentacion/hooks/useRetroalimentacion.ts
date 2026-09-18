import { useEffect, useState } from 'react'

import { ErrorAPI } from '@/api/client'
import { obtenerRetroalimentacion } from '@/api/evaluaciones'
import type { RetroalimentacionAcumulada } from '@/types/evaluacion'

interface Estado {
  datos: RetroalimentacionAcumulada | null
  cargando: boolean
  error: string
}

export function useRetroalimentacion(): Estado {
  const [datos, setDatos] = useState<RetroalimentacionAcumulada | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    obtenerRetroalimentacion()
      .then((res) => {
        if (!cancelado) setDatos(res)
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(
            err instanceof ErrorAPI ? err.message : 'No se pudo cargar tu retroalimentación.',
          )
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  return { datos, cargando: !datos && !error, error }
}

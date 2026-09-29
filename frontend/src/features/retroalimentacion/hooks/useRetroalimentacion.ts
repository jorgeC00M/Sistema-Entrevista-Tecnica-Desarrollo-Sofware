import { obtenerRetroalimentacion } from '@/api/evaluaciones'
import { usePeticion } from '@/hooks/usePeticion'
import type { RetroalimentacionAcumulada } from '@/types/evaluacion'

interface Estado {
  datos: RetroalimentacionAcumulada | null
  cargando: boolean
  error: string
}

export function useRetroalimentacion(): Estado {
  const { datos, cargando, error } = usePeticion<RetroalimentacionAcumulada>(
    'retroalimentacion',
    (signal) => obtenerRetroalimentacion(signal),
    { mensajeDeError: 'No se pudo cargar tu retroalimentación.' },
  )

  return { datos, cargando, error }
}

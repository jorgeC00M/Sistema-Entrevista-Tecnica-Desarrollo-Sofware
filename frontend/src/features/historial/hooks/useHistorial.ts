import { obtenerHistorial } from '@/api/entrevistas'
import { usePeticion } from '@/hooks/usePeticion'
import type { Entrevista } from '@/types/entrevista'

interface Estado {
  entrevistas: Entrevista[] | null
  cargando: boolean
  error: string
}

/**
 * El historial de entrevistas del usuario. Comparte la caché de `usePeticion`
 * (clave `historial`) con el sidebar, que pide la misma lista para encontrar
 * la entrevista en curso. La tabla y los gráficos se arman con ella; no hay
 * otra petición de estadísticas.
 */
export function useHistorial(): Estado {
  const historial = usePeticion<Entrevista[]>('historial', (signal) => obtenerHistorial(signal), {
    mensajeDeError: 'No se pudo cargar tu historial.',
  })

  return { entrevistas: historial.datos, cargando: historial.cargando, error: historial.error }
}

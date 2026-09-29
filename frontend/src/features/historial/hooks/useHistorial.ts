import { obtenerHistorial } from '@/api/entrevistas'
import { obtenerEstadisticas } from '@/api/evaluaciones'
import { usePeticion } from '@/hooks/usePeticion'
import type { Entrevista } from '@/types/entrevista'
import type { Estadisticas } from '@/types/evaluacion'

interface Estado {
  entrevistas: Entrevista[] | null
  estadisticas: Estadisticas | null
  cargando: boolean
  error: string
}

/**
 * Historial y estadísticas, que la página pedía en paralelo desde su propio
 * `useEffect`.
 *
 * Son dos endpoints independientes y encadenarlos solo duplicaría la espera,
 * así que se siguen pidiendo a la vez; lo que cambia es que ahora comparten
 * la caché de `usePeticion` con el sidebar, que pide el mismo historial.
 */
export function useHistorial(): Estado {
  const historial = usePeticion<Entrevista[]>('historial', (signal) => obtenerHistorial(signal), {
    mensajeDeError: 'No se pudo cargar tu historial.',
  })

  const estadisticas = usePeticion<Estadisticas>(
    'estadisticas',
    (signal) => obtenerEstadisticas(signal),
    { mensajeDeError: 'No se pudo cargar tu historial.' },
  )

  return {
    entrevistas: historial.datos,
    estadisticas: estadisticas.datos,
    cargando: historial.cargando || estadisticas.cargando,
    error: historial.error || estadisticas.error,
  }
}

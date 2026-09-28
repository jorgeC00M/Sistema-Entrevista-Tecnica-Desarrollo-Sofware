import type { Estadisticas, RetroalimentacionAcumulada } from '@/types/evaluacion'

import { peticion } from './client'

export function obtenerEstadisticas(signal?: AbortSignal): Promise<Estadisticas> {
  return peticion<Estadisticas>('/api/estadisticas/', { signal })
}

export function obtenerRetroalimentacion(
  signal?: AbortSignal,
): Promise<RetroalimentacionAcumulada> {
  return peticion<RetroalimentacionAcumulada>('/api/estadisticas/retroalimentacion/', { signal })
}

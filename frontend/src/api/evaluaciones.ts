import type { RetroalimentacionAcumulada } from '@/types/evaluacion'

import { peticion } from './client'

export function obtenerRetroalimentacion(
  signal?: AbortSignal,
): Promise<RetroalimentacionAcumulada> {
  return peticion<RetroalimentacionAcumulada>('/api/estadisticas/retroalimentacion/', { signal })
}

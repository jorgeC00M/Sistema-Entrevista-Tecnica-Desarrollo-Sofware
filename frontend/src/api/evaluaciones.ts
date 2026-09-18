import type { Estadisticas, RetroalimentacionAcumulada } from '@/types/evaluacion'

import { peticion } from './client'

export function obtenerEstadisticas(): Promise<Estadisticas> {
  return peticion<Estadisticas>('/api/estadisticas/')
}

export function obtenerRetroalimentacion(): Promise<RetroalimentacionAcumulada> {
  return peticion<RetroalimentacionAcumulada>('/api/estadisticas/retroalimentacion/')
}

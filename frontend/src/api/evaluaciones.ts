import type { Estadisticas } from '@/types/evaluacion'

import { peticion } from './client'

export function obtenerEstadisticas(): Promise<Estadisticas> {
  return peticion<Estadisticas>('/api/estadisticas/')
}

import { peticion } from './cliente'

export function obtenerEstadisticas() {
  return peticion('/api/estadisticas/')
}

import type {
  DatosIniciarEntrevista,
  Entrevista,
  RespuestaEstadoEntrevista,
  RespuestaIniciarEntrevista,
  RespuestaResponder,
  RespuestaResultados,
} from '@/types/entrevista'

import { peticion } from './client'

// Estas rutas SÍ llevan barra final, a diferencia de las de auth.

export function iniciarEntrevista({
  puesto,
  nivel,
  tecnologia,
}: DatosIniciarEntrevista): Promise<RespuestaIniciarEntrevista> {
  return peticion<RespuestaIniciarEntrevista>('/api/entrevistas/', {
    method: 'POST',
    // La tecnología se omite del cuerpo cuando no se eligió: el serializer la
    // declara opcional, y mandar null o cadena vacía sería decir otra cosa.
    body: tecnologia ? { puesto, nivel, tecnologia } : { puesto, nivel },
  })
}

// El endpoint no está paginado: devuelve el array desnudo. Si algún día se
// pagina, este tipo pasa a ser falso en silencio y `historial.find(...)`
// reventaría en tiempo de ejecución — habría que cambiarlo aquí también.
export function obtenerHistorial(signal?: AbortSignal): Promise<Entrevista[]> {
  return peticion<Entrevista[]>('/api/entrevistas/', { signal })
}

export function obtenerEstado(
  id: number | string,
  signal?: AbortSignal,
): Promise<RespuestaEstadoEntrevista> {
  return peticion<RespuestaEstadoEntrevista>(`/api/entrevistas/${id}/`, { signal })
}

export function responder(id: number | string, respuesta: string): Promise<RespuestaResponder> {
  return peticion<RespuestaResponder>(`/api/entrevistas/${id}/responder/`, {
    method: 'POST',
    body: { respuesta },
  })
}

export function obtenerResultados(
  id: number | string,
  signal?: AbortSignal,
): Promise<RespuestaResultados> {
  return peticion<RespuestaResultados>(`/api/entrevistas/${id}/resultados/`, { signal })
}

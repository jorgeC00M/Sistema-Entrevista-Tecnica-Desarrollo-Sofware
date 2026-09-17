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
  area,
  nivel,
}: DatosIniciarEntrevista): Promise<RespuestaIniciarEntrevista> {
  return peticion<RespuestaIniciarEntrevista>('/api/entrevistas/', {
    method: 'POST',
    body: { area, nivel },
  })
}

export function obtenerHistorial(): Promise<Entrevista[]> {
  return peticion<Entrevista[]>('/api/entrevistas/')
}

export function obtenerEstado(id: number | string): Promise<RespuestaEstadoEntrevista> {
  return peticion<RespuestaEstadoEntrevista>(`/api/entrevistas/${id}/`)
}

export function responder(id: number | string, respuesta: string): Promise<RespuestaResponder> {
  return peticion<RespuestaResponder>(`/api/entrevistas/${id}/responder/`, {
    method: 'POST',
    body: { respuesta },
  })
}

export function obtenerResultados(id: number | string): Promise<RespuestaResultados> {
  return peticion<RespuestaResultados>(`/api/entrevistas/${id}/resultados/`)
}

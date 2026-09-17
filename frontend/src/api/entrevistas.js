import { peticion } from './cliente'

export function iniciarEntrevista({ area, nivel }) {
  return peticion('/api/entrevistas/', { method: 'POST', body: { area, nivel } })
}

export function obtenerHistorial() {
  return peticion('/api/entrevistas/')
}

export function obtenerEstado(id) {
  return peticion(`/api/entrevistas/${id}/`)
}

export function responder(id, respuesta) {
  return peticion(`/api/entrevistas/${id}/responder/`, { method: 'POST', body: { respuesta } })
}

export function obtenerResultados(id) {
  return peticion(`/api/entrevistas/${id}/resultados/`)
}

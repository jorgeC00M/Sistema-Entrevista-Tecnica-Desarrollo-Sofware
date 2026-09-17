import type { FechaISO } from './api'

export interface Usuario {
  id: number
  email: string
  nombre_completo: string
  /** Cadena vacía cuando no se indicó: el campo es opcional pero no nulo. */
  carnet: string
  date_joined: FechaISO
  last_login: FechaISO | null
}

export interface ParDeTokens {
  access: string
  refresh: string
}

export interface DatosDeRegistro {
  email: string
  password: string
  nombreCompleto: string
  carnet?: string
}

export interface Credenciales {
  email: string
  password: string
}

import type { FechaISO } from './api'

export interface Usuario {
  id: number
  email: string
  nombre_completo: string
  /** Cadena vacía cuando no se indicó: el campo es opcional pero no nulo. */
  carnet: string
  date_joined: FechaISO
}

export interface ParDeTokens {
  access: string
  refresh: string
}

// El carnet no se pide al registrarse: es un dato opcional del perfil, que
// el formulario dejó de solicitar para no alargar el alta.
export interface DatosDeRegistro {
  email: string
  password: string
  nombreCompleto: string
}

export interface Credenciales {
  email: string
  password: string
}

import type { Credenciales, DatosDeRegistro, ParDeTokens, Usuario } from '@/types/usuario'

import { guardarTokens, limpiarTokens, peticion } from './client'

// Las rutas de auth van SIN barra final; las de entrevistas con ella.
// Es asimétrico pero coincide con backend/config/urls.py.

export async function registrar({
  email,
  password,
  nombreCompleto,
  carnet,
}: DatosDeRegistro): Promise<ParDeTokens> {
  const datos = await peticion<ParDeTokens>('/api/auth/registro', {
    method: 'POST',
    autenticado: false,
    body: { email, password, nombre_completo: nombreCompleto, carnet },
  })
  guardarTokens(datos)
  return datos
}

export async function iniciarSesion({ email, password }: Credenciales): Promise<ParDeTokens> {
  const datos = await peticion<ParDeTokens>('/api/auth/token', {
    method: 'POST',
    autenticado: false,
    body: { email, password },
  })
  guardarTokens(datos)
  return datos
}

export async function iniciarSesionConGoogle(idToken: string): Promise<ParDeTokens> {
  const datos = await peticion<ParDeTokens>('/api/auth/google', {
    method: 'POST',
    autenticado: false,
    body: { id_token: idToken },
  })
  guardarTokens(datos)
  return datos
}

export function obtenerPerfil(): Promise<Usuario> {
  return peticion<Usuario>('/api/auth/perfil')
}

export function cerrarSesion(): void {
  limpiarTokens()
}

import { guardarTokens, limpiarTokens, peticion } from './cliente'

export async function registrar({ email, password, nombreCompleto, carnet }) {
  const datos = await peticion('/api/auth/registro', {
    method: 'POST',
    autenticado: false,
    body: { email, password, nombre_completo: nombreCompleto, carnet },
  })
  guardarTokens(datos)
  return datos
}

export async function iniciarSesion({ email, password }) {
  const datos = await peticion('/api/auth/token', {
    method: 'POST',
    autenticado: false,
    body: { email, password },
  })
  guardarTokens(datos)
  return datos
}

export async function iniciarSesionConGoogle(idToken) {
  const datos = await peticion('/api/auth/google', {
    method: 'POST',
    autenticado: false,
    body: { id_token: idToken },
  })
  guardarTokens(datos)
  return datos
}

export function obtenerPerfil() {
  return peticion('/api/auth/perfil')
}

export function cerrarSesion() {
  limpiarTokens()
}

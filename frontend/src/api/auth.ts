import type { Credenciales, DatosDeRegistro, ParDeTokens, Usuario } from '@/types/usuario'

import { guardarTokens, limpiarTokens, peticion } from './client'

// Las rutas de auth van SIN barra final; las de entrevistas con ella.
// Es asimétrico pero coincide con backend/config/urls.py.

// El mapa inverso de la conversión que ya hace `registrar()` al construir el
// body: el backend valida y responde en snake_case, el formulario vive en
// camelCase. Vive aquí, junto a la conversión de ida, en vez de en un
// conversor genérico snake→camel: un conversor automático funcionaría por
// accidente en los campos que ya coinciden (`email`) y fallaría en silencio
// en los que no se declaren aquí.
const CAMPO_DEL_FORMULARIO_DE_REGISTRO: Record<string, string> = {
  nombre_completo: 'nombreCompleto',
  email: 'email',
  password: 'password',
}

/** Traduce una clave de error de `registrar()` al nombre que usa el formulario. */
export function campoDeRegistro(campoDelBackend: string): string | undefined {
  return CAMPO_DEL_FORMULARIO_DE_REGISTRO[campoDelBackend]
}

export async function registrar({
  email,
  password,
  nombreCompleto,
}: DatosDeRegistro): Promise<ParDeTokens> {
  const datos = await peticion<ParDeTokens>('/api/auth/registro', {
    method: 'POST',
    autenticado: false,
    body: { email, password, nombre_completo: nombreCompleto },
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

/**
 * Cambia la contraseña. El servidor cierra las demás sesiones y devuelve un
 * par de tokens nuevo para esta: se guarda, y el usuario sigue conectado.
 * Los errores llegan por campo (`actual`, `nueva`), igual que el registro.
 */
export async function cambiarContrasena({ actual, nueva }: { actual: string; nueva: string }): Promise<void> {
  const datos = await peticion<ParDeTokens>('/api/auth/contrasena', {
    method: 'POST',
    body: { actual, nueva },
  })
  guardarTokens(datos)
}

export function cerrarSesion(): void {
  limpiarTokens()
}

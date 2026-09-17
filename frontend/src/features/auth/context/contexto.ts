import { createContext } from 'react'

import type { Credenciales, DatosDeRegistro, Usuario } from '@/types/usuario'

export interface ContextoDeAuth {
  usuario: Usuario | null
  /** `true` mientras se resuelve si hay sesión; evita parpadear hacia /login. */
  cargando: boolean
  iniciarSesion: (credenciales: Credenciales) => Promise<void>
  registrar: (datos: DatosDeRegistro) => Promise<void>
  iniciarSesionConGoogle: (idToken: string) => Promise<void>
  cerrarSesion: () => void
}

export const AuthContext = createContext<ContextoDeAuth | null>(null)

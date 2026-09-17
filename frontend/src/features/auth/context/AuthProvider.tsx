import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import * as authApi from '@/api/auth'
import { haySesion } from '@/api/client'
import { AuthContext } from '@/features/auth/context/contexto'
import type { ContextoDeAuth } from '@/features/auth/context/contexto'
import type { Credenciales, DatosDeRegistro, Usuario } from '@/types/usuario'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  const cargarPerfil = useCallback(async () => {
    if (!haySesion()) {
      setUsuario(null)
      setCargando(false)
      return
    }
    try {
      const perfil = await authApi.obtenerPerfil()
      setUsuario(perfil)
    } catch {
      setUsuario(null)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void cargarPerfil()
  }, [cargarPerfil])

  const iniciarSesion = useCallback(
    async (credenciales: Credenciales) => {
      await authApi.iniciarSesion(credenciales)
      await cargarPerfil()
    },
    [cargarPerfil],
  )

  const registrar = useCallback(
    async (datos: DatosDeRegistro) => {
      await authApi.registrar(datos)
      await cargarPerfil()
    },
    [cargarPerfil],
  )

  const iniciarSesionConGoogle = useCallback(
    async (idToken: string) => {
      await authApi.iniciarSesionConGoogle(idToken)
      await cargarPerfil()
    },
    [cargarPerfil],
  )

  const cerrarSesion = useCallback(() => {
    authApi.cerrarSesion()
    setUsuario(null)
  }, [])

  // Sin useMemo, cada render del proveedor crea un objeto nuevo y vuelve a
  // renderizar toda la aplicación aunque no haya cambiado nada.
  const valor = useMemo<ContextoDeAuth>(
    () => ({ usuario, cargando, iniciarSesion, registrar, iniciarSesionConGoogle, cerrarSesion }),
    [usuario, cargando, iniciarSesion, registrar, iniciarSesionConGoogle, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

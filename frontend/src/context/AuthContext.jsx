import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth'
import { haySesion } from '../api/cliente'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
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
    cargarPerfil()
  }, [cargarPerfil])

  const iniciarSesion = useCallback(async (credenciales) => {
    await authApi.iniciarSesion(credenciales)
    await cargarPerfil()
  }, [cargarPerfil])

  const registrar = useCallback(async (datos) => {
    await authApi.registrar(datos)
    await cargarPerfil()
  }, [cargarPerfil])

  const iniciarSesionConGoogle = useCallback(async (idToken) => {
    await authApi.iniciarSesionConGoogle(idToken)
    await cargarPerfil()
  }, [cargarPerfil])

  const cerrarSesion = useCallback(() => {
    authApi.cerrarSesion()
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, iniciarSesion, registrar, iniciarSesionConGoogle, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return contexto
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

import * as authApi from '@/api/auth'
import { alPerderSesion, haySesion } from '@/api/client'
import { AuthContext } from '@/features/auth/context/contexto'
import type { ContextoDeAuth } from '@/features/auth/context/contexto'
import { invalidarCache } from '@/hooks/usePeticion'
import type { Credenciales, DatosDeRegistro, Usuario } from '@/types/usuario'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

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

  // Único punto de salida: lo usan tanto el botón de cerrar sesión como el
  // aviso del cliente HTTP cuando el refresco del token falla. La caché de
  // `usePeticion` vive a nivel de módulo, así que sin limpiarla el siguiente
  // usuario que entre en esta misma pestaña vería por unos segundos el
  // historial del anterior.
  const terminarSesion = useCallback(() => {
    invalidarCache()
    // `flushSync` fuerza que el cambio a `usuario = null` se aplique y
    // termine de renderizar ANTES de seguir — incluido el redirect pasivo a
    // /login que dispara `RutaProtegida` al quedarse sin sesión. Sin esto,
    // ese redirect y el `navigate('/')` de abajo compiten dentro del mismo
    // batch de React y no siempre gana el que queremos.
    flushSync(() => {
      setUsuario(null)
    })
    // Se ejecuta después de que /login ya se aplicó (si llegó a aplicarse):
    // al ser el último `replace` en correr, es el que queda. `replace` para
    // que "atrás" no vuelva al dashboard tras salir. Vive aquí (no en cada
    // botón que cierra sesión) para que cualquier punto de logout, presente
    // o futuro, termine igual: en la landing.
    navigate('/', { replace: true })
  }, [navigate])

  const cerrarSesion = useCallback(() => {
    authApi.cerrarSesion()
    terminarSesion()
  }, [terminarSesion])

  // El cliente HTTP borra los tokens cuando el refresco falla, pero no puede
  // navegar por su cuenta: sin este puente el usuario se quedaba en el
  // dashboard viendo errores hasta que recargara la página a mano.
  useEffect(() => {
    alPerderSesion(terminarSesion)
    return () => alPerderSesion(null)
  }, [terminarSesion])

  // Sin useMemo, cada render del proveedor crea un objeto nuevo y vuelve a
  // renderizar toda la aplicación aunque no haya cambiado nada.
  const valor = useMemo<ContextoDeAuth>(
    () => ({ usuario, cargando, iniciarSesion, registrar, iniciarSesionConGoogle, cerrarSesion }),
    [usuario, cargando, iniciarSesion, registrar, iniciarSesionConGoogle, cerrarSesion],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

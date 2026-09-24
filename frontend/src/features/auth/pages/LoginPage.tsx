import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import FormularioLogin from '@/features/auth/components/FormularioLogin'
import TarjetaAuth from '@/features/auth/components/TarjetaAuth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Credenciales } from '@/types/usuario'

export default function LoginPage() {
  const { iniciarSesion, iniciarSesionConGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const manejarEnvio = async (credenciales: Credenciales) => {
    setError('')
    try {
      await iniciarSesion(credenciales)
      navigate('/')
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo iniciar sesión.')
    }
  }

  const manejarGoogle = async (idToken: string) => {
    setError('')
    try {
      await iniciarSesionConGoogle(idToken)
      navigate('/')
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo iniciar sesión con Google.')
    }
  }

  return (
    <TarjetaAuth
      titulo="Bienvenido"
      subtitulo="Inicia sesión para continuar"
      error={error}
      onCredentialGoogle={manejarGoogle}
      modoGoogle="login"
      etiquetaGoogle="Continuar con Google"
      pregunta="¿No tienes cuenta?"
      textoEnlace="Regístrate"
      rutaEnlace="/registro"
    >
      <FormularioLogin onEnviar={manejarEnvio} />
    </TarjetaAuth>
  )
}

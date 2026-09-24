import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import FormularioRegistro from '@/features/auth/components/FormularioRegistro'
import TarjetaAuth from '@/features/auth/components/TarjetaAuth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { DatosDeRegistro } from '@/types/usuario'

export default function RegistroPage() {
  const { registrar, iniciarSesionConGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const manejarEnvio = async (datos: DatosDeRegistro) => {
    setError('')
    try {
      await registrar(datos)
      navigate('/')
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo completar el registro.')
    }
  }

  const manejarGoogle = async (idToken: string) => {
    setError('')
    try {
      await iniciarSesionConGoogle(idToken)
      navigate('/')
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo continuar con Google.')
    }
  }

  return (
    <TarjetaAuth
      titulo="Crea tu cuenta"
      subtitulo="Para egresados de Ingeniería de Sistemas"
      error={error}
      onCredentialGoogle={manejarGoogle}
      modoGoogle="registro"
      etiquetaGoogle="Registrarse con Google"
      pregunta="¿Ya tienes cuenta?"
      textoEnlace="Inicia sesión"
      rutaEnlace="/login"
    >
      <FormularioRegistro onEnviar={manejarEnvio} />
    </TarjetaAuth>
  )
}

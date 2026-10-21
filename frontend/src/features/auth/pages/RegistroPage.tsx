import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { campoDeRegistro } from '@/api/auth'
import { mensajeDeError, repartirErrores, sinErrorDeCampo } from '@/api/errores'
import FormularioRegistro from '@/features/auth/components/FormularioRegistro'
import TarjetaAuth from '@/features/auth/components/TarjetaAuth'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { DatosDeRegistro } from '@/types/usuario'

export default function RegistroPage() {
  const { registrar, iniciarSesionConGoogle } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [erroresPorCampo, setErroresPorCampo] = useState<Partial<Record<keyof DatosDeRegistro, string>>>(
    {},
  )

  const manejarEnvio = async (datos: DatosDeRegistro) => {
    setError('')
    setErroresPorCampo({})
    try {
      await registrar(datos)
      navigate('/')
    } catch (err) {
      const { general, porCampo } = repartirErrores(
        err,
        'No se pudo completar el registro.',
        campoDeRegistro,
      )
      setError(general)
      setErroresPorCampo(porCampo)
    }
  }

  const manejarGoogle = async (idToken: string) => {
    setError('')
    try {
      await iniciarSesionConGoogle(idToken)
      navigate('/')
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo continuar con Google.'))
    }
  }

  const limpiarErrorDeCampo = (campo: keyof DatosDeRegistro) => {
    setErroresPorCampo((previos) => sinErrorDeCampo(previos, campo))
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
      <FormularioRegistro
        onEnviar={manejarEnvio}
        erroresPorCampo={erroresPorCampo}
        onLimpiarError={limpiarErrorDeCampo}
      />
    </TarjetaAuth>
  )
}

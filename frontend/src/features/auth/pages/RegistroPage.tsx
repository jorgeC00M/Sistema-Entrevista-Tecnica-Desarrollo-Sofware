import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import Alerta from '@/components/ui/Alerta'
import BotonGoogle from '@/features/auth/components/BotonGoogle'
import FormularioRegistro from '@/features/auth/components/FormularioRegistro'
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
    <div className="flex min-h-screen items-center justify-center bg-tinta-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-semibold text-tinta-950">Crear cuenta</h1>
        <p className="mb-6 text-center text-sm text-tinta-500">
          Para egresados de Ingeniería de Sistemas
        </p>

        <div className="rounded-superficie bg-white p-6 shadow-sm ring-1 ring-tinta-100">
          <Alerta tipo="error">{error}</Alerta>

          <FormularioRegistro onEnviar={manejarEnvio} />

          <div className="my-5 flex items-center gap-3 text-xs text-tinta-500">
            <div className="h-px flex-1 bg-tinta-100" />o
            <div className="h-px flex-1 bg-tinta-100" />
          </div>

          <BotonGoogle onCredential={manejarGoogle} />
        </div>

        <p className="mt-6 text-center text-sm text-tinta-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-iris-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

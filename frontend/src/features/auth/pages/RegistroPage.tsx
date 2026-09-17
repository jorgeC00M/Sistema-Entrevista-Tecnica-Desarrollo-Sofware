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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-slate-900">Crear cuenta</h1>
        <p className="mb-6 text-center text-sm text-slate-500">
          Para egresados de Ingeniería de Sistemas
        </p>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Alerta tipo="error">{error}</Alerta>

          <FormularioRegistro onEnviar={manejarEnvio} />

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />o
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <BotonGoogle onCredential={manejarGoogle} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import Alerta from '@/components/ui/Alerta'
import BotonGoogle from '@/features/auth/components/BotonGoogle'
import FormularioLogin from '@/features/auth/components/FormularioLogin'
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-xl font-semibold text-slate-900">Iniciar sesión</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Simulador de Entrevistas Técnicas</p>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <Alerta tipo="error">{error}</Alerta>

          <FormularioLogin onEnviar={manejarEnvio} />

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />o
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <BotonGoogle onCredential={manejarGoogle} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-indigo-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

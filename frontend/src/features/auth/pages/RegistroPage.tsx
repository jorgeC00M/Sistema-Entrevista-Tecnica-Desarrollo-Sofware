import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import Alerta from '@/components/ui/Alerta'
import Icono from '@/components/ui/Icono'
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
      {/* Misma tarjeta de vidrio que LoginPage: bg-white/90 + backdrop-blur,
          igual que HeaderLanding. */}
      <div className="w-full max-w-sm rounded-superficie border border-tinta-100 bg-white/90 p-8 text-center shadow-xl backdrop-blur">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-control bg-iris-50 text-iris-600">
          <Icono nombre="marca" className="h-6 w-6" />
        </span>
        <h1 className="text-headline-xl font-semibold text-tinta-950">Crea tu cuenta</h1>
        <p className="mt-2 text-sm text-tinta-500">Para egresados de Ingeniería de Sistemas</p>

        <div className="mt-4 text-left">
          <Alerta tipo="error">{error}</Alerta>
        </div>

        <FormularioRegistro onEnviar={manejarEnvio} />

        <div className="my-5 flex items-center gap-3 text-xs text-tinta-500">
          <span className="h-px flex-1 bg-tinta-100" />
          <span>o</span>
          <span className="h-px flex-1 bg-tinta-100" />
        </div>

        <BotonGoogle onCredential={manejarGoogle} />

        <p className="mt-6 text-sm text-tinta-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-iris-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}

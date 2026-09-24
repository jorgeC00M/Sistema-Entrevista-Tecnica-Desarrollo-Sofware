import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import Alerta from '@/components/ui/Alerta'
import Icono from '@/components/ui/Icono'
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
    <div className="flex min-h-screen items-center justify-center bg-tinta-50 px-4 py-12">
      {/* Tarjeta de vidrio: mismo patrón bg-white/90 + backdrop-blur que ya
          usa HeaderLanding, no una fórmula nueva. Todo el contenido de la
          vista (marca, título, formulario, alternativa social y el enlace
          de cambio de vista) vive dentro de esta única tarjeta. */}
      <div className="w-full max-w-sm rounded-superficie border border-tinta-100 bg-white/90 p-8 text-center shadow-xl backdrop-blur">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-control bg-iris-50 text-iris-600">
          <Icono nombre="marca" className="h-6 w-6" />
        </span>
        <h1 className="text-headline-xl font-semibold text-tinta-950">Bienvenido</h1>
        <p className="mt-2 text-sm text-tinta-500">Inicia sesión para continuar</p>

        <div className="mt-4 text-left">
          <Alerta tipo="error">{error}</Alerta>
        </div>

        <FormularioLogin onEnviar={manejarEnvio} />

        <div className="my-5 flex items-center gap-3 text-xs text-tinta-500">
          <span className="h-px flex-1 bg-tinta-100" />
          <span>o</span>
          <span className="h-px flex-1 bg-tinta-100" />
        </div>

        <BotonGoogle onCredential={manejarGoogle} />

        <p className="mt-6 text-sm text-tinta-500">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-medium text-iris-600 hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}

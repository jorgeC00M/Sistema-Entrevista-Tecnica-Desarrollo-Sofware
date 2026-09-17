import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alerta from '../components/comunes/Alerta'
import Boton from '../components/comunes/Boton'
import BotonGoogle from '../components/comunes/BotonGoogle'
import { ErrorAPI } from '../api/cliente'
import { useAuth } from '../context/AuthContext'

export default function Registro() {
  const { registrar, iniciarSesionConGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', nombreCompleto: '', carnet: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const actualizar = (campo) => (evento) => setForm((f) => ({ ...f, [campo]: evento.target.value }))

  const manejarEnvio = async (evento) => {
    evento.preventDefault()
    setError('')
    setCargando(true)
    try {
      await registrar(form)
      navigate('/')
    } catch (err) {
      setError(err instanceof ErrorAPI ? err.message : 'No se pudo completar el registro.')
    } finally {
      setCargando(false)
    }
  }

  const manejarGoogle = async (idToken) => {
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

          <form onSubmit={manejarEnvio} className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="nombreCompleto" className="mb-1 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <input
                id="nombreCompleto"
                autoComplete="name"
                required
                value={form.nombreCompleto}
                onChange={actualizar('nombreCompleto')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={actualizar('email')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={form.password}
                onChange={actualizar('password')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">Mínimo 8 caracteres.</p>
            </div>
            <div>
              <label htmlFor="carnet" className="mb-1 block text-sm font-medium text-slate-700">
                Carnet de identidad <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                id="carnet"
                value={form.carnet}
                onChange={actualizar('carnet')}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <Boton type="submit" cargando={cargando} className="w-full">
              Crear cuenta
            </Boton>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            o
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

import { useState } from 'react'
import type { FormEvent } from 'react'

import Boton from '@/components/ui/Boton'
import CampoAuth from '@/components/ui/CampoAuth'
import Icono from '@/components/ui/Icono'

interface Props {
  onEnviar: (credenciales: { email: string; password: string }) => Promise<void>
}

export default function FormularioLogin({ onEnviar }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  // "Recordarme" es solo visual: no existe backend de sesión persistente
  // hoy, así que este estado nunca se envía a onEnviar.
  const [recordarme, setRecordarme] = useState(false)

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setCargando(true)
    try {
      await onEnviar({ email, password })
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="text-left">
      <CampoAuth
        icono={<Icono nombre="correo" />}
        ariaLabel="Correo electrónico"
        placeholder="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <CampoAuth
        icono={<Icono nombre="candado" />}
        ariaLabel="Contraseña"
        placeholder="Contraseña"
        type="password"
        conAlternarPassword
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="mt-1 mb-6 flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-left text-vidrio-texto">
          <input
            type="checkbox"
            checked={recordarme}
            onChange={(e) => setRecordarme(e.target.checked)}
            className="foco-anillo size-4 shrink-0 accent-vidrio-acento"
          />
          Recordarme
        </label>
        {/* Sin destino real todavía: no hay flujo de recuperación de
            contraseña en el backend. Queda visible como en el diseño, sin
            prometer una funcionalidad que no existe. */}
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a href="#" className="foco-anillo rounded-chip font-medium text-vidrio-acento no-underline hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Boton type="submit" tamano="lg" cargando={cargando} className="w-full">
        Iniciar sesión
      </Boton>
    </form>
  )
}

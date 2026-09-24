import { useState } from 'react'
import type { FormEvent } from 'react'

import CampoAuth from '@/features/auth/components/CampoAuth'
import { IconoCandadoAuth, IconoCorreoAuth } from '@/features/auth/components/iconosAuth'

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
        icono={<IconoCorreoAuth />}
        ariaLabel="Correo electrónico"
        placeholder="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <CampoAuth
        icono={<IconoCandadoAuth />}
        ariaLabel="Contraseña"
        placeholder="Contraseña"
        type="password"
        conAlternarPassword
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="mt-1 mb-6 flex items-center justify-between text-[0.88rem]">
        <label className="flex cursor-pointer items-center gap-2 text-left text-[#4a5572]">
          <input
            type="checkbox"
            checked={recordarme}
            onChange={(e) => setRecordarme(e.target.checked)}
            className="h-[17px] w-[17px] shrink-0 accent-[#2b55a3]"
          />
          Recordarme
        </label>
        {/* Sin destino real todavía: no hay flujo de recuperación de
            contraseña en el backend. Queda visible como en el diseño, sin
            prometer una funcionalidad que no existe. */}
        <a href="#" className="font-medium text-[#2b55a3] no-underline hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="flex h-[50px] w-full items-center justify-center rounded-full bg-[#2b55a3] text-[1.05rem] font-semibold text-white transition-colors hover:bg-[#234889] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Iniciar sesión
      </button>
    </form>
  )
}

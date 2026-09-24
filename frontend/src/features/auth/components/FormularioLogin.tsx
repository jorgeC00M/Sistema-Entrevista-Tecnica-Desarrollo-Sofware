import { useState } from 'react'
import type { FormEvent } from 'react'

import Boton from '@/components/ui/Boton'
import Input from '@/components/ui/Input'

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
    <form onSubmit={manejarEnvio} className="mt-4 flex flex-col gap-4">
      <Input
        id="email"
        etiqueta="Correo electrónico"
        type="email"
        icono="correo"
        variante="relleno"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="password"
        etiqueta="Contraseña"
        type="password"
        icono="candado"
        variante="relleno"
        conAlternarPassword
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-tinta-700">
          <input
            type="checkbox"
            checked={recordarme}
            onChange={(e) => setRecordarme(e.target.checked)}
            className="h-4 w-4 rounded border-tinta-300 accent-iris-600"
          />
          Recordarme
        </label>
        {/* Sin destino real todavía: no hay flujo de recuperación de
            contraseña en el backend. Queda visible como en el diseño, sin
            prometer una funcionalidad que no existe. */}
        <a href="#" className="font-medium text-iris-600 hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <Boton type="submit" forma="pildora" cargando={cargando} className="w-full">
        Entrar
      </Boton>
    </form>
  )
}

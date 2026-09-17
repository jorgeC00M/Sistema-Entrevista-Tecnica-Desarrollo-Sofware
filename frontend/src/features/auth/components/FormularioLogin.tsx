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
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="password"
        etiqueta="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Boton type="submit" cargando={cargando} className="w-full">
        Entrar
      </Boton>
    </form>
  )
}

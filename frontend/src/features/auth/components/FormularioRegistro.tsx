import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import Boton from '@/components/ui/Boton'
import Input from '@/components/ui/Input'
import type { DatosDeRegistro } from '@/types/usuario'

type Campos = Omit<DatosDeRegistro, 'carnet'> & { carnet: string }

interface Props {
  onEnviar: (datos: DatosDeRegistro) => Promise<void>
}

export default function FormularioRegistro({ onEnviar }: Props) {
  const [form, setForm] = useState<Campos>({
    email: '',
    password: '',
    nombreCompleto: '',
    carnet: '',
  })
  const [cargando, setCargando] = useState(false)

  const actualizar = (campo: keyof Campos) => (evento: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: evento.target.value }))

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    setCargando(true)
    try {
      await onEnviar(form)
    } finally {
      setCargando(false)
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="mt-4 flex flex-col gap-4">
      <Input
        id="nombreCompleto"
        etiqueta="Nombre completo"
        autoComplete="name"
        required
        value={form.nombreCompleto}
        onChange={actualizar('nombreCompleto')}
      />
      <Input
        id="email"
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={actualizar('email')}
      />
      <Input
        id="password"
        etiqueta="Contraseña"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        ayuda="Mínimo 8 caracteres."
        value={form.password}
        onChange={actualizar('password')}
      />
      <Input
        id="carnet"
        etiqueta="Carnet de identidad"
        opcional
        value={form.carnet}
        onChange={actualizar('carnet')}
      />
      <Boton type="submit" cargando={cargando} className="w-full">
        Crear cuenta
      </Boton>
    </form>
  )
}

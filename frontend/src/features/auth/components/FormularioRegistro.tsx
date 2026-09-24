import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import Boton from '@/components/ui/Boton'
import Input from '@/components/ui/Input'
import type { DatosDeRegistro } from '@/types/usuario'

type Campos = Omit<DatosDeRegistro, 'carnet'>

interface Props {
  onEnviar: (datos: DatosDeRegistro) => Promise<void>
}

export default function FormularioRegistro({ onEnviar }: Props) {
  const [form, setForm] = useState<Campos>({
    email: '',
    password: '',
    nombreCompleto: '',
  })
  // Solo para comparar contra `password` en el navegador: nunca viaja a
  // `DatosDeRegistro` ni a `onEnviar`, el backend no la conoce.
  const [confirmarPassword, setConfirmarPassword] = useState('')
  // Igual que "Recordarme" en el login: no hay campo real que lo respalde
  // (ni en el modelo ni en `DatosDeRegistro`), así que no bloquea el envío
  // ni se manda al backend — es puramente visual, como en el diseño.
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [cargando, setCargando] = useState(false)

  const actualizar = (campo: keyof Campos) => (evento: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [campo]: evento.target.value }))

  const noCoincide = confirmarPassword.length > 0 && confirmarPassword !== form.password

  const manejarEnvio = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (form.password !== confirmarPassword) return
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
        icono="usuario"
        variante="relleno"
        autoComplete="name"
        required
        value={form.nombreCompleto}
        onChange={actualizar('nombreCompleto')}
      />
      <Input
        id="email"
        etiqueta="Correo electrónico"
        type="email"
        icono="correo"
        variante="relleno"
        autoComplete="email"
        required
        value={form.email}
        onChange={actualizar('email')}
      />
      <Input
        id="password"
        etiqueta="Contraseña"
        type="password"
        icono="candado"
        variante="relleno"
        conAlternarPassword
        autoComplete="new-password"
        required
        minLength={8}
        ayuda="Mínimo 8 caracteres."
        value={form.password}
        onChange={actualizar('password')}
      />
      <div>
        <Input
          id="confirmarPassword"
          etiqueta="Confirmar contraseña"
          type="password"
          icono="candado"
          variante="relleno"
          conAlternarPassword
          autoComplete="new-password"
          required
          value={confirmarPassword}
          onChange={(e) => setConfirmarPassword(e.target.value)}
        />
        {noCoincide && (
          <p className="mt-1 text-xs text-error-texto">Las contraseñas no coinciden.</p>
        )}
      </div>
      <label className="flex items-start gap-2 text-sm text-tinta-700">
        <input
          type="checkbox"
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-tinta-300 accent-iris-600"
        />
        <span>
          Acepto los{' '}
          <a href="#" className="font-medium text-iris-600 hover:underline">
            Términos
          </a>{' '}
          y la{' '}
          <a href="#" className="font-medium text-iris-600 hover:underline">
            Política de privacidad
          </a>
        </span>
      </label>

      <Boton
        type="submit"
        forma="pildora"
        cargando={cargando}
        disabled={form.password !== confirmarPassword}
        className="w-full"
      >
        Crear cuenta
      </Boton>
    </form>
  )
}

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import Icono from '@/components/ui/Icono'
import CampoAuth from '@/features/auth/components/CampoAuth'
import type { DatosDeRegistro } from '@/types/usuario'

type Campos = DatosDeRegistro

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
    <form onSubmit={manejarEnvio} className="text-left">
      <CampoAuth
        icono={<Icono nombre="usuario" />}
        ariaLabel="Nombre completo"
        placeholder="Nombre completo"
        autoComplete="name"
        required
        value={form.nombreCompleto}
        onChange={actualizar('nombreCompleto')}
      />
      <CampoAuth
        icono={<Icono nombre="correo" />}
        ariaLabel="Correo electrónico"
        placeholder="Correo electrónico"
        type="email"
        autoComplete="email"
        required
        value={form.email}
        onChange={actualizar('email')}
      />
      <CampoAuth
        icono={<Icono nombre="candado" />}
        ariaLabel="Contraseña"
        placeholder="Contraseña"
        type="password"
        conAlternarPassword
        autoComplete="new-password"
        required
        minLength={8}
        value={form.password}
        onChange={actualizar('password')}
      />
      <p className="-mt-2.5 mb-3.5 text-left text-[0.8rem] text-vidrio-muted">Mínimo 8 caracteres.</p>

      <CampoAuth
        icono={<Icono nombre="candado-check" />}
        ariaLabel="Confirmar contraseña"
        placeholder="Confirmar contraseña"
        type="password"
        conAlternarPassword
        autoComplete="new-password"
        required
        value={confirmarPassword}
        onChange={(e) => setConfirmarPassword(e.target.value)}
      />
      {noCoincide && (
        // El mockup no define un color de error (es estático, sin estados de
        // validación); se reutiliza el semántico de error del proyecto en
        // vez de inventar un rojo nuevo fuera de las variables pedidas.
        <p className="-mt-2.5 mb-3.5 text-left text-[0.8rem] text-error-texto">
          Las contraseñas no coinciden.
        </p>
      )}

      <div className="mt-1 mb-6 text-[0.85rem] leading-[1.4]">
        <label className="flex cursor-pointer items-start gap-2 text-left text-vidrio-texto">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-vidrio-acento"
          />
          <span>
            Acepto los{' '}
            <a href="#" className="font-medium text-vidrio-acento no-underline hover:underline">
              Términos
            </a>{' '}
            y la{' '}
            <a href="#" className="font-medium text-vidrio-acento no-underline hover:underline">
              Política de privacidad
            </a>
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={cargando || form.password !== confirmarPassword}
        className="flex h-[50px] w-full items-center justify-center rounded-full bg-vidrio-acento text-[1.05rem] font-semibold text-white transition-colors hover:bg-vidrio-acento-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {cargando && (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Crear cuenta
      </button>
    </form>
  )
}

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import Icono from '@/components/ui/Icono'
import Boton from '@/components/ui/Boton'
import CampoAuth from '@/components/ui/CampoAuth'
import type { DatosDeRegistro } from '@/types/usuario'

type Campos = DatosDeRegistro

interface Props {
  onEnviar: (datos: DatosDeRegistro) => Promise<void>
  /**
   * Errores de validación del backend, ya traducidos al nombre de cada
   * campo por `campoDeRegistro` en `api/auth.ts`. Independientes de
   * `noCoincide`, que es la única regla que el backend no puede evaluar
   * (`confirmarPassword` nunca viaja fuera del navegador).
   */
  erroresPorCampo?: Partial<Record<keyof Campos, string>>
  /** Se llama al escribir en un campo, para borrar su error mientras se corrige. */
  onLimpiarError?: (campo: keyof Campos) => void
}

export default function FormularioRegistro({
  onEnviar,
  erroresPorCampo = {},
  onLimpiarError,
}: Props) {
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

  const actualizar = (campo: keyof Campos) => (evento: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [campo]: evento.target.value }))
    // Si el usuario corrige el campo, el error de la última validación del
    // servidor deja de aplicar: mostrarlo seguiría sería afirmar algo que
    // ya no es cierto sobre lo que hay escrito.
    onLimpiarError?.(campo)
  }

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
        error={erroresPorCampo.nombreCompleto}
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
        error={erroresPorCampo.email}
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
        error={erroresPorCampo.password}
      />
      {/* Solo cuando la contraseña no tiene su propio error del servidor: no
          tiene sentido apilar "mínimo 8 caracteres" encima del mensaje real
          ("esta contraseña es demasiado común"). */}
      {!erroresPorCampo.password && (
        <p className="-mt-2.5 mb-3.5 text-left text-meta text-vidrio-muted">
          Mínimo 8 caracteres.
        </p>
      )}

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
        <p className="-mt-2.5 mb-3.5 text-left text-meta text-error-texto">
          Las contraseñas no coinciden.
        </p>
      )}

      <div className="mt-1 mb-6 text-sm">
        <label className="flex cursor-pointer items-start gap-2 text-left text-vidrio-texto">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="foco-anillo mt-0.5 size-4 shrink-0 accent-vidrio-acento"
          />
          <span>
            {/* Sin destino real todavía: no hay páginas de términos ni de
                privacidad publicadas. Mismo caso que "¿Olvidaste tu
                contraseña?" en FormularioLogin. */}
            Acepto los{' '}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" className="foco-anillo rounded-chip font-medium text-vidrio-acento no-underline hover:underline">
              Términos
            </a>{' '}
            y la{' '}
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" className="foco-anillo rounded-chip font-medium text-vidrio-acento no-underline hover:underline">
              Política de privacidad
            </a>
          </span>
        </label>
      </div>

      <Boton
        type="submit"
        tamano="lg"
        cargando={cargando}
        disabled={form.password !== confirmarPassword}
        className="w-full"
      >
        Crear cuenta
      </Boton>
    </form>
  )
}

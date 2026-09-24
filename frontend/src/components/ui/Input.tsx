import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  /** Obligatorio: es lo que enlaza la etiqueta con el campo vía htmlFor. */
  id: string
  etiqueta: ReactNode
  /** Texto de ayuda bajo el campo, por ejemplo "Mínimo 8 caracteres". */
  ayuda?: string
  opcional?: boolean
  /** Ícono a la izquierda, dentro del campo. Ausente por defecto — no cambia ningún uso existente. */
  icono?: NombreDeIcono
  /** Solo tiene efecto con `type="password"`: agrega un botón de ojo para alternar visibilidad. */
  conAlternarPassword?: boolean
  /**
   * `'linea'` (por defecto) es el campo actual: borde sin relleno. `'relleno'`
   * agrega un fondo blanco translúcido — pensado para superficies de vidrio
   * (login/registro), donde un borde solo no se distingue de la tarjeta.
   */
  variante?: 'linea' | 'relleno'
}

export default function Input({
  id,
  etiqueta,
  ayuda,
  opcional = false,
  icono,
  conAlternarPassword = false,
  variante = 'linea',
  type,
  ...props
}: Props) {
  const [mostrar, setMostrar] = useState(false)
  const esPassword = type === 'password'
  const alternable = esPassword && conAlternarPassword

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-tinta-700">
        {etiqueta} {opcional && <span className="text-tinta-500">(opcional)</span>}
      </label>
      <div className="relative">
        {icono && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-tinta-500">
            <Icono nombre={icono} className="h-4 w-4" />
          </span>
        )}
        <input
          id={id}
          type={alternable ? (mostrar ? 'text' : 'password') : type}
          className={`w-full rounded-control border border-tinta-300 py-2 text-sm text-tinta-950 focus:border-iris-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600 ${
            variante === 'relleno' ? 'bg-white/70' : ''
          } ${icono ? 'pl-9' : 'pl-3'} ${alternable ? 'pr-10' : 'pr-3'}`}
          {...props}
        />
        {alternable && (
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-tinta-500 hover:text-tinta-950"
          >
            <Icono nombre={mostrar ? 'ojo-cerrado' : 'ojo'} className="h-4 w-4" />
          </button>
        )}
      </div>
      {ayuda && <p className="mt-1 text-xs text-tinta-500">{ayuda}</p>}
    </div>
  )
}

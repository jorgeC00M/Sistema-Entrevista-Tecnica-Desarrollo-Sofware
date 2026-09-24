import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import { IconoOjoAuth } from '@/features/auth/components/iconosAuth'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  icono: ReactNode
  /**
   * Reemplaza la etiqueta visible: el campo solo tiene placeholder e ícono,
   * así que el nombre accesible viene de aquí.
   */
  ariaLabel: string
  /** Solo con `type="password"`: botón de ojo para alternar visibilidad. */
  conAlternarPassword?: boolean
}

/**
 * Campo de login/registro, aparte de `components/ui/Input.tsx` a propósito:
 * estas dos pantallas replican un mockup con su propia estructura (ícono +
 * campo en una fila con gap, sin etiqueta visible) que no es una variante
 * del campo del resto del sistema, es un componente distinto — así ninguno
 * de los dos puede arrastrar cambios al otro.
 */
export default function CampoAuth({
  icono,
  ariaLabel,
  conAlternarPassword = false,
  type,
  ...props
}: Props) {
  const [mostrar, setMostrar] = useState(false)
  const alternable = type === 'password' && conAlternarPassword

  return (
    <label className="mb-3.5 flex h-[52px] items-center gap-3 rounded-[10px] border border-transparent bg-[rgba(255,255,255,0.72)] px-4 transition-colors focus-within:border-[#2b55a3]">
      <span className="shrink-0 text-[#4a5572]" aria-hidden="true">
        {icono}
      </span>
      <input
        type={alternable ? (mostrar ? 'text' : 'password') : type}
        aria-label={ariaLabel}
        className="min-w-0 flex-1 border-0 bg-transparent font-['Figtree'] text-[0.95rem] text-[#1c2f5e] outline-none placeholder:text-[#8a93a8]"
        {...props}
      />
      {alternable && (
        <button
          type="button"
          onClick={() => setMostrar((v) => !v)}
          aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="grid shrink-0 place-items-center rounded p-1 text-[#4a5572] hover:text-[#1c2f5e]"
        >
          <IconoOjoAuth className="h-5 w-5" />
        </button>
      )}
    </label>
  )
}

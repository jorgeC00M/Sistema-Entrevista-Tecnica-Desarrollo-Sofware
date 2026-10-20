import { useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

import BotonIcono from '@/components/ui/BotonIcono'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  icono: ReactNode
  /**
   * Reemplaza la etiqueta visible: el campo solo tiene placeholder e ícono,
   * así que el nombre accesible viene de aquí.
   */
  ariaLabel: string
  /** Solo con `type="password"`: botón de ojo para alternar visibilidad. */
  conAlternarPassword?: boolean
  /**
   * Error de validación de este campo, ya resuelto por `repartirErrores`.
   * Marca el campo como inválido y liga el mensaje con `aria-describedby`,
   * en vez de un `role="alert"` por campo: con varios campos inválidos a la
   * vez, un lector de pantalla anunciaría los tres de golpe.
   */
  error?: string
}

/**
 * Campo de login/registro: ícono + campo en una fila, sin etiqueta visible.
 *
 * El nombre accesible viene de `ariaLabel`, no del placeholder, que
 * desaparece en cuanto se escribe.
 */
export default function CampoAuth({
  icono,
  ariaLabel,
  conAlternarPassword = false,
  type,
  error,
  ...props
}: Props) {
  const [mostrar, setMostrar] = useState(false)
  const alternable = type === 'password' && conAlternarPassword
  const idError = useId()

  return (
    // El ritmo vertical entre campos lo da este `mb-3.5`, no el `<label>`:
    // así la distancia al campo siguiente es la misma con o sin mensaje de
    // error debajo.
    <div className="mb-3.5">
      {/* `campo` da caja, foco (`:focus-within`) y el borde de error cuando el
          input interno tiene `aria-invalid`: el mismo tratamiento que todo campo. */}
      <label className="campo flex h-12 items-center gap-3 pr-2 pl-4">
        <span className="shrink-0 text-vidrio-texto" aria-hidden="true">
          {icono}
        </span>
        <input
          type={alternable ? (mostrar ? 'text' : 'password') : type}
          aria-label={ariaLabel}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? idError : undefined}
          className="min-w-0 flex-1 border-0 bg-transparent text-cuerpo text-vidrio-ink outline-none placeholder:text-vidrio-muted"
          {...props}
        />
        {alternable && (
          <BotonIcono
            icono={mostrar ? 'ojo-cerrado' : 'ojo'}
            aria-label={mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tamano="sm"
            onClick={() => setMostrar((v) => !v)}
          />
        )}
      </label>
      {error && (
        <p id={idError} className="mt-1 text-left text-meta text-error-texto">
          {error}
        </p>
      )}
    </div>
  )
}

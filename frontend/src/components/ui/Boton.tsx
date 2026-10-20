import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import { clasesDeBoton, type TamanoDeBoton, type VarianteDeBoton } from '@/components/ui/estilosDeBoton'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode
  variante?: VarianteDeBoton
  tamano?: TamanoDeBoton
  cargando?: boolean
  /** Icono al inicio del botón; puramente decorativo, la etiqueta ya dice qué hace. */
  icono?: NombreDeIcono
  className?: string
  /** React 19: la ref llega como prop, sin `forwardRef`. */
  ref?: Ref<HTMLButtonElement>
}

/**
 * Botón de acción: siempre píldora, con variantes por intención (primario,
 * secundario, contorno, texto, peligro, fantasma) y tamaños sm/md/lg. Para un
 * enlace que debe verse como botón, `clasesDeBoton()` sobre el propio enlace.
 *
 * `type="button"` por defecto: un botón sin tipo dentro de un formulario lo
 * envía, y casi nunca es lo que se quiere. El de envío lo declara.
 */
export default function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  icono,
  disabled,
  className = '',
  type = 'button',
  ref,
  ...props
}: Props) {
  return (
    <button
      ref={ref}
      type={type}
      className={clasesDeBoton({ variante, tamano, className })}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      {...props}
    >
      {cargando && (
        <span
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {icono && !cargando && <Icono nombre={icono} className="h-4 w-4 shrink-0" />}
      {children}
    </button>
  )
}

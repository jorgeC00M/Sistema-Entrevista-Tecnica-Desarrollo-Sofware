import type { ButtonHTMLAttributes, ReactNode } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

// iris es el único color de acción del producto: la variante primaria es la
// única que lo usa como relleno. secundario y fantasma se quedan en la
// escala neutra (tinta), para que un botón nunca se confunda con un estado.
const VARIANTES = {
  primario: 'bg-iris-600 text-white hover:bg-iris-700',
  secundario: 'bg-white text-tinta-700 ring-1 ring-tinta-700 hover:bg-tinta-50',
  // tinta-300 solo cumple AA sobre fondos oscuros (tinta-900/950, como el
  // sidebar): sobre blanco cae a ~2.3:1. No usar fantasma sobre superficies
  // claras sin revisar el contraste.
  fantasma: 'text-tinta-300 hover:bg-tinta-900 hover:text-white',
} as const

export type VarianteDeBoton = keyof typeof VARIANTES

const TAMANOS = {
  sm: 'gap-1.5 px-3 py-1.5 text-sm',
  md: 'gap-2 px-4 py-2.5 text-sm',
} as const

export type TamanoDeBoton = keyof typeof TAMANOS

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode
  variante?: VarianteDeBoton
  tamano?: TamanoDeBoton
  cargando?: boolean
  /** Icono al inicio del botón; puramente decorativo, la etiqueta ya dice qué hace. */
  icono?: NombreDeIcono
  className?: string
}

export default function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  icono,
  disabled,
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-control font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {icono && !cargando && <Icono nombre={icono} className="mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}

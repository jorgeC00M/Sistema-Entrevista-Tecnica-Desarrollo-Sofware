import type { ButtonHTMLAttributes } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

const VARIANTES = {
  claro: 'text-tinta-600 hover:bg-tinta-100 hover:text-tinta-900',
  oscuro: 'text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white',
} as const

export type VarianteDeBotonIcono = keyof typeof VARIANTES

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  icono: NombreDeIcono
  /**
   * Obligatorio, no opcional: un botón que solo muestra un icono no tiene
   * ningún otro texto que lo identifique para quien usa lector de pantalla.
   */
  'aria-label': string
  variante?: VarianteDeBotonIcono
  className?: string
}

export default function BotonIcono({
  icono,
  variante = 'claro',
  className = '',
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-control transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento ${VARIANTES[variante]} ${className}`}
      {...props}
    >
      <Icono nombre={icono} />
    </button>
  )
}

import type { ButtonHTMLAttributes } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

// Sus dos usos (plegar el sidebar, abrir y cerrar el cajón móvil) viven
// sobre el sidebar oscuro, así que el color va fijo: había una variante
// `claro` que ninguna pantalla llegó a renderizar.
const ESTILO = 'text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white'

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  icono: NombreDeIcono
  /**
   * Obligatorio, no opcional: un botón que solo muestra un icono no tiene
   * ningún otro texto que lo identifique para quien usa lector de pantalla.
   */
  'aria-label': string
  className?: string
}

export default function BotonIcono({ icono, className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-control ${ESTILO} transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento ${className}`}
      {...props}
    >
      <Icono nombre={icono} />
    </button>
  )
}

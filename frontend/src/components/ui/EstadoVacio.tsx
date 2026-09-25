import type { ReactNode } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

interface Props {
  icono?: NombreDeIcono
  titulo: string
  /** Texto adicional o una acción (un enlace, un botón) bajo el título. */
  children?: ReactNode
}

export default function EstadoVacio({ icono, titulo, children }: Props) {
  return (
    <div className="mx-auto max-w-lg py-8 text-center">
      {icono && (
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-vidrio-field text-vidrio-muted">
          <Icono nombre={icono} />
        </span>
      )}
      <p className="text-sm text-vidrio-muted">{titulo}</p>
      {children && <div className="mt-2 text-sm text-vidrio-muted">{children}</div>}
    </div>
  )
}

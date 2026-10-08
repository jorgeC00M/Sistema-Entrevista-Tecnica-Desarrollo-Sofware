import type { ReactNode } from 'react'

import Icono from '@/components/ui/Icono'

/**
 * Aclaración al pie de una sección: lo que la herramienta no hace o no promete.
 *
 * Va junto al contenido que matiza y no en el pie de página: decirlo donde se
 * está leyendo es más honesto que esconderlo.
 */
export default function NotaAclaratoria({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[22px] flex max-w-[760px] items-start gap-2.5 text-[0.86rem] text-vidrio-muted">
      <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

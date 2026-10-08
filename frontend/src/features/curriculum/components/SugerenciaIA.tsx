import type { ReactNode } from 'react'

import EtiquetaMono from '@/components/ui/EtiquetaMono'

/**
 * Lo que dice la IA, rotulado como tal.
 *
 * Un solo componente para las cuatro partes de la revisión, para que no haya
 * forma de mostrar una sugerencia sin su rótulo. La separación entre lo medido y
 * lo sugerido es lo que sostiene la credibilidad del módulo: un hallazgo se
 * puede explicar regla por regla; una sugerencia, no.
 */
export default function SugerenciaIA({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1.5 rounded-control bg-vidrio-acento-suave/60 px-3 py-2">
      <EtiquetaMono tono="suelto" className="text-vidrio-acento">
        Sugerencia de IA
      </EtiquetaMono>
      <p className="mt-0.5 text-sm text-vidrio-ink">{children}</p>
    </div>
  )
}

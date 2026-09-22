import type { ReactNode } from 'react'

import EtiquetaMono from '@/components/ui/EtiquetaMono'

export type AutorDeMensaje = 'sistema' | 'usuario'

interface Props {
  autor: AutorDeMensaje
  children: ReactNode
}

export default function BurbujaPregunta({ autor, children }: Props) {
  const esSistema = autor === 'sistema'
  return (
    <div className={`flex flex-col gap-1 ${esSistema ? 'items-start' : 'items-end'}`}>
      {esSistema && (
        <EtiquetaMono tono="suelto" className="px-1">
          IA · Entrevistador
        </EtiquetaMono>
      )}
      <div
        className={`max-w-[85%] rounded-superficie px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[75%] ${
          // El acento iris es solo para acción: la burbuja del candidato usa la
          // tinta oscura del texto principal, no el color de marca.
          esSistema
            ? 'bg-white text-tinta-800 ring-1 ring-tinta-100'
            : 'bg-tinta-900 text-white'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

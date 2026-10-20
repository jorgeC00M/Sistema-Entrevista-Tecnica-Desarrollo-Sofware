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
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[75%] ${
          // Esquina asimétrica hacia el autor, al estilo del mockup: da la
          // sensación de burbuja de conversación real.
          esSistema
            ? 'rounded-burbuja rounded-tl-sm border border-vidrio-borde bg-vidrio-field text-vidrio-ink backdrop-blur-[18px]'
            : 'rounded-burbuja rounded-tr-sm bg-vidrio-acento text-white'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

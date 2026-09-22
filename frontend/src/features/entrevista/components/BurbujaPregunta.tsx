import type { ReactNode } from 'react'

export type AutorDeMensaje = 'sistema' | 'usuario'

interface Props {
  autor: AutorDeMensaje
  children: ReactNode
}

export default function BurbujaPregunta({ autor, children }: Props) {
  const esSistema = autor === 'sistema'
  return (
    <div className={`flex ${esSistema ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[85%] rounded-superficie px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[75%] ${
          esSistema ? 'bg-white text-tinta-800 ring-1 ring-tinta-100' : 'bg-iris-600 text-white'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

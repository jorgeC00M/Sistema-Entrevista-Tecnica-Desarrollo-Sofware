import type { ReactNode } from 'react'

import Avatar from '@/components/ui/Avatar'
import Icono from '@/components/ui/Icono'

export type AutorDeMensaje = 'sistema' | 'usuario'

interface Props {
  autor: AutorDeMensaje
  children: ReactNode
  /** Para las iniciales del avatar del usuario; sin él, un icono genérico. */
  nombreUsuario?: string
}

/**
 * Un mensaje del chat con su autor al lado, junto a la esquina de la cola:
 * la marca de la app abajo a la izquierda para la IA y las iniciales del
 * usuario abajo a la derecha. Los avatares son decorativos; quién habla se
 * lo dice al lector de pantalla un texto oculto al inicio del mensaje.
 */
export default function BurbujaPregunta({ autor, children, nombreUsuario }: Props) {
  const esSistema = autor === 'sistema'
  const avatar = esSistema ? (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vidrio-acento text-white">
      <Icono nombre="marca" className="h-4 w-4" />
    </span>
  ) : nombreUsuario ? (
    <Avatar nombre={nombreUsuario} tamano="sm" tono="claro" />
  ) : (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vidrio-acento-suave text-vidrio-acento">
      <Icono nombre="usuario" className="h-4 w-4" />
    </span>
  )

  return (
    <div className={`flex items-end gap-2 ${esSistema ? 'justify-start' : 'justify-end'}`}>
      {esSistema && <span aria-hidden="true">{avatar}</span>}
      <div
        // En pantallas anchas el límite va en caracteres (65ch), no en
        // proporción: al 75 % del contenido, una línea pasaría de 140 caracteres.
        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap sm:max-w-[75%] lg:max-w-prose ${
          // La cola va en la esquina inferior del lado del autor, junto a su
          // avatar: abajo a la izquierda la IA, abajo a la derecha el usuario.
          esSistema
            ? 'rounded-burbuja rounded-bl-sm border border-vidrio-borde bg-white text-vidrio-ink'
            : 'rounded-burbuja rounded-br-sm bg-vidrio-acento text-white'
        }`}
      >
        <span className="sr-only">{esSistema ? 'Entrevistador: ' : 'Tú: '}</span>
        {children}
      </div>
      {!esSistema && <span aria-hidden="true">{avatar}</span>}
    </div>
  )
}

import type { ReactNode } from 'react'

// Los tonos que `TONO_POR_ESTADO` puede producir, y nada más: una entrevista
// solo está finalizada, en progreso o abandonada. Había un `error` que ningún
// estado sabía pedir.
const TONOS = {
  exito: 'bg-exito-fondo text-exito-texto',
  progreso: 'bg-progreso-fondo text-progreso-texto',
  neutro: 'bg-vidrio-field text-vidrio-muted',
} as const

export type TonoDeBadge = keyof typeof TONOS

interface Props {
  tono?: TonoDeBadge
  children: ReactNode
}

export default function Badge({ tono = 'neutro', children }: Props) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${TONOS[tono]}`}>
      {children}
    </span>
  )
}

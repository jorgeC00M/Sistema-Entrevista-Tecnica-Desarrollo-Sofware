import type { ReactNode } from 'react'

// Los mismos tres semánticos que el resto del sistema, más "neutro" para un
// estado que no es ni positivo ni negativo (por ejemplo, "abandonada").
const TONOS = {
  exito: 'bg-exito-fondo text-exito-texto',
  progreso: 'bg-progreso-fondo text-progreso-texto',
  error: 'bg-error-fondo text-error-texto',
  neutro: 'bg-tinta-100 text-tinta-500',
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

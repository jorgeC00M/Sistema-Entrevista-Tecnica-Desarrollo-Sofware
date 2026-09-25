import type { ReactNode } from 'react'

// error y exito son los semánticos del sistema; info no expresa un estado de
// puntaje ni de proceso, así que se queda en la escala neutra en vez de
// inventar un cuarto semántico solo para esto.
const ESTILOS = {
  error: 'bg-error-fondo text-error-texto ring-1 ring-error-texto/20',
  exito: 'bg-exito-fondo text-exito-texto ring-1 ring-exito-texto/20',
  info: 'bg-vidrio-field text-vidrio-texto ring-1 ring-vidrio-linea',
} as const

export type TipoDeAlerta = keyof typeof ESTILOS

interface Props {
  tipo?: TipoDeAlerta
  children?: ReactNode
}

export default function Alerta({ tipo = 'error', children }: Props) {
  if (!children) return null
  return (
    <div
      className={`rounded-control px-4 py-3 text-sm ${ESTILOS[tipo]}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

import type { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

/**
 * Aviso de error sobre un formulario o una pantalla.
 *
 * Tenía tipos `exito` e `info` que ninguna pantalla usaba: lo positivo en este
 * producto se comunica con la puntuación, no con un banner. `role="alert"` va
 * fijo porque un error sí interrumpe.
 */
export default function Alerta({ children }: Props) {
  if (!children) return null
  return (
    <div
      className="rounded-control bg-error-fondo px-4 py-3 text-sm text-error-texto ring-1 ring-error-texto/20"
      role="alert"
    >
      {children}
    </div>
  )
}

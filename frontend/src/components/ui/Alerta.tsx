import type { ReactNode } from 'react'

interface Props {
  children?: ReactNode
  /**
   * `bloque` encabeza un formulario o una pantalla; `enLinea` va junto a la
   * acción que falló (dentro de un modal, bajo un botón), más compacto.
   */
  variante?: 'bloque' | 'enLinea'
  /** Solo para situarlo (márgenes, tamaño de letra): el aspecto lo pone la variante. */
  className?: string
}

/**
 * Aviso de error sobre un formulario o una pantalla.
 *
 * Tenía tipos `exito` e `info` que ninguna pantalla usaba: lo positivo en este
 * producto se comunica con la puntuación, no con un banner. `role="alert"` va
 * fijo porque un error sí interrumpe.
 */
export default function Alerta({ children, variante = 'bloque', className = '' }: Props) {
  if (!children) return null
  if (variante === 'enLinea') {
    return (
      <p role="alert" className={`rounded-control bg-error-fondo px-3 py-2 text-error-texto ${className}`}>
        {children}
      </p>
    )
  }
  return (
    <div
      className="rounded-control bg-error-fondo px-4 py-3 text-sm text-error-texto ring-1 ring-error-texto/20"
      role="alert"
    >
      {children}
    </div>
  )
}

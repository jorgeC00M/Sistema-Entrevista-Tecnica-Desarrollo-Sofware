import type { ElementType, ReactNode } from 'react'

/** Blanca, muy redonda y sin borde: la separa del fondo una sombra amplia. */
const CLASES_TARJETA = 'rounded-superficie bg-vidrio-card shadow-superficie'

interface Props {
  children: ReactNode
  /** Etiqueta a renderizar; `div` salvo que la semántica pida otra cosa. */
  como?: ElementType
  /** Relleno, disposición y cualquier otra cosa propia del sitio. */
  className?: string
}

/**
 * Superficie de contenido del sistema.
 *
 * La cadena de clases estaba repetida en una veintena de sitios, ya copiada a
 * mano con variaciones (una sección la tenía extraída en una constante local
 * y otra la repetía sin llegar a usarla). El relleno no entra aquí: cada
 * tarjeta lo elige, y meterlo por defecto obligaría a deshacerlo en la mitad.
 */
export default function Tarjeta({ children, como: Como = 'div', className = '' }: Props) {
  return <Como className={`${CLASES_TARJETA} ${className}`}>{children}</Como>
}

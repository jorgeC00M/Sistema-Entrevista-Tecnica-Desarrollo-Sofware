import type { ElementType, ReactNode } from 'react'

/**
 * El vidrio: fondo translúcido, filete claro y desenfoque de fondo.
 *
 * Se exporta aparte del componente para los pocos sitios que no pueden usarlo
 * —los que necesitan una `ref`, o que calculan el color del borde según el
 * estado— y que aun así deben salir del mismo sitio que el resto.
 */
export const CLASES_TARJETA =
  'rounded-vidrio border border-vidrio-borde bg-vidrio-card backdrop-blur-[18px]'

interface Props {
  children: ReactNode
  /** Etiqueta a renderizar; `div` salvo que la semántica pida otra cosa. */
  como?: ElementType
  /** Relleno, disposición y cualquier otra cosa propia del sitio. */
  className?: string
}

/**
 * Superficie de contenido del sistema "vidrio".
 *
 * La cadena de clases estaba repetida en una veintena de sitios, ya copiada a
 * mano con variaciones (una sección la tenía extraída en una constante local
 * y otra la repetía sin llegar a usarla). El relleno no entra aquí: cada
 * tarjeta lo elige, y meterlo por defecto obligaría a deshacerlo en la mitad.
 */
export default function Tarjeta({ children, como: Como = 'div', className = '' }: Props) {
  return <Como className={`${CLASES_TARJETA} ${className}`}>{children}</Como>
}

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

/**
 * La misma tarjeta, con sombra y reacción al puntero: la usan las rejillas de
 * la landing, donde cada tarjeta es una unidad que se recorre con la vista.
 * `ComoFunciona` la repetía en línea y `QueRecibes` la tenía en una constante
 * local, con la cadena idéntica en ambas.
 */
export const CLASES_TARJETA_ELEVADA =
  `${CLASES_TARJETA} p-7 shadow-[0_8px_24px_-12px_rgba(28,47,94,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:border-vidrio-acento/35 hover:shadow-[0_26px_50px_-26px_rgba(28,47,94,0.4)]`

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

import type { ReactNode } from 'react'

const TONOS = {
  /** Metadato sobre superficie clara: fase, área, tema. */
  neutro: 'bg-tinta-100 text-tinta-500',
  /** Metadato que pertenece al producto: estado seleccionado, marca. */
  marca: 'bg-iris-50 text-iris-700',
  /** Metadato sobre el sidebar u otra superficie oscura. */
  oscuro: 'bg-tinta-800 text-tinta-300',
  /** Sin relleno, para rótulos de sección que no necesitan cápsula. */
  suelto: 'text-tinta-500',
} as const

export type TonoDeEtiqueta = keyof typeof TONOS

interface Props {
  children: ReactNode
  tono?: TonoDeEtiqueta
  className?: string
}

/**
 * Etiqueta de metadato en monoespaciada.
 *
 * Es el patrón más repetido del sistema de diseño: mayúsculas, 11px, tracking
 * amplio y mono. `text-label-mono` ya lleva tamaño, interlineado, tracking y
 * peso, así que aquí solo queda la caja y el tono.
 */
export default function EtiquetaMono({ children, tono = 'neutro', className = '' }: Props) {
  const relleno = tono === 'suelto' ? '' : 'rounded-chip px-2 py-0.5'
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-label-mono uppercase ${relleno} ${TONOS[tono]} ${className}`}
    >
      {children}
    </span>
  )
}

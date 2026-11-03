import type { ReactNode } from 'react'

const FORMA = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-meta'
const NEUTRO = 'border border-vidrio-borde bg-white text-vidrio-ink'

interface Props {
  children: ReactNode
  /** Con `onClick` es un botón (una sugerencia que se puede elegir); sin él, una etiqueta. */
  onClick?: () => void
  disabled?: boolean
  /**
   * Fondo y color de un estado (`bg-exito-fondo text-exito-texto`…), en lugar
   * del blanco neutro. El estado nunca va solo en el color: quien lo usa pone
   * también un ícono y el texto.
   */
  tono?: string
}

/**
 * Pastilla pequeña: una sugerencia elegible ("Probar con: Backend Python") o
 * una etiqueta de solo lectura (un requisito detectado). Misma forma en los
 * dos casos, para que se lean como la misma familia.
 */
export default function Chip({ children, onClick, disabled = false, tono }: Props) {
  const base = `${FORMA} ${tono ?? NEUTRO}`
  if (!onClick) return <span className={base}>{children}</span>

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} foco-anillo transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        tono ? 'hover:opacity-80' : 'hover:border-vidrio-acento hover:text-vidrio-acento'
      }`}
    >
      {children}
    </button>
  )
}

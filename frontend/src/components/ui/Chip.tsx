import type { ReactNode } from 'react'

const BASE = 'inline-flex items-center rounded-full border border-vidrio-borde bg-white px-2.5 py-1 text-meta text-vidrio-ink'

interface Props {
  children: ReactNode
  /** Con `onClick` es un botón (una sugerencia que se puede elegir); sin él, una etiqueta. */
  onClick?: () => void
  disabled?: boolean
}

/**
 * Pastilla pequeña: una sugerencia elegible ("Probar con: Backend Python") o
 * una etiqueta de solo lectura (un requisito detectado). Misma forma en los
 * dos casos, para que se lean como la misma familia.
 */
export default function Chip({ children, onClick, disabled = false }: Props) {
  if (!onClick) return <span className={BASE}>{children}</span>

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${BASE} foco-anillo transition-colors duration-150 hover:border-vidrio-acento hover:text-vidrio-acento disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  )
}

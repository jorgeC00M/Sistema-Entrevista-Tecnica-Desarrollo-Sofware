import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

/**
 * Contenedor de máximo 1280px con márgenes fluidos, exclusivo de la
 * landing — el dashboard y login/registro ya tienen sus propios anchos
 * decididos aparte. Cada sección lo usa en vez de repetir
 * `mx-auto max-w-... px-4` a mano.
 */
export default function Wrap({ children, className = '' }: Props) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-[clamp(20px,4vw,56px)] ${className}`}>
      {children}
    </div>
  )
}

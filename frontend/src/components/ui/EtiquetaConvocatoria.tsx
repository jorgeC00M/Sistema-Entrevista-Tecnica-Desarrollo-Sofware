import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Solo para situarla (márgenes, alineación): el aspecto es siempre el mismo. */
  className?: string
}

/**
 * La pastilla que marca una entrevista iniciada desde una convocatoria. Se ve
 * igual en el resumen de Simular entrevista, en el modal de inicio y en el
 * historial, así que vive en un solo sitio.
 */
export default function EtiquetaConvocatoria({ children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex rounded-full bg-vidrio-acento-suave px-2 py-0.5 text-meta whitespace-nowrap text-vidrio-acento ${className}`}
    >
      {children}
    </span>
  )
}

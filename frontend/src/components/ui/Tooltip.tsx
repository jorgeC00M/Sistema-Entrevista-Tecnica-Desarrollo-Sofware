import type { ReactElement } from 'react'

interface Props {
  texto: string
  /** El elemento enfocable/hoverable que dispara el tooltip — un botón, un enlace. */
  children: ReactElement
}

/**
 * Se muestra en hover y también en foco por teclado (`group-focus-within`),
 * sin JavaScript: es lo que hace falta para el sidebar colapsado, donde la
 * etiqueta del destino desaparece y el tooltip es la única forma de leerla
 * sin haber usado el ratón.
 */
export default function Tooltip({ texto, children }: Props) {
  return (
    <span className="group/tooltip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-control bg-vidrio-ink px-2.5 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {texto}
      </span>
    </span>
  )
}

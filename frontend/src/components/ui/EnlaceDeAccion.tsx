import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import Icono, { type NombreDeIcono } from '@/components/ui/Icono'

interface Props {
  to: string
  icono: NombreDeIcono
  /** El verbo corto que se ve: «Ver», «Continuar». */
  children: ReactNode
  /**
   * Obligatorio: con una sola palabra visible, diez «Ver» iguales no le dicen
   * nada a un lector de pantalla. Debe decir de qué registro se trata.
   */
  'aria-label': string
}

/**
 * Enlace de acción sobre un registro: icono + verbo corto, en el color de
 * acento. Es el «ojo + Ver» de la tabla del historial y de Retroalimentación,
 * y el «play + Continuar» de una entrevista en curso.
 *
 * Es genérico (icono y texto por props) para que todas las acciones de una
 * columna tengan la misma forma. No sirve para ir a una sección ni para una
 * acción principal: para eso están `Boton` y `clasesDeBoton`.
 */
export default function EnlaceDeAccion({ to, icono, children, 'aria-label': ariaLabel }: Props) {
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-control text-sm font-medium whitespace-nowrap text-vidrio-acento hover:underline foco-anillo"
    >
      <Icono nombre={icono} className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  )
}

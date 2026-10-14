import type { ButtonHTMLAttributes, ReactNode } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

// `vidrio-acento` es el único color de acción del producto: landing y
// aplicación comparten el mismo sistema, así que no hay una segunda escala de
// botones. Las variantes se diferencian por superficie, no por marca.
const VARIANTES = {
  // vidrio-sidebar-muted solo cumple AA sobre el sidebar oscuro (vidrio-ink),
  // su único consumidor hoy (SidebarPerfil). No usar fantasma sobre
  // superficies claras sin revisar el contraste.
  fantasma: 'text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white',
  // Acción principal sobre superficie clara.
  vidrio: 'bg-vidrio-acento text-white hover:bg-vidrio-acento-hover',
  // Acción secundaria sobre superficie clara: blanco con filete.
  'vidrio-secundario': 'bg-white text-vidrio-ink ring-1 ring-vidrio-linea hover:bg-vidrio-field',
} as const

export type VarianteDeBoton = keyof typeof VARIANTES

const TAMANOS = {
  sm: 'gap-1.5 px-3 py-1.5 text-sm',
  md: 'gap-2 px-4 py-2.5 text-sm',
} as const

export type TamanoDeBoton = keyof typeof TAMANOS

// El radio de control (8px) es el de todo el sistema; 'pildora' es una
// excepción puntual (auth y landing, inspirada en el mockup de login) — por
// eso es una forma explícita, no el radio por defecto.
const FORMAS = {
  control: 'rounded-control',
  pildora: 'rounded-full',
} as const

export type FormaDeBoton = keyof typeof FORMAS

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode
  variante?: VarianteDeBoton
  tamano?: TamanoDeBoton
  forma?: FormaDeBoton
  cargando?: boolean
  /** Icono al inicio del botón; puramente decorativo, la etiqueta ya dice qué hace. */
  icono?: NombreDeIcono
  className?: string
}

export default function Boton({
  children,
  variante = 'vidrio',
  tamano = 'md',
  forma = 'control',
  cargando = false,
  icono,
  disabled,
  className = '',
  ...props
}: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${FORMAS[forma]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {icono && !cargando && <Icono nombre={icono} className="mr-2 h-4 w-4" />}
      {children}
    </button>
  )
}

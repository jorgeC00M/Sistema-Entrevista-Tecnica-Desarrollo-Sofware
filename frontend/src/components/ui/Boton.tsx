import type { ButtonHTMLAttributes, ReactNode } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

// iris es el único color de acción del producto: la variante primaria es la
// única que lo usa como relleno. secundario y fantasma se quedan en la
// escala neutra (tinta), para que un botón nunca se confunda con un estado.
const VARIANTES = {
  primario: 'bg-iris-600 text-white hover:bg-iris-700',
  secundario: 'bg-white text-tinta-700 ring-1 ring-tinta-700 hover:bg-tinta-50',
  // vidrio-sidebar-muted solo cumple AA sobre el sidebar oscuro (vidrio-ink),
  // su único consumidor hoy (SidebarPerfil). No usar fantasma sobre
  // superficies claras sin revisar el contraste.
  fantasma: 'text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white',
  // Acento del sistema "vidrio" (dashboard): variante propia en vez de
  // reemplazar `primario`, porque Boton también lo usa la landing pública,
  // que se queda en iris.
  vidrio: 'bg-vidrio-acento text-white hover:bg-vidrio-acento-hover',
  // Equivalente "vidrio" de `secundario` (mismo motivo: `secundario` lo usa
  // también la landing).
  'vidrio-secundario': 'bg-white text-vidrio-ink ring-1 ring-vidrio-linea hover:bg-vidrio-field',
} as const

export type VarianteDeBoton = keyof typeof VARIANTES

const TAMANOS = {
  sm: 'gap-1.5 px-3 py-1.5 text-sm',
  md: 'gap-2 px-4 py-2.5 text-sm',
} as const

export type TamanoDeBoton = keyof typeof TAMANOS

// El radio de control (8px) es el de todo el sistema; 'pildora' es una
// excepción puntual (hoy solo auth, inspirada en el mockup de login) — por
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
  variante = 'primario',
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
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variante]} ${TAMANOS[tamano]} ${FORMAS[forma]} ${className}`}
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

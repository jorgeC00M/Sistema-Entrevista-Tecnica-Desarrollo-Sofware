import type { ButtonHTMLAttributes, Ref } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

const TONOS = {
  /** Sobre superficies claras: cerrar el modal, menú del header, quitar un archivo. */
  claro: 'text-vidrio-muted hover:bg-vidrio-field hover:text-vidrio-ink foco-anillo',
  /** Sobre el sidebar oscuro: plegar el sidebar, abrir y cerrar el cajón móvil. */
  oscuro: 'text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white foco-claro',
  /** Con caja, para controles que flotan sobre contenido (flechas del carrusel). */
  contorno:
    'border border-vidrio-borde bg-vidrio-field text-vidrio-ink hover:border-vidrio-acento hover:text-vidrio-acento foco-anillo',
} as const

const TAMANOS = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
} as const

const ICONO_POR_TAMANO = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'size-4.5' } as const

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  icono: NombreDeIcono
  /**
   * Obligatorio, no opcional: un botón que solo muestra un icono no tiene
   * ningún otro texto que lo identifique para quien usa lector de pantalla.
   */
  'aria-label': string
  tono?: keyof typeof TONOS
  tamano?: keyof typeof TAMANOS
  className?: string
  ref?: Ref<HTMLButtonElement>
}

/**
 * Control de solo icono. Regla de forma: los controles van a 8 px
 * (`rounded-control`); las acciones con texto son `Boton`, en píldora.
 */
export default function BotonIcono({ icono, tono = 'claro', tamano = 'md', className = '', ...props }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center justify-center rounded-control transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${TONOS[tono]} ${TAMANOS[tamano]} ${className}`}
      {...props}
    >
      <Icono nombre={icono} className={ICONO_POR_TAMANO[tamano]} />
    </button>
  )
}

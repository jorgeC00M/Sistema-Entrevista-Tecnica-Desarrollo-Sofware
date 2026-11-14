/**
 * Las clases de un botón de acción, en un solo lugar.
 *
 * Las usan `Boton` y cualquier enlace que deba verse como botón
 * (`<Link className={clasesDeBoton(...)}>`): así un enlace nunca envuelve un
 * `<button>`, que es HTML inválido y deja dos paradas de Tab para una acción.
 *
 * Regla de forma del sistema: las acciones son píldora (`rounded-full`), y
 * solo la principal lleva sombra; los controles de solo icono son
 * `BotonIcono`, a 8 px.
 *
 * Vive en un `.ts` y no en `Boton.tsx` para que ese archivo exporte solo el
 * componente (Fast Refresh).
 */

const VARIANTES = {
  /** Acción principal sobre superficie clara. `vidrio-acento` es el único color de acción. */
  primario: 'bg-vidrio-acento text-white shadow-accion hover:bg-vidrio-acento-hover',
  /** Acción secundaria: blanco con filete. */
  secundario: 'bg-white text-vidrio-ink ring-1 ring-vidrio-linea hover:bg-vidrio-field',
  /** Acción terciaria sin relleno, que toma el acento al pasar el cursor. */
  contorno:
    'border border-vidrio-borde bg-transparent text-vidrio-ink hover:border-vidrio-acento hover:text-vidrio-acento',
  /** Acción en línea, dentro de un texto o un mensaje: sin caja. */
  texto: 'text-vidrio-acento underline-offset-4 hover:underline',
  /** Acción destructiva o irreversible ("Abandonar", "Quitar"). */
  peligro: 'bg-white text-error-texto ring-1 ring-error-texto/30 hover:bg-error-fondo',
  /**
   * Sobre el sidebar oscuro. vidrio-sidebar-muted solo cumple AA sobre
   * vidrio-ink: no usar sobre superficies claras.
   */
  fantasma: 'text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white',
} as const

export type VarianteDeBoton = keyof typeof VARIANTES

const TAMANOS = {
  sm: 'gap-1.5 px-3 py-1.5 text-sm',
  /** 44 px: el blanco táctil mínimo. */
  md: 'h-11 gap-2 px-6 text-sm',
  /** Formularios de acceso y llamadas a la acción de la landing. */
  lg: 'h-12 gap-2 px-7 text-cuerpo font-semibold',
} as const

export type TamanoDeBoton = keyof typeof TAMANOS

interface OpcionesDeBoton {
  variante?: VarianteDeBoton
  tamano?: TamanoDeBoton
  className?: string
}

export function clasesDeBoton({ variante = 'primario', tamano = 'md', className = '' }: OpcionesDeBoton = {}): string {
  // Sobre el sidebar oscuro el anillo de acento no se ve: va el claro.
  const foco = variante === 'fantasma' ? 'foco-claro' : 'foco-anillo'
  return [
    // Al presionar se hunde un 3 %: respuesta táctil breve, que no ocurre si
    // el usuario pidió reducir el movimiento.
    'inline-flex items-center justify-center rounded-full font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out',
    'active:scale-97 motion-reduce:transition-colors motion-reduce:active:scale-100',
    'disabled:cursor-not-allowed disabled:opacity-50',
    foco,
    VARIANTES[variante],
    TAMANOS[tamano],
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

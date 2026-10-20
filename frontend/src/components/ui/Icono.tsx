/**
 * Todos los iconos del sistema, en un solo módulo.
 *
 * Antes había tres sets paralelos (`IconoNav.tsx` para el sidebar,
 * `features/landing/components/Icono.tsx` para la landing y
 * `features/auth/components/iconosAuth.tsx` para login/registro), con trazos
 * y grosor distintos —auth iba a 1.6 y el resto a 2—. Se funden aquí para que
 * "mismo grosor y tamaño en todo el sistema" sea literal.
 *
 * Trazos reales de Tabler Icons (MIT), descargados de
 * https://unpkg.com/@tabler/icons — no aproximados a mano — copiados en
 * línea en lugar de instalar `@tabler/icons-react`: son 17 iconos y el
 * paquete traería un modelo de componentes que este proyecto no usa en
 * ninguna otra parte. Mismo enfoque que cada otra dependencia de UI que ya
 * se descartó aquí (GSAP, una librería de gráficos, Radix, `focus-trap`).
 *
 * La excepción es `marca`: no es un icono de interfaz, es el logotipo del
 * producto, así que conserva su propio trazo en vez de tomar uno de Tabler.
 * El logo de Google vive aparte, en `IconoGoogle.tsx`: es multicolor y de
 * marca ajena, no puede pintarse con `currentColor` como el resto.
 *
 * Todos son decorativos —acompañan a una etiqueta que ya dice lo mismo—
 * así que llevan `aria-hidden` y no se anuncian dos veces al lector de
 * pantalla.
 */

import { TRAZOS, type NombreDeIcono } from './trazosDeIconos'

export type { NombreDeIcono }

interface Props {
  nombre: NombreDeIcono
  className?: string
}

export default function Icono({ nombre, className = 'h-5 w-5' }: Props) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={TRAZOS[nombre]} />
    </svg>
  )
}

/**
 * Iconos de la navegación autenticada.
 *
 * Trazos con la forma de los de Lucide, escritos en línea en lugar de instalar
 * `lucide-react`: son ocho iconos y el paquete traería un modelo de componentes
 * que este proyecto no usa en ninguna otra parte. Mismo enfoque que
 * `features/landing/components/Icono.tsx`.
 *
 * Todos son decorativos —acompañan a una etiqueta que ya dice lo mismo— así que
 * llevan `aria-hidden` y no se anuncian dos veces.
 */

const TRAZOS = {
  mas: 'M12 5v14M5 12h14',
  play: 'M5 3l14 9-14 9V3z',
  historial: 'M3 3v5h5M3.05 13A9 9 0 106 5.3L3 8M12 7v5l4 2',
  brujula: 'M12 22a10 10 0 100-20 10 10 0 000 20zM16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z',
  usuario: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z',
  salir: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  menu: 'M3 12h18M3 6h18M3 18h18',
  cerrar: 'M18 6L6 18M6 6l12 12',
  plegar: 'M15 18l-6-6 6-6',
  desplegar: 'M9 18l6-6-6-6',
  // Mismo trazo que features/landing/components/Icono.tsx::marca, para que la
  // marca se vea igual en la landing y en la aplicación.
  marca:
    'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
} as const

export type NombreDeIconoNav = keyof typeof TRAZOS

interface Props {
  nombre: NombreDeIconoNav
  className?: string
}

export default function IconoNav({ nombre, className = 'h-5 w-5' }: Props) {
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

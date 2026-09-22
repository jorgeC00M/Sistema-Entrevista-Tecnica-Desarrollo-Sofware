/**
 * Todos los iconos del sistema, en un solo módulo.
 *
 * Antes había dos sets paralelos (`IconoNav.tsx` para el sidebar,
 * `features/landing/components/Icono.tsx` para la landing), con trazos y
 * grosor distintos. Se funden aquí para que "mismo grosor y tamaño en todo
 * el sistema" sea literal.
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
 *
 * Todos son decorativos —acompañan a una etiqueta que ya dice lo mismo—
 * así que llevan `aria-hidden` y no se anuncian dos veces al lector de
 * pantalla.
 */

const TRAZOS = {
  // Navegación y chrome
  mas: 'M12 5l0 14M5 12l14 0',
  play: 'M7 4v16l13 -8l-13 -8',
  historial: 'M12 8l0 4l2 2M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5',
  brujula:
    'M8 16l2 -6l6 -2l-2 6l-6 2M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M12 3l0 2M12 19l0 2M3 12l2 0M19 12l2 0',
  usuario: 'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
  salir:
    'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2M9 12h12l-3 -3M18 15l3 -3',
  menu: 'M4 6l16 0M4 12l16 0M4 18l16 0',
  cerrar: 'M18 6l-12 12M6 6l12 12',
  plegar: 'M11 7l-5 5l5 5M17 7l-5 5l5 5',
  desplegar: 'M7 7l5 5l-5 5M13 7l5 5l-5 5',
  terminal:
    'M8 9l3 3l-3 3M13 15l3 0M3 6a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -12',
  resultados: 'M4 19l16 0M4 15l4 -6l4 2l4 -5l4 4',
  reloj: 'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M12 7v5l3 3',
  // Logotipo del producto — no es un icono de Tabler, ver docstring.
  marca:
    'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',

  // Landing: cómo funciona / qué recibes / áreas
  seleccion:
    'M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M4 6l8 0M16 6l4 0M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M4 12l2 0M10 12l10 0M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M4 18l11 0M19 18l1 0',
  respuesta:
    'M8 9h8M8 13h6M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12',
  evaluacion:
    'M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14M4 20h14',
  fortaleza: 'M5 12l5 5l10 -10',
  mejora:
    'M12 9v4M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0M12 16h.01',
  sugerencia:
    'M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3M9.7 17l4.6 0',
  // `area` es el trazo `code` de Tabler: sirve de icono genérico de área y,
  // en la selección, de icono específico de Programación.
  area: 'M7 8l-4 4l4 4M17 8l4 4l-4 4M14 4l-4 16',
  datos: 'M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0M4 6v6a8 3 0 0 0 16 0v-6M4 12v6a8 3 0 0 0 16 0v-6',
  arbol:
    'M6 20a2 2 0 1 0 -4 0a2 2 0 0 0 4 0M16 4a2 2 0 1 0 -4 0a2 2 0 0 0 4 0M16 20a2 2 0 1 0 -4 0a2 2 0 0 0 4 0M11 12a2 2 0 1 0 -4 0a2 2 0 0 0 4 0M21 12a2 2 0 1 0 -4 0a2 2 0 0 0 4 0M5.058 18.306l2.88 -4.606M10.061 10.303l2.877 -4.604M10.065 13.705l2.876 4.6M15.063 5.7l2.881 4.61',
  web: 'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18',
} as const

export type NombreDeIcono = keyof typeof TRAZOS

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

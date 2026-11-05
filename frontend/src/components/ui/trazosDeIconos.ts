/**
 * Trazos de los iconos (ver la nota de origen en `Icono.tsx`). Viven aparte del
 * componente para que `Icono.tsx` exporte solo componentes (Fast Refresh) y
 * para que el catálogo pueda validar nombres que llegan como texto.
 */

export const TRAZOS = {
  // Navegación y chrome
  mas: 'M12 5l0 14M5 12l14 0',
  /** El destino «Inicio» del sidebar (Tabler `home`). */
  casa: 'M5 12l-2 0l9 -9l9 9l-2 0M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6',
  play: 'M7 4v16l13 -8l-13 -8',
  historial: 'M12 8l0 4l2 2M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5',
  usuario: 'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
  salir:
    'M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2M9 12h12l-3 -3M18 15l3 -3',
  menu: 'M4 6l16 0M4 12l16 0M4 18l16 0',
  cerrar: 'M18 6l-12 12M6 6l12 12',
  plegar: 'M11 7l-5 5l5 5M17 7l-5 5l5 5',
  desplegar: 'M7 7l5 5l-5 5M13 7l5 5l-5 5',
  /** Chevron de un desplegable cerrado (`CampoSelect`). */
  abajo: 'M6 9l6 6l6-6',
  /** Lupa del buscador del historial (search de Tabler). */
  buscar: 'M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6',
  resultados: 'M4 19l16 0M4 15l4 -6l4 2l4 -5l4 4',
  reloj: 'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M12 7v5l3 3',

  // Formularios de autenticación
  correo: 'M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10M3 7l9 6l9 -6',
  identificacion:
    'M3 7a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3l0 -10M7 10a2 2 0 1 0 4 0a2 2 0 1 0 -4 0M15 8l2 0M15 12l2 0M7 16l10 0',
  candado:
    'M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0M8 11v-4a4 4 0 1 1 8 0v4',
  'candado-check':
    'M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6M8 11v-4a4 4 0 1 1 8 0v4M9.5 16l1.8 1.8l3.2 -3.3',
  ojo: 'M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6',
  'ojo-cerrado':
    'M10.585 10.587a2 2 0 0 0 2.829 2.828M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87M3 3l18 18',
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
  web: 'M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18',

  // Landing (rediseño): flecha de los botones "Crear cuenta ↗", chevrons del
  // carrusel de áreas, ícono de información de la nota sobre la IA.
  'flecha-diagonal': 'M7 17 17 7M8 7h9v9',
  'chevron-izquierda': 'm15 6-6 6 6 6',
  'chevron-derecha': 'm9 6 6 6-6 6',
  info: 'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0 -18M12 8h.01M11 12h1v4h1',
  // Puestos que no tenían icono propio (device-mobile, device-desktop,
  // list-check y device-gamepad-2 de Tabler). El catálogo los nombra en
  // `Puesto.icono`.
  movil: 'M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14M11 4h2M12 17v.01',
  escritorio:
    'M3 5a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-10M7 20h10M9 16v4M15 16v4',
  pruebas: 'M3.5 5.5l1.5 1.5l2.5 -2.5M3.5 11.5l1.5 1.5l2.5 -2.5M3.5 17.5l1.5 1.5l2.5 -2.5M11 6l9 0M11 12l9 0M11 18l9 0',
  mando:
    'M12 5h3.5a5 5 0 0 1 0 10h-5.5l-4.015 4.227a2.3 2.3 0 0 1 -3.923 -2.035l1.634 -8.173a5 5 0 0 1 4.904 -4.019h3.4zM14 15l4.07 4.284a2.3 2.3 0 0 0 3.925 -2.023l-1.6 -8.232M8 9v2M7 10h2M14 10h2',
  // Pantalla de selección: "Repetir configuración" y convocatoria (repeat y
  // file-text de Tabler).
  repetir: 'M4 12v-3a3 3 0 0 1 3 -3h13m-3 -3l3 3l-3 3M20 12v3a3 3 0 0 1 -3 3h-13m3 3l-3 -3l3 -3',
  documento:
    'M14 3v4a1 1 0 0 0 1 1h4M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2M9 9l1 0M9 13l6 0M9 17l6 0',
} as const

function esNombreDeIcono(nombre: string): nombre is NombreDeIcono {
  return Object.hasOwn(TRAZOS, nombre)
}

/**
 * El icono que nombra el catálogo (`Puesto.icono`), o el genérico si no existe:
 * un puesto dado de alta con un icono que el frontend aún no tiene no debe
 * romper la pantalla.
 */
export function iconoDelCatalogo(nombre: string): NombreDeIcono {
  return esNombreDeIcono(nombre) ? nombre : 'area'
}

export type NombreDeIcono = keyof typeof TRAZOS

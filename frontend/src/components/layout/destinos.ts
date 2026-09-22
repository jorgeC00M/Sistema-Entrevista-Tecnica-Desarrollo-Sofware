import type { NombreDeIcono } from '@/components/ui/Icono'

export interface Destino {
  ruta: string
  etiqueta: string
  icono: NombreDeIcono
}

/**
 * Lista única de destinos del estudiante.
 *
 * La consumen la barra fija de escritorio y el cajón de móvil. Definirla una
 * sola vez evita que añadir una sección obligue a acordarse de dos sitios.
 */
export const DESTINOS: Destino[] = [
  { ruta: '/historial', etiqueta: 'Historial y progreso', icono: 'historial' },
  { ruta: '/retroalimentacion', etiqueta: 'Retroalimentación', icono: 'brujula' },
  { ruta: '/perfil', etiqueta: 'Mi perfil', icono: 'usuario' },
]

/** Va aparte: es la acción principal y se presenta como botón, no como enlace. */
export const DESTINO_PRINCIPAL: Destino = {
  ruta: '/nueva-entrevista',
  etiqueta: 'Nueva entrevista',
  icono: 'mas',
}

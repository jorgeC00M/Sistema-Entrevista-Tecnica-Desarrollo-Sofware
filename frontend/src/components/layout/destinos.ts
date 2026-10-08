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
  { ruta: '/mi-cv', etiqueta: 'Revisar mi CV', icono: 'resultados' },
  { ruta: '/historial', etiqueta: 'Historial y progreso', icono: 'historial' },
  { ruta: '/retroalimentacion', etiqueta: 'Retroalimentación', icono: 'brujula' },
  { ruta: '/perfil', etiqueta: 'Mi perfil', icono: 'usuario' },
]

/**
 * Destinos condicionales: solo existen cuando el estudiante tiene una
 * entrevista a la que aplican, así que se construyen con su id en vez de
 * vivir como entradas fijas en `DESTINOS`. Ver `specs/navegacion-app`.
 */
export function destinoEntrevistaEnCurso(id: number): Destino {
  return { ruta: `/entrevista/${id}`, etiqueta: 'Entrevista en curso', icono: 'terminal' }
}

export function destinoResultados(id: number): Destino {
  return { ruta: `/entrevista/${id}/resultados`, etiqueta: 'Resultados', icono: 'resultados' }
}

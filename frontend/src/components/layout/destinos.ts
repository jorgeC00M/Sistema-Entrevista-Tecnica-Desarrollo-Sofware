import type { NombreDeIcono } from '@/components/ui/Icono'

export interface Destino {
  ruta: string
  etiqueta: string
  icono: NombreDeIcono
}

interface GrupoDeDestinos {
  /** En tipo oración: se muestra en mayúsculas con CSS, para que el lector de pantalla no lo deletree. */
  titulo: string
  destinos: Destino[]
}

/**
 * Los destinos del estudiante, agrupados por la etapa en que los usa:
 * prepararse antes de practicar y revisar su progreso después. Practicar es el
 * botón principal del sidebar, no un destino de esta lista.
 *
 * La consumen la barra fija y el cajón de móvil: definirla una sola vez evita
 * que añadir una sección obligue a acordarse de dos sitios. No hay destinos
 * condicionales: a una entrevista a medias se llega con "Continuar", a los
 * reportes desde el historial y al perfil desde el bloque de usuario.
 */
export const GRUPOS_DE_DESTINOS: GrupoDeDestinos[] = [
  {
    titulo: 'Prepararte',
    destinos: [{ ruta: '/mi-cv', etiqueta: 'Revisar mi CV', icono: 'resultados' }],
  },
  {
    titulo: 'Tu progreso',
    destinos: [
      { ruta: '/historial', etiqueta: 'Historial y progreso', icono: 'historial' },
      { ruta: '/retroalimentacion', etiqueta: 'Retroalimentación', icono: 'brujula' },
    ],
  },
]

import type { NombreDeIcono } from '@/components/ui/Icono'

export interface Destino {
  ruta: string
  etiqueta: string
  icono: NombreDeIcono
  /**
   * Se marca como actual en todo lo que cuelga de su ruta (la entrada y sus
   * resultados), no solo en la ruta exacta.
   */
  prefijo?: boolean
}

interface GrupoDeDestinos {
  /** En tipo oración: se muestra en mayúsculas con CSS, para que el lector de pantalla no lo deletree. */
  titulo: string
  destinos: Destino[]
}

/**
 * Los destinos del estudiante, agrupados por la etapa en que los usa:
 * prepararse antes de practicar, revisar su progreso después y, aparte, su
 * cuenta. Practicar es el botón principal del sidebar, no un destino de esta
 * lista.
 *
 * La consumen la barra fija y el cajón de móvil: definirla una sola vez evita
 * que añadir una sección obligue a acordarse de dos sitios. No hay destinos
 * condicionales: a una entrevista a medias se llega con "Continuar" y a los
 * reportes desde el historial. Al perfil se llega solo por «Mi perfil»: el
 * bloque de usuario del pie ya no es enlace, para no tener dos caminos.
 */
export const GRUPOS_DE_DESTINOS: GrupoDeDestinos[] = [
  {
    titulo: 'Prepararte',
    // Dos herramientas con resultados distintos, no dos formas de llenar el
    // mismo formulario: por eso son dos destinos y no pestañas de una entrada.
    destinos: [
      { ruta: '/mi-cv/analisis', etiqueta: 'Analizar CV', icono: 'resultados', prefijo: true },
      { ruta: '/mi-cv/oferta', etiqueta: 'Comparar con oferta', icono: 'documento', prefijo: true },
    ],
  },
  {
    titulo: 'Tu progreso',
    destinos: [{ ruta: '/historial', etiqueta: 'Historial y progreso', icono: 'historial' }],
  },
  {
    titulo: 'Tu cuenta',
    destinos: [{ ruta: '/perfil', etiqueta: 'Mi perfil', icono: 'usuario' }],
  },
]

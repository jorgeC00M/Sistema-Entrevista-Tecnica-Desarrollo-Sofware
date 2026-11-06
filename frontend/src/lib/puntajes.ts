import type { BandaDeRubrica } from '@/types/evaluacion'

/**
 * Un solo lugar donde vive el color de un puntaje. Está en `lib/` y no en
 * `features/resultados/` porque lo usan el reporte, el historial y el Inicio.
 *
 * El backend (`apps/evaluaciones/rubricas.py`) decide 4 bandas con cortes en
 * 40/60/80 y las manda en el campo `banda`. Este módulo NO recalcula esos
 * cortes desde el número crudo — solo traduce la banda ya calculada a uno de
 * 3 colores visuales. Los umbrales numéricos siguen viviendo solo en el
 * backend, una única fuente de verdad.
 */

type NivelDePuntaje = 'error' | 'progreso' | 'exito'

const NIVEL_POR_BANDA: Record<BandaDeRubrica, NivelDePuntaje> = {
  insuficiente: 'error',
  en_desarrollo: 'error',
  aceptable: 'progreso',
  solido: 'exito',
}

const ETIQUETA_POR_BANDA: Record<BandaDeRubrica, string> = {
  insuficiente: 'Insuficiente',
  en_desarrollo: 'En desarrollo',
  aceptable: 'Aceptable',
  solido: 'Sólido',
}

interface EstiloDeNivel {
  texto: string
  /** Relleno sólido — barras de progreso, el punto en un gráfico. */
  fondoSolido: string
  /** Fondo suave a juego con `texto` — chips y badges. */
  fondoSuave: string
}

const ESTILO_POR_NIVEL: Record<NivelDePuntaje, EstiloDeNivel> = {
  error: { texto: 'text-error-texto', fondoSolido: 'bg-error-texto', fondoSuave: 'bg-error-fondo' },
  progreso: {
    texto: 'text-progreso-texto',
    fondoSolido: 'bg-progreso-texto',
    fondoSuave: 'bg-progreso-fondo',
  },
  exito: { texto: 'text-exito-texto', fondoSolido: 'bg-exito-texto', fondoSuave: 'bg-exito-fondo' },
}

interface EstiloDeBanda extends EstiloDeNivel {
  /**
   * El nombre real de la banda (4 valores). Se conserva aunque el color se
   * agrupe en 3: la distinción fina de la rúbrica no se pierde, solo la
   * paleta se simplifica.
   */
  etiqueta: string
}

function construirEstiloDeBanda(banda: BandaDeRubrica): EstiloDeBanda {
  return { ...ESTILO_POR_NIVEL[NIVEL_POR_BANDA[banda]], etiqueta: ETIQUETA_POR_BANDA[banda] }
}

export const ESTILO_DE_BANDA: Record<BandaDeRubrica, EstiloDeBanda> = {
  insuficiente: construirEstiloDeBanda('insuficiente'),
  en_desarrollo: construirEstiloDeBanda('en_desarrollo'),
  aceptable: construirEstiloDeBanda('aceptable'),
  solido: construirEstiloDeBanda('solido'),
}

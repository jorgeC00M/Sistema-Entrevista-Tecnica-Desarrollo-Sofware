import type { Brecha, EstadoDeRequisito, Requisito } from '@/types/curriculum'

export type TipoDeRequisito = 'obligatorio' | 'deseable'

export interface RequisitoConTipo {
  requisito: Requisito
  /** Nulo cuando el aviso no separaba obligatorios de deseables: la etiqueta mentiría. */
  tipo: TipoDeRequisito | null
}

export interface RequisitosPorEstado {
  /** Lo que aparece en el CV: con evidencia, solo en habilidades o sin secciones reconocidas. */
  coinciden: RequisitoConTipo[]
  /** Lo que no está escrito en el CV. */
  noDetectados: RequisitoConTipo[]
}

/**
 * El reparto que leen el banner, las columnas del match y el plan, para que
 * nunca discrepen en el orden ni en qué cuenta como coincidencia.
 *
 * `declarado` cuenta como coincidencia: lo que el estado matiza es la fuerza de
 * la evidencia, no su existencia. Los obligatorios van primero en cada lista.
 */
export function requisitosPorEstado(
  brecha: Pick<Brecha, 'obligatorios' | 'deseables' | 'separada'>,
): RequisitosPorEstado {
  const conTipo = (requisitos: Requisito[], tipo: TipoDeRequisito): RequisitoConTipo[] =>
    requisitos.map((requisito) => ({ requisito, tipo: brecha.separada ? tipo : null }))
  const todos = [
    ...conTipo(brecha.obligatorios.requisitos, 'obligatorio'),
    ...conTipo(brecha.deseables.requisitos, 'deseable'),
  ]
  return {
    coinciden: todos.filter(({ requisito }) => requisito.estado !== 'ausente'),
    noDetectados: todos.filter(({ requisito }) => requisito.estado === 'ausente'),
  }
}

/** Dónde aparece cada coincidencia, dicho desde su estado medido. */
export const NOTA_DE_DONDE: Record<Exclude<EstadoDeRequisito, 'ausente'>, string> = {
  demostrado: 'En tu experiencia o tus proyectos',
  declarado: 'Solo en tu lista de habilidades: menciónalo en un logro',
  presente: 'Aparece en tu CV (no se reconocieron las secciones)',
}

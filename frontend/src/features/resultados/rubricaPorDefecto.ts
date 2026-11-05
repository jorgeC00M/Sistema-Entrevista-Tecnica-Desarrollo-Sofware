import type { CodigoDeCriterio } from '@/types/evaluacion'

/**
 * Lo que el reporte necesita de la rúbrica aunque el catálogo no haya llegado
 * (o haya fallado): los criterios, en el mismo orden que publica
 * `/api/catalogos/` (`apps/evaluaciones/rubricas.py`), y el máximo de la escala.
 * Con el catálogo cargado, los descriptores y los pesos salen del servidor.
 */
export const NIVEL_MAXIMO_POR_DEFECTO = 4

export const ORDEN_DE_CRITERIOS: CodigoDeCriterio[] = ['correccion', 'completitud', 'claridad']

/**
 * Los nombres que ve el candidato. La rúbrica, sus pesos y el texto que lee el
 * evaluador no cambian («Corrección técnica» sigue en el prompt): esto es solo
 * presentación, para que cada criterio diga qué mide.
 */
export const NOMBRE_EN_PANTALLA: Record<CodigoDeCriterio, string> = {
  correccion: 'Conocimiento técnico (corrección)',
  completitud: 'Profundidad (completitud)',
  claridad: 'Claridad',
}

import type { BandaDeRubrica } from '@/types/evaluacion'

/**
 * Color y etiqueta por banda de la rúbrica.
 *
 * El backend decide en qué banda cae cada puntuación (`apps/evaluaciones/rubricas.py`)
 * y la envía en el campo `banda`. El cliente solo la pinta: si los umbrales
 * cambian, cambian en un solo sitio.
 */
export const ESTILO_DE_BANDA: Record<BandaDeRubrica, { texto: string; fondo: string; etiqueta: string }> = {
  insuficiente: { texto: 'text-red-600', fondo: 'bg-red-500', etiqueta: 'Insuficiente' },
  en_desarrollo: { texto: 'text-red-600', fondo: 'bg-red-400', etiqueta: 'En desarrollo' },
  aceptable: { texto: 'text-amber-600', fondo: 'bg-amber-500', etiqueta: 'Aceptable' },
  solido: { texto: 'text-emerald-600', fondo: 'bg-emerald-500', etiqueta: 'Sólido' },
}

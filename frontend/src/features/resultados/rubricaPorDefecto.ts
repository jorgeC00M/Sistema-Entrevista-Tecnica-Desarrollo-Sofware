import type { CodigoDeCriterio } from '@/types/evaluacion'

/**
 * La rúbrica que se muestra mientras el catálogo no llegó (o si falló): los
 * mismos criterios, en el mismo orden y con los mismos nombres que publica
 * `/api/catalogos/` (`apps/evaluaciones/rubricas.py`). Con el catálogo
 * cargado, manda siempre lo que dice el servidor.
 */
export const NIVEL_MAXIMO_POR_DEFECTO = 4

export const CRITERIOS_POR_DEFECTO: { codigo: CodigoDeCriterio; nombre: string }[] = [
  { codigo: 'correccion', nombre: 'Corrección técnica' },
  { codigo: 'completitud', nombre: 'Completitud' },
  { codigo: 'claridad', nombre: 'Claridad' },
]

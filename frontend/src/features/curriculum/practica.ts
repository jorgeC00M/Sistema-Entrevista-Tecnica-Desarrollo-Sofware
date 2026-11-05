import type { RevisionIA } from '@/types/curriculum'

/**
 * Adónde lleva "Practicar la entrevista": al puesto que la IA sugirió para este
 * CV, preseleccionado por la URL, o a la selección vacía. Se usa en el Resumen
 * y en "Para la entrevista"; definirlo una vez evita que las dos URL diverjan.
 */
export function destinoDePractica(revision: RevisionIA | null): string {
  const puesto = revision?.puesto_sugerido
  return puesto ? `/simular-entrevista?puesto=${encodeURIComponent(puesto)}` : '/simular-entrevista'
}

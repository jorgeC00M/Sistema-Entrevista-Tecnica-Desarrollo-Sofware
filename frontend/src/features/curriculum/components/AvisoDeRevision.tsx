import Icono from '@/components/ui/Icono'
import type { RevisionIA } from '@/types/curriculum'

/**
 * Una línea cuando no hay sugerencias de IA, con el motivo.
 *
 * No es una `Alerta`: el diagnóstico sí llegó, completo, y una caja roja haría
 * creer que algo del análisis falló. Las sugerencias son complementarias.
 */
export default function AvisoDeRevision({ revision }: { revision: RevisionIA | null }) {
  if (!revision || revision.estado === 'ok') return null

  return (
    <p className="flex items-start gap-1.5 text-sm text-vidrio-muted">
      <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>
        {revision.estado === 'no_disponible' ? 'Sugerencias de IA no disponibles. ' : 'Sin sugerencias de IA. '}
        {revision.motivo}
      </span>
    </p>
  )
}

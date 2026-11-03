import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'
import type { EstadoDeLaRevision } from '@/features/curriculum/hooks/useRevisionDelCv'
import type { RevisionIA } from '@/types/curriculum'

interface Props {
  revision: RevisionIA | null
  estado: EstadoDeLaRevision
  onReintentar: () => void
}

/**
 * Una línea sobre las sugerencias de IA cuando todavía no están, o no estarán.
 *
 * No es una `Alerta`: el diagnóstico sí llegó, completo, y una caja roja haría
 * creer que algo del análisis falló. Las sugerencias son complementarias y van
 * en otra petición, así que mientras llegan se dice, y si fallan se puede
 * reintentar sin volver a subir el CV. Una revisión `omitida` no se reintenta:
 * el motivo está en el documento.
 */
export default function AvisoDeRevision({ revision, estado, onReintentar }: Props) {
  if (estado === 'pidiendo') {
    return (
      <p className="flex items-start gap-1.5 text-sm text-vidrio-muted">
        <Icono nombre="reloj" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Pidiendo sugerencias a la IA… El diagnóstico ya está completo; esto puede tardar un poco.</span>
      </p>
    )
  }

  const fallo = estado === 'fallo'
  // Con la revisión lista no se dice nada, ni siquiera que vino vacía: ese
  // aviso se quitó por decisión del usuario (`plan-de-mejora-como-lista-de-arreglos`).
  if (!fallo && revision?.estado === 'ok') return null
  if (!fallo && !revision) return null

  const reintentable = fallo || revision?.estado === 'no_disponible'
  const texto = fallo
    ? 'No pudimos obtener las sugerencias a tiempo. El diagnóstico no depende de ellas.'
    : `${revision?.estado === 'no_disponible' ? 'Sugerencias de IA no disponibles. ' : 'Sin sugerencias de IA. '}${revision?.motivo ?? ''}`

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-vidrio-muted">
      <p className="flex items-start gap-1.5">
        <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{texto}</span>
      </p>
      {reintentable && (
        <Boton variante="texto" tamano="sm" onClick={onReintentar}>
          Reintentar sugerencias
        </Boton>
      )}
    </div>
  )
}

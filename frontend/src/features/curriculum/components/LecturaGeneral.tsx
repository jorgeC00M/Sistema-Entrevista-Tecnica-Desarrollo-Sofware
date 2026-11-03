import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'
import type { EstadoDeLaRevision } from '@/features/curriculum/hooks/useRevisionDelCv'
import type { RevisionIA } from '@/types/curriculum'

interface Props {
  revision: RevisionIA | null
  estado: EstadoDeLaRevision
}

/**
 * «Lectura general»: un párrafo de la IA que resume las dos columnas del match,
 * rotulado «Generado por IA» y con su nota al pie.
 *
 * Nunca dice si la persona es apta: el backend descarta la lectura entera si lo
 * concluye, si estima una probabilidad o si da un porcentaje, y entonces aquí se
 * dice que no está disponible, como cuando el proveedor falla. El reintento es el
 * del aviso común de la pestaña.
 */
export default function LecturaGeneral({ revision, estado }: Props) {
  const lectura = revision?.estado === 'ok' ? (revision.lectura ?? '') : ''

  return (
    <Tarjeta como="section" className="flex flex-col gap-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-headline-md font-semibold text-vidrio-ink">Lectura general</h3>
        {lectura && <EtiquetaMono tono="marca">Generado por IA</EtiquetaMono>}
      </div>
      {estado === 'pidiendo' ? (
        <p className="text-sm text-vidrio-muted">Pidiendo la lectura a la IA…</p>
      ) : lectura ? (
        <>
          <p className="max-w-prose text-sm leading-relaxed text-vidrio-ink">{lectura}</p>
          <p className="border-t border-vidrio-linea pt-2 text-meta text-vidrio-muted">
            Este texto solo resume lo detectado arriba. Puede contener errores y no evalúa si eres apto para el puesto.
          </p>
        </>
      ) : (
        <p className="text-sm text-vidrio-muted">La lectura no está disponible.</p>
      )}
    </Tarjeta>
  )
}

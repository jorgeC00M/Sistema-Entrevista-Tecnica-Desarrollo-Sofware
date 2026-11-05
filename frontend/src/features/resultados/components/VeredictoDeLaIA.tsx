import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'
import { veredictoPorReglas } from '@/features/resultados/reporte'
import type { ResumenEntrevista, Veredicto } from '@/types/entrevista'

interface Props {
  veredicto: Veredicto | null
  pidiendo: boolean
  resumen: ResumenEntrevista
  onReintentar: () => void
}

/**
 * «Veredicto de la IA»: un párrafo que resume la entrevista, rotulado como IA y
 * con su nota al pie. Nunca califica: el servidor lo descarta si da una nota o
 * juzga la aptitud.
 *
 * Si falta o no está disponible, se muestra el mismo resumen armado por reglas
 * (`veredictoPorReglas`), **sin** el rótulo de IA —no lo escribió la IA—, y
 * «Reintentar».
 */
export default function VeredictoDeLaIA({ veredicto, pidiendo, resumen, onReintentar }: Props) {
  const texto = veredicto?.estado === 'ok' ? veredicto.texto : ''

  return (
    <Tarjeta como="section" className="flex min-w-0 flex-col gap-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Veredicto de la IA
        </h2>
        {texto && <EtiquetaMono tono="marca">Generado por IA</EtiquetaMono>}
      </div>
      {/* Una sola región anunciada para los tres estados. */}
      <div aria-live="polite" className="flex flex-col gap-2">
        {pidiendo ? (
          <p className="text-sm text-vidrio-muted">Escribiendo tu veredicto…</p>
        ) : texto ? (
          <>
            <p className="max-w-prose text-sm leading-relaxed text-vidrio-ink">{texto}</p>
            <p className="border-t border-vidrio-linea pt-2 text-meta text-vidrio-muted">
              Resume tus evaluaciones; no cambia tu nota. Puede contener errores y no evalúa si eres apto para el puesto.
            </p>
          </>
        ) : (
          <>
            <p className="max-w-prose text-sm leading-relaxed text-vidrio-ink">{veredictoPorReglas(resumen)}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-vidrio-linea pt-2">
              <p className="text-meta text-vidrio-muted">El veredicto de la IA no está disponible.</p>
              <Boton variante="texto" tamano="sm" onClick={onReintentar}>
                Reintentar
              </Boton>
            </div>
          </>
        )}
      </div>
    </Tarjeta>
  )
}

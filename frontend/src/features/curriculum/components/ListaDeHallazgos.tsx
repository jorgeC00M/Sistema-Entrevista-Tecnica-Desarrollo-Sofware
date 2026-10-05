import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import type { Hallazgo, Severidad } from '@/types/curriculum'

/**
 * Las severidades se muestran con el mismo color que ya usa el producto para
 * evaluar respuestas, no con una escala nueva. `info` no lleva etiqueta: un
 * hallazgo favorable no necesita que se le ponga una gravedad.
 */
const POR_SEVERIDAD: Record<Severidad, { etiqueta: string; clases: string }> = {
  critica: { etiqueta: 'Crítico', clases: 'bg-error-fondo text-error-texto' },
  alta: { etiqueta: 'Importante', clases: 'bg-progreso-fondo text-progreso-texto' },
  media: { etiqueta: 'Menor', clases: 'bg-vidrio-field text-vidrio-muted' },
  info: { etiqueta: '', clases: '' },
}

interface Props {
  titulo: string
  hallazgos: Hallazgo[]
  /** Fortalezas y debilidades se distinguen por el acento, no por el orden. */
  favorable?: boolean
  /** Qué decir cuando la lista está vacía, que no es lo mismo que un fallo. */
  vacio: string
}

export default function ListaDeHallazgos({ titulo, hallazgos, favorable = false, vacio }: Props) {
  const acento = favorable ? 'border-t-exito-texto' : 'border-t-progreso-texto'
  const color = favorable ? 'text-exito-texto' : 'text-progreso-texto'

  return (
    <Tarjeta className={`border-t-2 p-5 ${acento}`}>
      <h2 className={`text-label-mono uppercase ${color}`}>{titulo}</h2>

      {hallazgos.length === 0 ? (
        <p className="mt-3 text-sm text-vidrio-muted">{vacio}</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {hallazgos.map((hallazgo) => {
            const severidad = POR_SEVERIDAD[hallazgo.severidad]
            return (
              <li key={hallazgo.codigo} className="flex items-start gap-3">
                <span className={`mt-0.5 shrink-0 ${color}`}>
                  <Icono
                    nombre={favorable ? 'fortaleza' : 'mejora'}
                    className="h-4 w-4"
                    aria-hidden
                  />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-vidrio-ink">{hallazgo.titulo}</h3>
                    {severidad.etiqueta && (
                      <span
                        className={`rounded-chip px-2 py-0.5 font-mono-vidrio text-label-mono uppercase ${severidad.clases}`}
                      >
                        {severidad.etiqueta}
                      </span>
                    )}
                  </div>
                  {/* El detalle explica qué hacer, no solo qué está mal: es la
                      diferencia entre un diagnóstico y algo accionable. */}
                  <p className="mt-1 text-sm leading-relaxed text-vidrio-texto">
                    {hallazgo.detalle}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Tarjeta>
  )
}

/** Resumen en una línea, para la cabecera del resultado. */
export function ResumenDeSeveridad({ debilidades }: { debilidades: Hallazgo[] }) {
  const criticas = debilidades.filter((h) => h.severidad === 'critica').length
  const importantes = debilidades.filter((h) => h.severidad === 'alta').length

  if (debilidades.length === 0) {
    return <EtiquetaMono tono="marca">Sin problemas de parseo</EtiquetaMono>
  }

  const partes: string[] = []
  if (criticas) partes.push(`${criticas} crítico${criticas === 1 ? '' : 's'}`)
  if (importantes) partes.push(`${importantes} importante${importantes === 1 ? '' : 's'}`)
  if (partes.length === 0) partes.push(`${debilidades.length} menor${debilidades.length === 1 ? '' : 'es'}`)

  return <EtiquetaMono>{partes.join(' · ')}</EtiquetaMono>
}

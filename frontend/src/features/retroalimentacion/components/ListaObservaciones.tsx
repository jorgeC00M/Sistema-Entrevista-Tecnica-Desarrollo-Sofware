import { Link } from 'react-router-dom'

import ChipPuntaje from '@/components/ui/ChipPuntaje'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import type { Observacion } from '@/types/evaluacion'

interface Props {
  observaciones: Observacion[]
}

export default function ListaObservaciones({ observaciones }: Props) {
  if (observaciones.length === 0) return null

  return (
    <div>
      <h2 className="text-headline-sm font-semibold text-tinta-950">Lo que te han señalado</h2>
      <p className="mt-1 text-body-sm text-tinta-500">
        De la más reciente a la más antigua, incluidas las entrevistas que dejaste a medias.
      </p>

      <ul className="mt-4 space-y-3">
        {observaciones.map((o) => (
          <li
            key={`${o.entrevista_id}-${o.numero}`}
            className="rounded-superficie bg-white p-4 ring-1 ring-tinta-100 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <EtiquetaMono tono="suelto">
                {o.area_display} · Pregunta {String(o.numero).padStart(2, '0')} ·{' '}
                {new Date(o.fecha).toLocaleDateString('es-BO')}
              </EtiquetaMono>
              <ChipPuntaje puntuacion={o.puntuacion} banda={o.banda} conEtiqueta />
            </div>

            <p className="mt-2 text-sm font-medium text-tinta-800">{o.pregunta}</p>

            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <ListaRetroalimentacion variante="debilidades" texto={o.debilidades} />
              <ListaRetroalimentacion variante="sugerencias" texto={o.sugerencias} />
            </dl>

            <Link
              to={`/entrevista/${o.entrevista_id}/resultados`}
              className="mt-3 inline-block rounded text-xs font-medium text-iris-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600"
            >
              Ver la entrevista completa
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

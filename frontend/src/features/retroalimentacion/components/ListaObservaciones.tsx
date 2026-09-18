import { Link } from 'react-router-dom'

import { ESTILO_DE_BANDA } from '@/features/resultados/bandas'
import type { Observacion } from '@/types/evaluacion'

interface Props {
  observaciones: Observacion[]
}

export default function ListaObservaciones({ observaciones }: Props) {
  if (observaciones.length === 0) return null

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-700">Lo que te han señalado</h2>
      <p className="mt-1 text-xs text-slate-500">
        De la más reciente a la más antigua, incluidas las entrevistas que dejaste a medias.
      </p>

      <ul className="mt-4 space-y-3">
        {observaciones.map((o) => {
          const estilo = ESTILO_DE_BANDA[o.banda]
          return (
            <li
              key={`${o.entrevista_id}-${o.numero}`}
              className="rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-xs text-slate-500">
                  {o.area_display} · Pregunta {o.numero} ·{' '}
                  {new Date(o.fecha).toLocaleDateString('es-BO')}
                </p>
                <span className={`text-sm font-semibold ${estilo.texto}`}>
                  {o.puntuacion}/100 · {estilo.etiqueta}
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-slate-800">{o.pregunta}</p>

              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold text-amber-600 uppercase">A mejorar</dt>
                  <dd className="mt-1 text-sm text-slate-600">{o.debilidades}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-indigo-600 uppercase">Sugerencia</dt>
                  <dd className="mt-1 text-sm text-slate-600">{o.sugerencias}</dd>
                </div>
              </dl>

              <Link
                to={`/entrevista/${o.entrevista_id}/resultados`}
                className="mt-3 inline-block rounded text-xs font-medium text-indigo-600 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Ver la entrevista completa
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

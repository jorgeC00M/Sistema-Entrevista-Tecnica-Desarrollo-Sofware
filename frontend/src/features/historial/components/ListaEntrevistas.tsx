import { Link } from 'react-router-dom'

import type { Entrevista, EstadoEntrevista } from '@/types/entrevista'

const ESTADO_ESTILO: Record<EstadoEntrevista, string> = {
  finalizada: 'bg-emerald-50 text-emerald-700',
  en_progreso: 'bg-amber-50 text-amber-700',
  abandonada: 'bg-slate-100 text-slate-500',
}

interface Props {
  entrevistas: Entrevista[]
}

export default function ListaEntrevistas({ entrevistas }: Props) {
  return (
    <div className="space-y-2">
      {entrevistas.map((entrevista) => {
        // Una entrevista a medias se retoma; una terminada lleva a resultados.
        const destino =
          entrevista.estado === 'en_progreso'
            ? `/entrevista/${entrevista.id}`
            : `/entrevista/${entrevista.id}/resultados`

        return (
          <Link
            key={entrevista.id}
            to={destino}
            className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 transition hover:ring-indigo-300"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">
                {entrevista.area_display} · {entrevista.nivel_display}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(entrevista.fecha_inicio).toLocaleString('es-BO')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {entrevista.puntuacion_promedio !== null && (
                <span className="text-sm font-semibold text-slate-700">
                  {entrevista.puntuacion_promedio}
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_ESTILO[entrevista.estado]}`}
              >
                {entrevista.estado_display}
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

import { Fragment } from 'react'
import { Link } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import Divisor from '@/components/ui/Divisor'
import { TONO_POR_ESTADO } from '@/lib/estados'
import type { Entrevista } from '@/types/entrevista'

interface Props {
  entrevistas: Entrevista[]
}

export default function ListaEntrevistas({ entrevistas }: Props) {
  return (
    <div className="rounded-vidrio border border-vidrio-borde bg-vidrio-card backdrop-blur-[18px]">
      {entrevistas.map((entrevista, indice) => {
        // Una entrevista a medias se retoma; una terminada lleva a resultados.
        const destino =
          entrevista.estado === 'en_progreso'
            ? `/entrevista/${entrevista.id}`
            : `/entrevista/${entrevista.id}/resultados`

        return (
          <Fragment key={entrevista.id}>
            {indice > 0 && <Divisor />}
            <Link
              to={destino}
              className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-vidrio-field"
            >
              <div>
                <p className="text-sm font-medium text-vidrio-ink">
                  {entrevista.area_display} · {entrevista.nivel_display}
                </p>
                <p className="text-xs text-vidrio-muted">
                  {new Date(entrevista.fecha_inicio).toLocaleString('es-BO')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {entrevista.puntuacion_promedio !== null && (
                  <span className="font-mono-vidrio text-sm font-semibold text-vidrio-ink">
                    {entrevista.puntuacion_promedio}
                  </span>
                )}
                <Badge tono={TONO_POR_ESTADO[entrevista.estado]}>{entrevista.estado_display}</Badge>
              </div>
            </Link>
          </Fragment>
        )
      })}
    </div>
  )
}

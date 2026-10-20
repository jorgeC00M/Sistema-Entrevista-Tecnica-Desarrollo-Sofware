import Tarjeta from '@/components/ui/Tarjeta'
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
    <Tarjeta>
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
              className="flex flex-col gap-2 px-4 py-4 transition hover:bg-vidrio-field sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              {/* `min-w-0` + `break-words`: un puesto largo se parte en vez de
                  empujar la fila más allá del ancho de la pantalla. */}
              <div className="min-w-0">
                <p className="text-sm font-medium break-words text-vidrio-ink">
                  {entrevista.puesto_display} · {entrevista.nivel_display}
                  {entrevista.tecnologia_display && <> · {entrevista.tecnologia_display}</>}
                </p>
                <p className="text-xs text-vidrio-muted">
                  {new Date(entrevista.fecha_inicio).toLocaleString('es-BO')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {entrevista.puntuacion_promedio !== null && (
                  <span className="font-mono-vidrio text-sm font-semibold text-vidrio-ink">
                    {Math.round(entrevista.puntuacion_promedio)}
                  </span>
                )}
                <Badge tono={TONO_POR_ESTADO[entrevista.estado]}>{entrevista.estado_display}</Badge>
              </div>
            </Link>
          </Fragment>
        )
      })}
    </Tarjeta>
  )
}

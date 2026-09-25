import { Fragment } from 'react'

import ChipPuntaje from '@/components/ui/ChipPuntaje'
import Divisor from '@/components/ui/Divisor'
import { ESTILO_DE_BANDA } from '@/lib/puntajes'
import { formatearSegundosCompacto } from '@/lib/estados'
import type { Intercambio } from '@/types/entrevista'

interface Props {
  intercambios: Intercambio[]
}

export default function TablaPuntuaciones({ intercambios }: Props) {
  const calificados = intercambios.filter((i) => i.evaluacion !== null)
  if (calificados.length === 0) return null

  return (
    <div className="mb-6 rounded-vidrio border border-vidrio-borde bg-vidrio-card backdrop-blur-[18px]">
      <div className="flex items-baseline justify-between p-4 pb-3 sm:px-5 sm:pt-5">
        <h2 className="text-headline-sm font-semibold text-vidrio-ink">Desglose por pregunta</h2>
        <span className="text-body-sm text-vidrio-muted">
          {calificados.length} enunciado{calificados.length === 1 ? '' : 's'} evaluado
          {calificados.length === 1 ? '' : 's'}
        </span>
      </div>

      {calificados.map((i, indice) => {
        const evaluacion = i.evaluacion!
        const estilo = ESTILO_DE_BANDA[evaluacion.banda]
        return (
          <Fragment key={i.numero}>
            {indice > 0 && <Divisor />}
            <div className="flex flex-wrap items-center gap-3 p-4 sm:px-5">
              <span className="font-mono-vidrio text-body-sm text-vidrio-muted">
                {String(i.numero).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-vidrio-ink">{i.pregunta}</p>
                <p className="text-body-sm text-vidrio-muted">
                  {estilo.etiqueta}
                  {i.tiempo_respuesta !== null && (
                    <> · {formatearSegundosCompacto(i.tiempo_respuesta)}</>
                  )}
                </p>
              </div>
              <ChipPuntaje puntuacion={evaluacion.puntuacion} banda={evaluacion.banda} />
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

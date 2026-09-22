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
    <div className="mb-6 rounded-superficie bg-white ring-1 ring-tinta-100">
      <div className="flex items-baseline justify-between p-4 pb-3 sm:px-5 sm:pt-5">
        <h2 className="text-headline-sm font-semibold text-tinta-950">Desglose por pregunta</h2>
        <span className="text-body-sm text-tinta-500">
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
              <span className="font-mono text-body-sm text-tinta-500">
                {String(i.numero).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-tinta-800">{i.pregunta}</p>
                <p className="text-body-sm text-tinta-500">
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

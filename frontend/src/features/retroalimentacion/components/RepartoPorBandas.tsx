import { ESTILO_DE_BANDA } from '@/lib/puntajes'
import type { BandaDeRubrica, RepartoPorArea } from '@/types/evaluacion'

// De peor a mejor, para que la barra se lea como una progresión.
const ORDEN: BandaDeRubrica[] = ['insuficiente', 'en_desarrollo', 'aceptable', 'solido']

interface Props {
  areas: RepartoPorArea[]
}

export default function RepartoPorBandas({ areas }: Props) {
  if (areas.length === 0) return null

  return (
    <div className="rounded-superficie bg-white p-4 ring-1 ring-tinta-100 sm:p-5">
      <h2 className="text-headline-sm font-semibold text-tinta-950">
        Cómo se reparten tus respuestas
      </h2>
      <p className="mt-1 text-body-sm text-tinta-500">
        Por área, cuántas de tus respuestas cayeron en cada nivel de la rúbrica.
      </p>

      <div className="mt-4 space-y-5">
        {areas.map((area) => (
          <div key={area.area}>
            <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium text-tinta-800">{area.area_display}</span>
              <span className="text-xs text-tinta-500">
                {area.total_respuestas} respuesta{area.total_respuestas === 1 ? '' : 's'} · promedio{' '}
                <span className="font-mono">{Math.round(area.promedio)}</span>
              </span>
            </div>

            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-tinta-100">
              {ORDEN.map((banda) => {
                const cuantas = area.bandas[banda]
                if (cuantas === 0) return null
                const porcentaje = (cuantas / area.total_respuestas) * 100
                return (
                  <div
                    key={banda}
                    className={ESTILO_DE_BANDA[banda].fondoSolido}
                    style={{ width: `${porcentaje}%` }}
                  />
                )
              })}
            </div>

            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-tinta-500">
              {ORDEN.map((banda) => {
                const cuantas = area.bandas[banda]
                if (cuantas === 0) return null
                return (
                  <li key={banda} className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${ESTILO_DE_BANDA[banda].fondoSolido}`}
                      aria-hidden="true"
                    />
                    {ESTILO_DE_BANDA[banda].etiqueta}: {cuantas}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

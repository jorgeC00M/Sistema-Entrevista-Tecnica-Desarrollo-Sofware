import { ESTILO_DE_BANDA } from '@/features/resultados/bandas'
import type { Intercambio } from '@/types/entrevista'

interface Props {
  intercambios: Intercambio[]
}

export default function TablaPuntuaciones({ intercambios }: Props) {
  const calificados = intercambios.filter((i) => i.evaluacion !== null)
  if (calificados.length === 0) return null

  return (
    <div className="mb-6 rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <h3 className="mb-3 text-sm font-medium text-slate-700">Puntuación por pregunta</h3>
      <div className="space-y-2">
        {calificados.map((i) => {
          const evaluacion = i.evaluacion!
          const estilo = ESTILO_DE_BANDA[evaluacion.banda]
          return (
            <div key={i.numero} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 text-slate-500">Pregunta {i.numero}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${estilo.fondo}`}
                  style={{ width: `${evaluacion.puntuacion}%` }}
                />
              </div>
              <span className={`w-10 shrink-0 text-right font-semibold ${estilo.texto}`}>
                {evaluacion.puntuacion}
              </span>
              <span className="hidden w-24 shrink-0 text-xs text-slate-400 sm:inline">
                {estilo.etiqueta}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

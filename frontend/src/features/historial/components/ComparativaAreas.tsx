import type { PromedioPorArea } from '@/types/evaluacion'

interface Props {
  areas: PromedioPorArea[]
}

export default function ComparativaAreas({ areas }: Props) {
  if (areas.length === 0) return null

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <h3 className="mb-3 text-sm font-medium text-slate-700">Promedio por área</h3>
      <div className="space-y-3">
        {areas.map((area) => (
          <div key={area.area}>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span>
                {area.area_display}{' '}
                <span className="text-slate-400">
                  ({area.entrevistas} entrevista{area.entrevistas === 1 ? '' : 's'})
                </span>
              </span>
              <span className="font-medium text-slate-700">{Math.round(area.promedio)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${Math.min(100, area.promedio)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

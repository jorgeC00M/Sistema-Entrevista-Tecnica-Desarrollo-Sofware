import Tarjeta from '@/components/ui/Tarjeta'
import type { PromedioPorArea } from '@/types/evaluacion'

interface Props {
  areas: PromedioPorArea[]
}

export default function ComparativaAreas({ areas }: Props) {
  if (areas.length === 0) return null

  return (
    <Tarjeta className="p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-medium text-vidrio-ink">Promedio por área</h3>
      <div className="space-y-3">
        {areas.map((area) => (
          <div key={area.area}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs text-vidrio-muted">
              <span>
                {area.area_display}{' '}
                <span className="text-vidrio-muted">
                  ({area.entrevistas} entrevista{area.entrevistas === 1 ? '' : 's'})
                </span>
              </span>
              <span className="font-mono-vidrio font-medium text-vidrio-ink">
                {Math.round(area.promedio)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-vidrio-field">
              <div
                className="h-full rounded-full bg-vidrio-acento"
                style={{ width: `${Math.min(100, area.promedio)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Tarjeta>
  )
}

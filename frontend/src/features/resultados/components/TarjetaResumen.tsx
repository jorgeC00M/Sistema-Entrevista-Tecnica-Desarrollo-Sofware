import type { Entrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
}

export default function TarjetaResumen({ entrevista }: Props) {
  return (
    <div className="mb-6 rounded-xl bg-white p-5 text-center ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">
        {entrevista.area_display} · {entrevista.nivel_display}
      </p>
      <p className="mt-2 text-4xl font-semibold text-indigo-600">
        {entrevista.puntuacion_promedio ?? '—'}
      </p>
      <p className="text-sm text-slate-500">Puntuación promedio sobre 100</p>
    </div>
  )
}

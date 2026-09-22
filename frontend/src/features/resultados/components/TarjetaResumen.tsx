import type { Entrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
}

export default function TarjetaResumen({ entrevista }: Props) {
  return (
    <div className="mb-6 rounded-superficie bg-white p-5 text-center ring-1 ring-tinta-100">
      <p className="text-sm text-tinta-500">
        {entrevista.area_display} · {entrevista.nivel_display}
      </p>
      <p className="mt-2 font-mono text-4xl font-medium text-iris-600">
        {entrevista.puntuacion_promedio ?? '—'}
      </p>
      <p className="text-sm text-tinta-500">Puntuación promedio sobre 100</p>
    </div>
  )
}

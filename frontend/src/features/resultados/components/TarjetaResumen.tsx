import EtiquetaMono from '@/components/ui/EtiquetaMono'
import type { Entrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
}

export default function TarjetaResumen({ entrevista }: Props) {
  return (
    <div className="mb-6 flex flex-col items-center gap-1 rounded-superficie bg-white p-6 text-center ring-1 ring-tinta-100 sm:flex-row sm:justify-between sm:text-left">
      <div>
        <EtiquetaMono tono="suelto">Calificación general</EtiquetaMono>
        <p className="text-sm text-tinta-500">
          {entrevista.area_display} · {entrevista.nivel_display}
        </p>
      </div>

      <p className="font-mono text-4xl font-medium text-iris-600">
        {entrevista.puntuacion_promedio ?? '—'}
        <span className="text-headline-md font-normal text-tinta-500"> / 100</span>
      </p>
    </div>
  )
}

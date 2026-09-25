import EtiquetaMono from '@/components/ui/EtiquetaMono'
import type { Entrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
}

export default function TarjetaResumen({ entrevista }: Props) {
  return (
    <div className="mb-6 flex flex-col items-center gap-1 rounded-vidrio border border-vidrio-borde bg-vidrio-card p-6 text-center backdrop-blur-[18px] sm:flex-row sm:justify-between sm:text-left">
      <div>
        <EtiquetaMono tono="suelto">Calificación general</EtiquetaMono>
        <p className="text-sm text-vidrio-texto">
          {entrevista.area_display} · {entrevista.nivel_display}
        </p>
      </div>

      <p className="font-mono-vidrio text-4xl font-medium text-vidrio-acento">
        {entrevista.puntuacion_promedio ?? '—'}
        <span className="text-headline-md font-normal text-vidrio-muted"> / 100</span>
      </p>
    </div>
  )
}

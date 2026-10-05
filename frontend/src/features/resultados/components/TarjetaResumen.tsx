import Tarjeta from '@/components/ui/Tarjeta'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import type { Entrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
}

export default function TarjetaResumen({ entrevista }: Props) {
  return (
    <Tarjeta className="mb-6 flex flex-col items-center gap-1 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <EtiquetaMono tono="suelto">Calificación general</EtiquetaMono>
        <p className="text-sm text-vidrio-texto">
          {entrevista.puesto_display} · {entrevista.nivel_display}
          {entrevista.tecnologia_display && <> · {entrevista.tecnologia_display}</>}
        </p>
      </div>

      <p className="font-mono-vidrio text-4xl font-medium text-vidrio-acento">
        {entrevista.puntuacion_promedio === null
          ? '—'
          : Math.round(entrevista.puntuacion_promedio)}
        <span className="text-headline-md font-normal text-vidrio-muted"> / 100</span>
      </p>
    </Tarjeta>
  )
}

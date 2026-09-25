import ChipPuntaje from '@/components/ui/ChipPuntaje'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import type { Intercambio } from '@/types/entrevista'

interface Props {
  intercambio: Intercambio
}

export default function PanelCualitativo({ intercambio }: Props) {
  const { numero, pregunta, respuesta, evaluacion } = intercambio
  if (!evaluacion) return null

  return (
    <article className="rounded-vidrio border border-vidrio-borde bg-vidrio-card p-4 backdrop-blur-[18px] sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <EtiquetaMono tono="suelto">Pregunta {String(numero).padStart(2, '0')}</EtiquetaMono>
        <ChipPuntaje puntuacion={evaluacion.puntuacion} banda={evaluacion.banda} conEtiqueta />
      </div>

      <p className="mb-3 text-sm font-medium text-vidrio-ink">{pregunta}</p>
      <p className="mb-4 rounded-control bg-vidrio-field p-3 text-sm whitespace-pre-wrap text-vidrio-texto">
        {respuesta}
      </p>

      <dl className="grid gap-3 sm:grid-cols-3">
        <ListaRetroalimentacion variante="fortalezas" texto={evaluacion.fortalezas} />
        <ListaRetroalimentacion variante="debilidades" texto={evaluacion.debilidades} />
        <ListaRetroalimentacion variante="sugerencias" texto={evaluacion.sugerencias} />
      </dl>
    </article>
  )
}

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
    <article className="rounded-superficie bg-white p-4 ring-1 ring-tinta-100 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <EtiquetaMono tono="suelto">Pregunta {String(numero).padStart(2, '0')}</EtiquetaMono>
        <ChipPuntaje puntuacion={evaluacion.puntuacion} banda={evaluacion.banda} conEtiqueta />
      </div>

      <p className="mb-3 text-sm font-medium text-tinta-800">{pregunta}</p>
      <p className="mb-4 rounded-control bg-tinta-50 p-3 text-sm whitespace-pre-wrap text-tinta-500">
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

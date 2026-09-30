import Tarjeta from '@/components/ui/Tarjeta'
import ChipPuntaje from '@/components/ui/ChipPuntaje'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import { formatearSegundosCompacto } from '@/lib/estados'
import type { Intercambio } from '@/types/entrevista'

interface Props {
  intercambio: Intercambio
}

export default function PanelCualitativo({ intercambio }: Props) {
  const { numero, pregunta, respuesta, evaluacion, tiempo_respuesta } = intercambio
  if (!evaluacion) return null

  return (
    <Tarjeta como="article" className="p-4 sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <EtiquetaMono tono="suelto">
          Pregunta {String(numero).padStart(2, '0')}
          {/* El tiempo vivía en la tabla de desglose, que repetía lo que este
              panel ya dice. Al quitarla, este es su sitio natural. */}
          {tiempo_respuesta !== null && <> · {formatearSegundosCompacto(tiempo_respuesta)}</>}
        </EtiquetaMono>
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
    </Tarjeta>
  )
}

import Tarjeta from '@/components/ui/Tarjeta'
import ChipPuntaje from '@/components/ui/ChipPuntaje'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import DesgloseDeNota from '@/features/resultados/components/DesgloseDeNota'
import { formatearSegundosCompacto } from '@/lib/estados'
import type { Rubrica } from '@/types/catalogos'
import type { Intercambio } from '@/types/entrevista'

interface Props {
  intercambio: Intercambio
  rubrica: Rubrica | null
}

export default function PanelCualitativo({ intercambio, rubrica }: Props) {
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

      {/* Las evaluaciones anteriores a la rúbrica por niveles no traen
          desglose: conservan su nota y se muestran como siempre. */}
      {evaluacion.niveles && (
        <DesgloseDeNota niveles={evaluacion.niveles} puntuacion={evaluacion.puntuacion} rubrica={rubrica} />
      )}

      {evaluacion.puntos_clave.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-vidrio-ink">Una respuesta completa cubría</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-vidrio-texto marker:text-vidrio-tenue">
            {evaluacion.puntos_clave.map((punto) => (
              <li key={punto}>{punto}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid gap-3 sm:grid-cols-3">
        <ListaRetroalimentacion variante="fortalezas" texto={evaluacion.fortalezas} />
        <ListaRetroalimentacion variante="debilidades" texto={evaluacion.debilidades} />
        <ListaRetroalimentacion variante="sugerencias" texto={evaluacion.sugerencias} />
      </dl>
    </Tarjeta>
  )
}

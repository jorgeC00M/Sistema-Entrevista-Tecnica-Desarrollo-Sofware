import Tarjeta from '@/components/ui/Tarjeta'
import ChipPuntaje from '@/components/ui/ChipPuntaje'
import BurbujaPregunta from '@/features/entrevista/components/BurbujaPregunta'
import type { MensajeDeChat } from '@/features/entrevista/hooks/useEntrevista'

interface Props {
  mensajes: MensajeDeChat[]
  evaluando: boolean
}

export default function ChatEntrevista({ mensajes, evaluando }: Props) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto rounded-vidrio bg-vidrio-bg p-4">
      {mensajes.map((mensaje, indice) => (
        // El índice sirve de clave porque la lista solo crece por el final:
        // nunca se reordena ni se inserta en medio.
        <div key={indice} className="flex flex-col gap-1.5">
          <BurbujaPregunta autor={mensaje.autor}>{mensaje.texto}</BurbujaPregunta>

          {/* Retroalimentación en línea: aparece tras la respuesta que
              califica, sin esperar a la pantalla de resultados. */}
          {mensaje.evaluacion && (
            <Tarjeta className="flex max-w-[85%] flex-col gap-1.5 self-end px-4 py-3 sm:max-w-[75%]">
              <ChipPuntaje
                puntuacion={mensaje.evaluacion.puntuacion}
                banda={mensaje.evaluacion.banda}
                conEtiqueta
              />
              <p className="text-sm text-vidrio-texto">{mensaje.evaluacion.fortalezas}</p>
            </Tarjeta>
          )}
        </div>
      ))}

      {evaluando && (
        <div className="flex items-center gap-2 px-2 text-sm text-vidrio-muted" role="status">
          <span className="h-2 w-2 animate-bounce rounded-full bg-vidrio-muted [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-vidrio-muted [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-vidrio-muted" />
          <span>Evaluando tu respuesta…</span>
        </div>
      )}
    </div>
  )
}

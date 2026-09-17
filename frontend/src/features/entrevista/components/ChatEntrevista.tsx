import BurbujaPregunta from '@/features/entrevista/components/BurbujaPregunta'
import type { MensajeDeChat } from '@/features/entrevista/hooks/useEntrevista'

interface Props {
  mensajes: MensajeDeChat[]
  evaluando: boolean
}

export default function ChatEntrevista({ mensajes, evaluando }: Props) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-slate-100 p-4">
      {mensajes.map((mensaje, indice) => (
        // El índice sirve de clave porque la lista solo crece por el final:
        // nunca se reordena ni se inserta en medio.
        <BurbujaPregunta key={indice} autor={mensaje.autor}>
          {mensaje.texto}
        </BurbujaPregunta>
      ))}

      {evaluando && (
        <div className="flex items-center gap-2 px-2 text-sm text-slate-500" role="status">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
          <span>Evaluando tu respuesta…</span>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef } from 'react'

import BurbujaPregunta from '@/features/entrevista/components/BurbujaPregunta'
import type { MensajeDeChat } from '@/features/entrevista/hooks/useEntrevista'

interface Props {
  mensajes: MensajeDeChat[]
  evaluando: boolean
  /** La última pregunta: tras evaluarla, la IA escribe además el veredicto. */
  esLaUltima: boolean
}

export default function ChatEntrevista({ mensajes, evaluando, esLaUltima }: Props) {
  const contenedorRef = useRef<HTMLDivElement>(null)

  // A partir de la 3.ª pregunta el hilo ya no cabe en pantalla: sin esto,
  // cada pregunta o evaluación nueva llegaba fuera de la vista y había que
  // desplazarse a mano para verla.
  useEffect(() => {
    const nodo = contenedorRef.current
    if (!nodo) return
    nodo.scrollTo({ top: nodo.scrollHeight, behavior: 'smooth' })
  }, [mensajes, evaluando])

  return (
    <div
      ref={contenedorRef}
      className="flex-1 space-y-3 overflow-y-auto rounded-vidrio bg-vidrio-bg p-4"
      // `polite` para no interrumpir mientras se escribe una respuesta;
      // `atomic=false` para que solo se anuncie lo que se agrega (la
      // pregunta siguiente, la evaluación), no todo el hilo cada vez.
      aria-live="polite"
      aria-atomic="false"
    >
      {mensajes.map((mensaje, indice) => (
        // El índice sirve de clave porque la lista solo crece por el final:
        // nunca se reordena ni se inserta en medio.
        <div key={indice} className="flex flex-col gap-1.5">
          <BurbujaPregunta autor={mensaje.autor}>{mensaje.texto}</BurbujaPregunta>
        </div>
      ))}

      {evaluando && (
        // `<output>` ya lleva el rol "status" implícito (y por tanto
        // aria-live), así que no hace falta declararlo a mano.
        <output className="flex items-center gap-2 px-2 text-sm text-vidrio-muted">
          <span className="h-2 w-2 animate-bounce rounded-full bg-vidrio-muted [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-vidrio-muted [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-vidrio-muted" />
          <span>
            {esLaUltima ? 'Evaluando tu última respuesta y escribiendo tu veredicto…' : 'Evaluando tu respuesta…'}
          </span>
        </output>
      )}
    </div>
  )
}

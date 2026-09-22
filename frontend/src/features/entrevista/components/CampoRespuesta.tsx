import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

import Boton from '@/components/ui/Boton'
import Textarea from '@/components/ui/Textarea'

interface Props {
  onEnviar: (texto: string) => void
  deshabilitado: boolean
}

export default function CampoRespuesta({ onEnviar, deshabilitado }: Props) {
  const [texto, setTexto] = useState('')

  const manejarEnvio = (evento: FormEvent | KeyboardEvent) => {
    evento.preventDefault()
    const limpio = texto.trim()
    if (!limpio || deshabilitado) return
    onEnviar(limpio)
    setTexto('')
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex flex-col gap-2 border-t border-tinta-100 bg-white p-3 sm:flex-row sm:items-end"
    >
      <Textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        disabled={deshabilitado}
        rows={3}
        placeholder="Escribe tu respuesta…"
        className="flex-1"
        onKeyDown={(evento) => {
          // Enter envía; Shift+Enter hace salto de línea.
          if (evento.key === 'Enter' && !evento.shiftKey) {
            manejarEnvio(evento)
          }
        }}
      />
      <Boton type="submit" cargando={deshabilitado} disabled={!texto.trim()}>
        {deshabilitado ? 'Evaluando…' : 'Enviar'}
      </Boton>
    </form>
  )
}

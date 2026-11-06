import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

import Boton from '@/components/ui/Boton'
import Textarea from '@/components/ui/Textarea'

// Igual que `MAXIMO_CARACTERES_RESPUESTA` del backend: con 1000 se cortaba a
// la mitad una respuesta técnica que el servidor sí aceptaba.
const MAXIMO_CARACTERES = 2000

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
      className="flex flex-col gap-2 border-t border-vidrio-linea bg-vidrio-bg p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={deshabilitado}
          rows={3}
          maxLength={MAXIMO_CARACTERES}
          maximoCaracteres={MAXIMO_CARACTERES}
          placeholder="Escribe tu respuesta…"
          // El campo central de la aplicación no tenía nombre accesible: solo
          // el placeholder, que un lector de pantalla no siempre anuncia y que
          // desaparece en cuanto se escribe. No lleva `etiqueta` visible
          // porque el mockup del chat no reserva espacio para una — el
          // nombre accesible basta.
          aria-label="Tu respuesta"
          className="flex-1"
          onKeyDown={(evento) => {
            // Enter envía; Shift+Enter hace salto de línea.
            if (evento.key === 'Enter' && !evento.shiftKey) {
              manejarEnvio(evento)
            }
          }}
        />
        <Boton
          type="submit"
          variante="primario"
          cargando={deshabilitado}
          disabled={!texto.trim()}
        >
          {deshabilitado ? 'Evaluando…' : 'Enviar'}
        </Boton>
      </div>

      <p className="text-body-sm text-vidrio-muted">
        Atajo: <kbd className="rounded-full bg-vidrio-field px-2 py-0.5 font-mono-vidrio text-xs text-vidrio-texto">Enter</kbd>{' '}
        envía ·{' '}
        <kbd className="rounded-full bg-vidrio-field px-2 py-0.5 font-mono-vidrio text-xs text-vidrio-texto">
          Shift + Enter
        </kbd>{' '}
        salto de línea
      </p>
    </form>
  )
}

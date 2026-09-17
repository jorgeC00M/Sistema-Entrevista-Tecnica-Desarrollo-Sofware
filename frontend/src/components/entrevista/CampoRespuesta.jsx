import { useState } from 'react'
import Boton from '../comunes/Boton'

export default function CampoRespuesta({ onEnviar, deshabilitado }) {
  const [texto, setTexto] = useState('')

  const manejarEnvio = (evento) => {
    evento.preventDefault()
    const limpio = texto.trim()
    if (!limpio || deshabilitado) return
    onEnviar(limpio)
    setTexto('')
  }

  return (
    <form
      onSubmit={manejarEnvio}
      className="flex flex-col gap-2 border-t border-slate-200 bg-white p-3 sm:flex-row sm:items-end"
    >
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        disabled={deshabilitado}
        rows={3}
        placeholder="Escribe tu respuesta…"
        className="w-full flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none disabled:bg-slate-50"
        onKeyDown={(evento) => {
          if (evento.key === 'Enter' && !evento.shiftKey) {
            evento.preventDefault()
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

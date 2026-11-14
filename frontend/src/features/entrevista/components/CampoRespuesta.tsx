import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

import Boton from '@/components/ui/Boton'
import Textarea from '@/components/ui/Textarea'
import { borrarBorrador, guardarBorrador, leerBorrador } from '@/lib/borrador'

// Igual que `MAXIMO_CARACTERES_RESPUESTA` del backend: con 1000 se cortaba a
// la mitad una respuesta técnica que el servidor sí aceptaba.
const MAXIMO_CARACTERES = 2000

interface Props {
  onEnviar: (texto: string) => void
  deshabilitado: boolean
  /** Dónde se guarda el borrador de esta pregunta (`claveDeBorrador`). */
  claveBorrador: string
}

export default function CampoRespuesta({ onEnviar, deshabilitado, claveBorrador }: Props) {
  const [texto, setTexto] = useState(() => leerBorrador(claveBorrador))
  // Al llegar otra pregunta, el campo toma el borrador de esa (normalmente
  // vacío). Se ajusta aquí y no remontando con `key`: remontar perdería
  // `volverAlCampo` justo cuando hace falta.
  const [claveMostrada, setClaveMostrada] = useState(claveBorrador)
  if (claveMostrada !== claveBorrador) {
    setClaveMostrada(claveBorrador)
    setTexto(leerBorrador(claveBorrador))
  }
  const campo = useRef<HTMLTextAreaElement>(null)
  const formulario = useRef<HTMLFormElement>(null)
  // Si al enviar el foco estaba aquí, vuelve aquí cuando llegue la pregunta.
  const volverAlCampo = useRef(false)

  // Al deshabilitarse, el navegador le quita el foco al campo y nadie se lo
  // devolvía: había que hacer clic para escribir cada respuesta. Solo con
  // puntero fino: en el celular abriría el teclado y taparía la pregunta.
  useEffect(() => {
    if (deshabilitado || !volverAlCampo.current) return
    volverAlCampo.current = false
    if (window.matchMedia('(pointer: fine)').matches) campo.current?.focus()
  }, [deshabilitado])

  const escribir = (valor: string) => {
    setTexto(valor)
    guardarBorrador(claveBorrador, valor)
  }

  const manejarEnvio = (evento: FormEvent | KeyboardEvent) => {
    evento.preventDefault()
    const limpio = texto.trim()
    if (!limpio || deshabilitado) return
    volverAlCampo.current = formulario.current?.contains(document.activeElement) ?? false
    onEnviar(limpio)
    setTexto('')
    borrarBorrador(claveBorrador)
  }

  return (
    <form
      ref={formulario}
      onSubmit={manejarEnvio}
      className="flex flex-col gap-2 border-t border-vidrio-linea bg-vidrio-bg p-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Textarea
          ref={campo}
          value={texto}
          onChange={(e) => escribir(e.target.value)}
          disabled={deshabilitado}
          rows={3}
          maxLength={MAXIMO_CARACTERES}
          maximoCaracteres={MAXIMO_CARACTERES}
          // Mientras se evalúa, el campo dice por qué está bloqueado.
          placeholder={deshabilitado ? 'Espera la siguiente pregunta…' : 'Escribe tu respuesta…'}
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

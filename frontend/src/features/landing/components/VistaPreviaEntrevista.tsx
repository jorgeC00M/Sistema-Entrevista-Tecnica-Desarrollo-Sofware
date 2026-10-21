import { useEffect, useState } from 'react'

import ChipPuntaje from '@/components/ui/ChipPuntaje'
import Icono from '@/components/ui/Icono'
import { prefiereMovimientoReducido } from '@/lib/movimiento'

const PREGUNTA =
  '¿Cuál es la diferencia entre una pila y una cola? Da un ejemplo de uso de cada una.'
const RESPUESTA =
  'Una pila es LIFO: el último en entrar sale primero, como "deshacer". Una cola es FIFO, como una cola de impresión.'
const PUNTUACION = 85

/**
 * Vista previa ilustrativa de una entrevista, en el hero de la landing:
 * pregunta fija, respuesta que se escribe sola y una evaluación que se
 * reproducen en bucle. No es una entrevista real — no usa `useEntrevista`
 * ni ninguna API, es contenido de muestra fijo.
 *
 * El puntaje va en el mismo chip que usa la aplicación, no en un anillo de
 * progreso: en Antesala un puntaje es un dato del cuaderno, no un trofeo
 * (regla "Quiet Score" de DESIGN.md).
 *
 * Muestra la última pregunta y rotula la evaluación "al terminar": en el
 * sistema la nota no se publica mientras la entrevista sigue, y una vista
 * previa con la nota a mitad de camino prometería lo contrario.
 */
export default function VistaPreviaEntrevista() {
  const [texto, setTexto] = useState('')
  const [terminado, setTerminado] = useState(false)

  useEffect(() => {
    const reducido = prefiereMovimientoReducido()
    let cancelado = false
    const temporizadores: number[] = []

    function reproducir() {
      if (cancelado) return
      setTexto('')
      setTerminado(false)

      if (reducido) {
        setTexto(RESPUESTA)
        setTerminado(true)
        return
      }

      let i = 0
      const escribir = () => {
        if (cancelado) return
        i += 1
        setTexto(RESPUESTA.slice(0, i))
        if (i < RESPUESTA.length) {
          temporizadores.push(window.setTimeout(escribir, 30))
        } else {
          temporizadores.push(
            window.setTimeout(() => {
              if (cancelado) return
              setTerminado(true)
              temporizadores.push(window.setTimeout(reproducir, 7000))
            }, 500),
          )
        }
      }
      temporizadores.push(window.setTimeout(escribir, 1200))
    }

    reproducir()
    return () => {
      cancelado = true
      temporizadores.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return (
    <div className="grid overflow-hidden rounded-vidrio border border-white/25 bg-white/12 text-left shadow-sobre-oscuro backdrop-blur-xl sm:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col gap-2.5 border-white/18 p-5 sm:border-r">
        <div className="flex items-center gap-2.5 text-xs text-white/75">
          <b className="text-sm font-semibold text-white">Entrevista · Desarrollador Backend</b>
          <span>Básico · Pregunta 5 de 5</span>
          <span className="font-mono-vidrio ml-auto rounded-full bg-vidrio-ink px-2.5 py-0.5">
            01:42
          </span>
        </div>
        <div className="flex gap-1.5">
          {[true, true, true, true, true].map((activa, i) => (
            <i
              key={i}
              aria-hidden="true"
              className={`h-1 flex-1 rounded-full not-italic ${activa ? 'bg-white' : 'bg-white/20'}`}
            />
          ))}
        </div>
        <div>
          <div className="mb-1 font-mono-vidrio text-label-mono text-white/70 uppercase">
            IA · Entrevistador
          </div>
          <div className="max-w-[92%] rounded-burbuja rounded-tl-sm bg-white px-3.5 py-2.5 text-sm leading-normal text-vidrio-ink">
            {PREGUNTA}
          </div>
        </div>
        <div className="min-h-10 max-w-[92%] self-end rounded-burbuja rounded-tr-sm bg-vidrio-ink px-3.5 py-2.5 text-sm leading-normal text-white">
          {texto}
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-[1em] w-0.5 -translate-y-[2px] animate-pulse bg-white align-middle"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white/[0.06] p-5">
        <small className="font-mono-vidrio text-label-mono text-white/70 uppercase">
          Al terminar la entrevista · Evaluación de la IA
        </small>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {terminado ? (
            <ChipPuntaje puntuacion={PUNTUACION} banda="solido" conEtiqueta />
          ) : (
            <span className="font-mono-vidrio text-label-mono text-white/70 uppercase">Evaluando…</span>
          )}
          <span className="text-meta text-white/70">Corrección · Completitud · Claridad</span>
        </div>

        {!terminado && (
          <div className="flex items-center gap-2 text-meta text-white/70">
            <i
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-white not-italic"
            />
            Esperando tu respuesta
          </div>
        )}

        <div
          className={`flex gap-2.5 rounded-vidrio bg-white/10 p-3 text-meta text-white transition-all duration-500 ${terminado ? 'opacity-100' : 'translate-y-1.5 opacity-0'}`}
        >
          <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-chip bg-exito-fondo text-exito-texto">
            <Icono nombre="fortaleza" className="h-[13px] w-[13px]" />
          </span>
          <span>
            <b>Fortaleza:</b> definiste bien LIFO y FIFO con ejemplos reales.
          </span>
        </div>
        <div
          className={`flex gap-2.5 rounded-vidrio bg-white/10 p-3 text-meta text-white transition-all delay-[250ms] duration-500 ${terminado ? 'opacity-100' : 'translate-y-1.5 opacity-0'}`}
        >
          <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-chip bg-progreso-fondo text-progreso-texto">
            <Icono nombre="mejora" className="h-[13px] w-[13px]" />
          </span>
          <span>
            <b>Mejora:</b> menciona la complejidad O(1) de sus operaciones.
          </span>
        </div>
      </div>
    </div>
  )
}

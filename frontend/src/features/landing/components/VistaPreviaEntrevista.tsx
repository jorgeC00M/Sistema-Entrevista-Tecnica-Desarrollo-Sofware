import { useEffect, useState } from 'react'

import Icono from '@/components/ui/Icono'
import { prefiereMovimientoReducido } from '@/features/landing/hooks/useRevelarAlEntrar'

const PREGUNTA =
  '¿Cuál es la diferencia entre una pila y una cola? Da un ejemplo de uso de cada una.'
const RESPUESTA =
  'Una pila es LIFO: el último en entrar sale primero, como "deshacer". Una cola es FIFO, como una cola de impresión.'
const PUNTUACION = 85
const RADIO = 27
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

/**
 * Vista previa ilustrativa de una entrevista, en el hero de la landing:
 * pregunta fija, respuesta que se escribe sola y una evaluación que se
 * reproducen en bucle. No es una entrevista real — no usa `useEntrevista`
 * ni ninguna API, es contenido de muestra fijo, igual que las barras de
 * rúbrica ilustrativas de "Qué recibes al terminar".
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

  const offset = terminado ? CIRCUNFERENCIA * (1 - PUNTUACION / 100) : CIRCUNFERENCIA

  return (
    <div className="mx-auto mt-6 grid max-w-[940px] overflow-hidden rounded-[22px] border border-white/28 bg-white/12 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:mt-8 sm:grid-cols-[1.35fr_1fr]">
      <div className="flex flex-col gap-2.5 border-white/18 p-5 sm:border-r">
        <div className="flex items-center gap-2.5 text-xs text-white/75">
          <b className="text-[0.88rem] font-semibold text-white">Entrevista · Desarrollador Backend</b>
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
          <div className="mb-1 text-[0.66rem] tracking-[0.08em] text-white/60 uppercase">
            IA · Entrevistador
          </div>
          <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[0.88rem] leading-[1.45] text-vidrio-ink">
            {PREGUNTA}
          </div>
        </div>
        <div className="min-h-10 max-w-[92%] self-end rounded-2xl rounded-tr-sm bg-vidrio-ink px-3.5 py-2.5 text-[0.88rem] leading-[1.45] text-white">
          {texto}
          <span
            aria-hidden="true"
            className="ml-0.5 inline-block h-[1em] w-0.5 -translate-y-[2px] animate-pulse bg-white align-middle"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 bg-white/[0.06] p-5">
        <small className="text-[0.66rem] tracking-[0.08em] text-white/60 uppercase">
          Al terminar la entrevista · Evaluación de la IA
        </small>
        <div className="flex items-center gap-3.5">
          <div className="relative h-16 w-16 shrink-0">
            <svg width="64" height="64" className="-rotate-90">
              <circle
                cx="32"
                cy="32"
                r={RADIO}
                fill="none"
                stroke="rgba(255,255,255,.2)"
                strokeWidth="6"
              />
              <circle
                cx="32"
                cy="32"
                r={RADIO}
                fill="none"
                stroke="#fff"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUNFERENCIA}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)' }}
              />
            </svg>
            <b className="font-mono-vidrio absolute inset-0 grid place-items-center text-[1.05rem] text-white">
              {terminado ? PUNTUACION : '–'}
            </b>
          </div>
          <div>
            <strong className="block text-base text-white">
              {terminado ? 'Buena respuesta' : 'Evaluando…'}
            </strong>
            <span className="text-[0.8rem] text-white/70">
              Corrección · Completitud · Claridad
            </span>
          </div>
        </div>

        {!terminado && (
          <div className="flex items-center gap-2 text-[0.82rem] text-white/60">
            <i
              aria-hidden="true"
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-white not-italic"
            />
            Esperando tu respuesta
          </div>
        )}

        <div
          className={`flex gap-2.5 rounded-xl bg-white/10 p-3 text-[0.82rem] leading-[1.4] text-white transition-all duration-500 ${terminado ? 'opacity-100' : 'translate-y-1.5 opacity-0'}`}
        >
          <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] bg-exito-fondo text-exito-texto">
            <Icono nombre="fortaleza" className="h-[13px] w-[13px]" />
          </span>
          <span>
            <b>Fortaleza:</b> definiste bien LIFO y FIFO con ejemplos reales.
          </span>
        </div>
        <div
          className={`flex gap-2.5 rounded-xl bg-white/10 p-3 text-[0.82rem] leading-[1.4] text-white transition-all delay-[250ms] duration-500 ${terminado ? 'opacity-100' : 'translate-y-1.5 opacity-0'}`}
        >
          <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] bg-progreso-fondo text-progreso-texto">
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

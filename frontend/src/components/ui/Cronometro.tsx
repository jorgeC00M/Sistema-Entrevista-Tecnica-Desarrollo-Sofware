import { useEffect, useRef, useState } from 'react'

import Icono from '@/components/ui/Icono'

function formatear(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  const dosDigitos = (n: number) => String(n).padStart(2, '0')
  return h > 0
    ? `${dosDigitos(h)}:${dosDigitos(m)}:${dosDigitos(s)}`
    : `${dosDigitos(m)}:${dosDigitos(s)}`
}

/**
 * Cronómetro ascendente de la sesión, informativo: sin límite ni consecuencia
 * sobre la entrevista. Cuenta desde que este componente se monta, no desde
 * `fecha_inicio` — si contara desde ahí, una entrevista retomada al día
 * siguiente mostraría un valor sin sentido para el candidato.
 */
export default function Cronometro() {
  const inicio = useRef<number | null>(null)
  const [transcurrido, setTranscurrido] = useState(0)

  // El instante de referencia se captura al efecto, no en el render: llamar
  // a Date.now() durante el render produce un resultado inestable que puede
  // variar entre invocaciones (p. ej. bajo Strict Mode).
  useEffect(() => {
    inicio.current = Date.now()
    const id = window.setInterval(() => {
      if (inicio.current !== null) {
        setTranscurrido(Math.floor((Date.now() - inicio.current) / 1000))
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="inline-flex items-center gap-1.5 rounded-control bg-tinta-950 px-3 py-1.5 font-mono text-metric-counter text-white">
      <Icono nombre="reloj" className="h-4 w-4 text-tinta-300" />
      <span>{formatear(transcurrido)}</span>
      {/* El punto de "en vivo" es puramente decorativo: el reloj ya comunica
          que la sesión está activa, así que se apaga con movimiento reducido. */}
      <span className="h-1.5 w-1.5 rounded-full bg-exito-texto motion-safe:animate-pulse" />
    </div>
  )
}

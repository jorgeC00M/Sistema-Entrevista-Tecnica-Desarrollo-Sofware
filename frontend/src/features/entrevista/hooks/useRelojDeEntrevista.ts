import { useCallback, useEffect, useState } from 'react'

import { obtenerEstado } from '@/api/entrevistas'
import { type AnclaDelReloj, anclaDelReloj, segundosRestantes } from '@/lib/tiempo'
import type { Entrevista } from '@/types/entrevista'

/**
 * El reloj del chat: cuánto queda, contado desde lo que dijo el servidor.
 *
 * `reanclar` se llama con cada respuesta del servidor; el conteo sigue con un
 * reloj monotónico (`lib/tiempo.ts`). Al volver a la pestaña (o al despertar la
 * laptop, cuando ese reloj pudo no avanzar) se pregunta otra vez al servidor;
 * si la entrevista ya no sigue, `alCerrarse`.
 */
export function useRelojDeEntrevista(id: string, alCerrarse: () => void) {
  // Lo que quedaba al llegar la última respuesta del servidor, y cuándo llegó.
  const [ancla, setAncla] = useState<AnclaDelReloj | null>(null)
  // `null` hasta la primera respuesta.
  const [segundos, setSegundos] = useState<number | null>(null)

  const reanclar = useCallback((entrevista: Entrevista) => {
    setAncla(anclaDelReloj(entrevista.fecha_limite, entrevista.ahora, performance.now()))
  }, [])

  // Cuenta cada segundo con el reloj monotónico, desde el ancla.
  useEffect(() => {
    if (ancla === null) return
    const contar = () => setSegundos(segundosRestantes(ancla, performance.now()))
    contar()
    const intervalo = window.setInterval(contar, 1000)
    return () => window.clearInterval(intervalo)
  }, [ancla])

  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState !== 'visible') return
      obtenerEstado(id)
        .then((estado) => {
          if (estado.entrevista.estado !== 'en_progreso') alCerrarse()
          else reanclar(estado.entrevista)
        })
        .catch(() => {
          // Sin red no se reancla: el reloj sigue con el ancla anterior.
        })
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [id, alCerrarse, reanclar])

  return { segundos, vencido: segundos === 0, reanclar }
}

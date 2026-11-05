import { useEffect, useState } from 'react'

import { obtenerHistorial } from '@/api/entrevistas'
import { desfaseDelReloj, segundosRestantes } from '@/features/entrevista/tiempo'
import { usePeticion } from '@/hooks/usePeticion'
import type { Entrevista } from '@/types/entrevista'

export interface EntrevistaEnCurso {
  id: number
  puestoDisplay: string
  /** Segundos hasta el límite, con la hora del servidor; se refresca cada minuto. */
  segundosRestantes: number
}

/** El sidebar dice minutos, no segundos: basta con recontar una vez por minuto. */
const REFRESCO_MS = 60_000

/**
 * La entrevista en curso del estudiante, si hay una y no venció: alimenta
 * «Continuar · m min» del sidebar y el aviso de «Simular entrevista». Hay a lo
 * sumo una (`una-entrevista-en-curso`).
 *
 * Comparte la clave `historial` de la caché con la pantalla de historial. Se
 * mantiene al día porque quien empieza, termina o abandona una entrevista
 * invalida esa clave, y `usePeticion` avisa a las instancias montadas; el
 * endpoint además cierra las vencidas. Entre medio, los minutos se cuentan
 * aquí con `fecha_limite` y `ahora` de la fila, y en 0 deja de haber una.
 *
 * Un fallo no se reporta: es información de conveniencia para el menú, y un
 * error aquí no debe interrumpir a alguien que estaba haciendo otra cosa. Si
 * algo falla, el botón simplemente no aparece.
 */
export function useEntrevistaEnCurso(): EntrevistaEnCurso | null {
  const { datos: historial } = usePeticion<Entrevista[]>('historial', (signal) =>
    obtenerHistorial(signal),
  )
  const pendiente = historial?.find((e) => e.estado === 'en_progreso') ?? null

  // El desfase se toma al llegar el dato; el instante, en el efecto.
  const [segundos, setSegundos] = useState<number | null>(null)
  useEffect(() => {
    if (!pendiente) return
    const desfase = desfaseDelReloj(pendiente.ahora, Date.now())
    const contar = () => setSegundos(segundosRestantes(pendiente.fecha_limite, desfase, Date.now()))
    contar()
    const intervalo = window.setInterval(contar, REFRESCO_MS)
    return () => window.clearInterval(intervalo)
  }, [pendiente])

  if (!pendiente || !segundos) return null
  return { id: pendiente.id, puestoDisplay: pendiente.puesto_display, segundosRestantes: segundos }
}

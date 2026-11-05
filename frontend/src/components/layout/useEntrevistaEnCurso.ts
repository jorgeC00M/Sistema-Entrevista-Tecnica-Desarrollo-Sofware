import { useEffect, useState } from 'react'

import { obtenerEstado, obtenerHistorial } from '@/api/entrevistas'
import { desfaseDelReloj, segundosRestantes } from '@/features/entrevista/tiempo'
import { usePeticion } from '@/hooks/usePeticion'
import type { Entrevista } from '@/types/entrevista'

export interface EntrevistaEnCurso {
  id: number
  puestoDisplay: string
  numeroActual: number
  totalPreguntas: number
  /** Segundos hasta el límite, con la hora del servidor; se refresca cada minuto. */
  segundosRestantes: number
}

/** El sidebar dice minutos, no segundos: basta con recontar una vez por minuto. */
const REFRESCO_MS = 60_000

/**
 * La entrevista que el estudiante dejó a medias, si hay una y no venció:
 * alimenta el botón "Continuar · n/total · m min" del sidebar.
 *
 * Comparte la clave `historial` de la caché con la pantalla de historial, que
 * pide el mismo endpoint: así entrar a /historial no dispara dos peticiones al
 * mismo sitio, y ese endpoint además escribe, porque cierra las vencidas. Con
 * la caché, una entrevista puede vencer después de listarla: por eso los
 * minutos se cuentan aquí y, en 0, el botón desaparece.
 *
 * Un fallo no se reporta: es información de conveniencia para el menú, y un
 * error aquí no debe interrumpir a alguien que estaba haciendo otra cosa. Si
 * algo falla, el botón simplemente no aparece.
 */
export function useEntrevistaEnCurso(): EntrevistaEnCurso | null {
  const { datos: historial } = usePeticion<Entrevista[]>('historial', (signal) =>
    obtenerHistorial(signal),
  )

  // El backend ordena por fecha_inicio descendente: la primera es la más reciente.
  const pendiente = historial?.find((e) => e.estado === 'en_progreso') ?? null

  // Solo si hay una entrevista a medias —el caso raro— hace falta una segunda
  // petición para saber por qué pregunta va.
  const { datos: estado } = usePeticion(
    `estado-entrevista-${pendiente?.id ?? 'ninguna'}`,
    (signal) => obtenerEstado(pendiente!.id, signal),
    { activo: Boolean(pendiente) },
  )

  // El desfase se toma al llegar el estado; el instante, en el efecto.
  const [segundos, setSegundos] = useState<number | null>(null)
  useEffect(() => {
    if (!estado || estado.entrevista.estado !== 'en_progreso') return
    const desfase = desfaseDelReloj(estado.entrevista.ahora, Date.now())
    const contar = () => setSegundos(segundosRestantes(estado.entrevista.fecha_limite, desfase, Date.now()))
    contar()
    const intervalo = window.setInterval(contar, REFRESCO_MS)
    return () => window.clearInterval(intervalo)
  }, [estado])

  if (!pendiente || !estado || estado.entrevista.estado !== 'en_progreso' || !segundos) return null
  return {
    id: pendiente.id,
    puestoDisplay: pendiente.puesto_display,
    numeroActual: estado.pregunta_pendiente?.numero ?? estado.total_preguntas,
    totalPreguntas: estado.total_preguntas,
    segundosRestantes: segundos,
  }
}

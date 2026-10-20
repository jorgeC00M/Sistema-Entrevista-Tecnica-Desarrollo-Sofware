import { obtenerEstado, obtenerHistorial } from '@/api/entrevistas'
import { usePeticion } from '@/hooks/usePeticion'
import type { Entrevista } from '@/types/entrevista'

export interface EntrevistaEnCurso {
  id: number
  puestoDisplay: string
  numeroActual: number
  totalPreguntas: number
}

/**
 * La entrevista que el estudiante dejó a medias, si hay una: alimenta el botón
 * "Continuar · n/total" del sidebar.
 *
 * Comparte la clave `historial` de la caché con la pantalla de historial, que
 * pide el mismo endpoint: así entrar a /historial no dispara dos peticiones al
 * mismo sitio, y ese endpoint además escribe, porque marca las entrevistas
 * abandonadas.
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

  if (!pendiente || !estado) return null
  return {
    id: pendiente.id,
    puestoDisplay: pendiente.puesto_display,
    numeroActual: estado.pregunta_pendiente?.numero ?? estado.total_preguntas,
    totalPreguntas: estado.total_preguntas,
  }
}

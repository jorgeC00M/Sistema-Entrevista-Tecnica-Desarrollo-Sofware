import { obtenerEstado, obtenerHistorial } from '@/api/entrevistas'
import { usePeticion } from '@/hooks/usePeticion'
import type { Entrevista } from '@/types/entrevista'

export interface EntrevistaEnCurso {
  id: number
  puestoDisplay: string
  numeroActual: number
  totalPreguntas: number
}

export interface EntrevistaFinalizada {
  id: number
}

export interface DestinosDisponibles {
  enCurso: EntrevistaEnCurso | null
  ultimaFinalizada: EntrevistaFinalizada | null
}

/**
 * Detecta qué destinos condicionales del sidebar aplican: si el estudiante
 * dejó una entrevista a medias y si tiene al menos una finalizada para
 * enlazar a "Resultados".
 *
 * Comparte la clave `historial` de la caché con la pantalla de historial, que
 * pide el mismo endpoint. Antes este hook se recargaba en cada cambio de ruta
 * (`[pathname]`), así que entrar a /historial disparaba dos peticiones en
 * paralelo al mismo sitio — y ese endpoint además escribe, porque marca las
 * entrevistas abandonadas.
 *
 * Un fallo no se reporta: esto es información de conveniencia para el menú, y
 * un error aquí no debe interrumpir a alguien que estaba haciendo otra cosa.
 * Si algo falla, los elementos condicionales simplemente no aparecen.
 */
export function useDestinosDisponibles(): DestinosDisponibles {
  const { datos: historial } = usePeticion<Entrevista[]>('historial', (signal) =>
    obtenerHistorial(signal),
  )

  // El backend ya ordena por fecha_inicio descendente, así que la primera
  // coincidencia es siempre la más reciente.
  const finalizada = historial?.find((e) => e.estado === 'finalizada') ?? null
  const pendiente = historial?.find((e) => e.estado === 'en_progreso') ?? null

  // Solo si hay una entrevista a medias —el caso raro— hace falta una segunda
  // petición para saber por qué pregunta va.
  const { datos: estado } = usePeticion(
    `estado-entrevista-${pendiente?.id ?? 'ninguna'}`,
    (signal) => obtenerEstado(pendiente!.id, signal),
    { activo: Boolean(pendiente) },
  )

  const enCurso: EntrevistaEnCurso | null =
    pendiente && estado
      ? {
          id: pendiente.id,
          puestoDisplay: pendiente.puesto_display,
          numeroActual: estado.pregunta_pendiente?.numero ?? estado.total_preguntas,
          totalPreguntas: estado.total_preguntas,
        }
      : null

  return {
    enCurso,
    ultimaFinalizada: finalizada ? { id: finalizada.id } : null,
  }
}

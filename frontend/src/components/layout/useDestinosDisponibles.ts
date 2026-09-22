import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { obtenerEstado, obtenerHistorial } from '@/api/entrevistas'

export interface EntrevistaEnCurso {
  id: number
  areaDisplay: string
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
 * Coste: una petición al historial, que ya trae ambos datos. Solo si hay una
 * entrevista en curso —el caso raro— hace una segunda para saber por qué
 * pregunta va. Con cero entrevistas a medias, que es lo normal, se queda en
 * una petición total.
 *
 * Un fallo no se reporta: esto es información de conveniencia para el menú, y
 * un error aquí no debe interrumpir a alguien que estaba haciendo otra cosa.
 * Si algo falla, los elementos condicionales simplemente no aparecen.
 */
export function useDestinosDisponibles(): DestinosDisponibles {
  const [enCurso, setEnCurso] = useState<EntrevistaEnCurso | null>(null)
  const [ultimaFinalizada, setUltimaFinalizada] = useState<EntrevistaFinalizada | null>(null)
  const { pathname } = useLocation()

  // Se recalcula al cambiar de ruta para que el menú reaccione en cuanto el
  // estudiante termina o abandona una entrevista, sin tener que recargar.
  useEffect(() => {
    let cancelado = false

    async function detectar() {
      try {
        const historial = await obtenerHistorial()
        if (cancelado) return

        // El backend ya ordena por fecha_inicio descendente, así que la
        // primera coincidencia es siempre la más reciente.
        const finalizada = historial.find((e) => e.estado === 'finalizada')
        setUltimaFinalizada(finalizada ? { id: finalizada.id } : null)

        const pendiente = historial.find((e) => e.estado === 'en_progreso')
        if (!pendiente) {
          setEnCurso(null)
          return
        }

        const estado = await obtenerEstado(pendiente.id)
        if (cancelado) return

        setEnCurso({
          id: pendiente.id,
          areaDisplay: pendiente.area_display,
          numeroActual: estado.pregunta_pendiente?.numero ?? estado.total_preguntas,
          totalPreguntas: estado.total_preguntas,
        })
      } catch {
        if (!cancelado) {
          setEnCurso(null)
          setUltimaFinalizada(null)
        }
      }
    }

    void detectar()
    return () => {
      cancelado = true
    }
  }, [pathname])

  return { enCurso, ultimaFinalizada }
}

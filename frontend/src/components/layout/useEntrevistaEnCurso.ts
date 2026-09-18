import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { obtenerEstado, obtenerHistorial } from '@/api/entrevistas'

export interface EntrevistaEnCurso {
  id: number
  areaDisplay: string
  numeroActual: number
  totalPreguntas: number
}

/**
 * Detecta si el estudiante dejó una entrevista a medias.
 *
 * Coste: una petición al historial. Solo si hay una en curso —el caso raro—
 * hace una segunda para saber por qué pregunta va. Con cero entrevistas a
 * medias, que es lo normal, se queda en una.
 *
 * Un fallo no se reporta: esto es información de conveniencia, y un error aquí
 * no debe interrumpir a alguien que estaba haciendo otra cosa. Si algo falla,
 * el elemento simplemente no aparece.
 */
export function useEntrevistaEnCurso(): EntrevistaEnCurso | null {
  const [enCurso, setEnCurso] = useState<EntrevistaEnCurso | null>(null)
  const { pathname } = useLocation()

  // Se recalcula al cambiar de ruta para que el aviso desaparezca en cuanto el
  // estudiante termina la entrevista, sin tener que recargar la página.
  useEffect(() => {
    let cancelado = false

    async function detectar() {
      try {
        const historial = await obtenerHistorial()
        // El backend ya ordena por fecha_inicio descendente, así que la primera
        // en progreso es la más reciente.
        const pendiente = historial.find((e) => e.estado === 'en_progreso')
        if (!pendiente) {
          if (!cancelado) setEnCurso(null)
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
        if (!cancelado) setEnCurso(null)
      }
    }

    void detectar()
    return () => {
      cancelado = true
    }
  }, [pathname])

  return enCurso
}

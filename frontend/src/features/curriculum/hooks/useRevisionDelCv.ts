import { useEffect, useState } from 'react'

import { pedirRevision } from '@/api/curriculums'
import type { Curriculum, RevisionIA } from '@/types/curriculum'

/**
 * `pidiendo`: aún no llegan (o se reintentan). `fallo`: la petición falló o
 * agotó su tiempo en el cliente. `lista`: hay una revisión, sea cual sea su
 * estado en el servidor (`ok`, `no_disponible`, `omitida`).
 */
export type EstadoDeLaRevision = 'pidiendo' | 'lista' | 'fallo'

/**
 * Pide las sugerencias de IA de un análisis cuando aún no las tiene.
 *
 * El diagnóstico llega sin ellas (`revision_ia === null`) para no esperar a la
 * IA. Este hook las pide en una segunda petición, tanto tras analizar como al
 * abrir desde el historial un análisis cuyas sugerencias nunca se pidieron, y
 * las fusiona en el resultado con `alLlegar`.
 *
 * Es un efecto porque sincroniza con la red al cambiar de análisis. "Pidiendo"
 * no se guarda: se deriva de que falten las sugerencias y no haya fallado.
 */
export function useRevisionDelCv(
  curriculum: Curriculum | null,
  alLlegar: (id: number, revision: RevisionIA) => void,
): { estado: EstadoDeLaRevision; reintentar: () => void } {
  const [falloEn, setFalloEn] = useState<number | null>(null)
  const [reintentandoEn, setReintentandoEn] = useState<number | null>(null)

  const id = curriculum?.id ?? null
  const revision = curriculum?.analisis?.revision_ia
  const sinRevision = curriculum?.analisis != null && revision === null

  useEffect(() => {
    if (id === null || !sinRevision || falloEn === id) return
    const control = new AbortController()
    pedirRevision(id, control.signal)
      .then((nueva) => alLlegar(id, nueva))
      .catch(() => {
        if (!control.signal.aborted) setFalloEn(id)
      })
    return () => control.abort()
  }, [id, sinRevision, falloEn, alLlegar])

  const reintentar = () => {
    if (id === null) return
    if (sinRevision) {
      // Sin revisión guardada: basta con quitar el fallo y el efecto la pide.
      setFalloEn(null)
      return
    }
    // El servidor guardó `no_disponible`: se vuelve a pedir desde aquí.
    setReintentandoEn(id)
    pedirRevision(id)
      .then((nueva) => alLlegar(id, nueva))
      .catch(() => setFalloEn(id))
      .finally(() => setReintentandoEn(null))
  }

  const estado: EstadoDeLaRevision =
    id !== null && (reintentandoEn === id || (sinRevision && falloEn !== id))
      ? 'pidiendo'
      : id !== null && falloEn === id
        ? 'fallo'
        : 'lista'

  return { estado, reintentar }
}

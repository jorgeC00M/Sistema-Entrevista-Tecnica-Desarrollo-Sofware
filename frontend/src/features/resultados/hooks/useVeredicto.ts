import { useEffect, useState } from 'react'

import { pedirVeredicto } from '@/api/entrevistas'
import type { Veredicto } from '@/types/entrevista'

interface Estado {
  /** El veredicto vigente; `null` si nunca se pidió o el pedido falló. */
  veredicto: Veredicto | null
  pidiendo: boolean
  reintentar: () => void
}

/**
 * El veredicto de la IA del reporte.
 *
 * Solo una entrevista finalizada tiene veredicto: lo trae escrito desde el
 * último «Enviar». Las finalizadas anteriores a esta función llegan con
 * `null`, y este hook lo pide una vez al abrir el reporte. Si el servidor guardó `no_disponible`, no se
 * repite solo: el usuario decide con «Reintentar».
 *
 * "Pidiendo" no se guarda en el efecto: se deriva de que falte y no haya
 * fallado, como en `useRevisionDelCv`.
 */
export function useVeredicto(id: string | undefined, inicial: Veredicto | null, finalizada: boolean): Estado {
  const [pedido, setPedido] = useState<Veredicto | null>(null)
  const [falloEn, setFalloEn] = useState<string | null>(null)
  const [reintentando, setReintentando] = useState(false)

  const porPedir = Boolean(id) && finalizada && inicial === null && pedido === null && falloEn !== id

  useEffect(() => {
    if (!porPedir || !id) return
    const control = new AbortController()
    pedirVeredicto(id, control.signal)
      .then(setPedido)
      .catch(() => {
        if (!control.signal.aborted) setFalloEn(id)
      })
    return () => control.abort()
  }, [id, porPedir])

  const reintentar = () => {
    if (!id) return
    setReintentando(true)
    pedirVeredicto(id)
      .then(setPedido)
      .catch(() => setFalloEn(id))
      .finally(() => setReintentando(false))
  }

  return { veredicto: pedido ?? inicial, pidiendo: porPedir || reintentando, reintentar }
}

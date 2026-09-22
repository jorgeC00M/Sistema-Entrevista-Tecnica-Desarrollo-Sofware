import type { ReactNode } from 'react'

import BotonIcono from '@/components/ui/BotonIcono'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  children: ReactNode
}

export default function Modal({ abierto, onCerrar, titulo, children }: Props) {
  const { contenedorRef } = useFocusTrap<HTMLDivElement>(abierto, onCerrar)

  if (!abierto) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-tinta-950/40"
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={contenedorRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
          className="w-full max-w-md rounded-superficie bg-white p-6 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id="modal-titulo" className="text-lg font-semibold text-tinta-950">
              {titulo}
            </h2>
            <BotonIcono icono="cerrar" aria-label="Cerrar" onClick={onCerrar} />
          </div>
          {children}
        </div>
      </div>
    </>
  )
}

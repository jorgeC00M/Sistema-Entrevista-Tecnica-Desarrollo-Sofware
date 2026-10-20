import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

import BotonIcono from '@/components/ui/BotonIcono'

interface Props {
  /** Qué va a pasar, en verbo + sustantivo: "Aplicar configuración anterior". */
  titulo: string
  /** El cuerpo: consecuencias y detalles; no repite el título. */
  children: ReactNode
  /** Los botones del pie; se alinean a la derecha. */
  acciones: ReactNode
  /** Cerrar sin hacer nada: la X, Esc o quien lo use. */
  onCerrar: () => void
  /**
   * Adónde llevar el foco al cerrarse, si la acción movió al usuario a otro
   * sitio. Es una función porque se evalúa **al cerrar**: el destino puede
   * aparecer recién por efecto de la acción, y quien lo usa decide según cómo
   * se cerró (tras confirmar sí, tras cancelar no). Si no hay función o
   * devuelve `null`, el foco vuelve a quien abrió el modal.
   */
  focoAlCerrar?: () => HTMLElement | null
}

/**
 * Modal del sistema, en tres partes: encabezado (título a la izquierda, X a la
 * derecha), cuerpo y acciones (abajo a la derecha).
 *
 * Se monta solo mientras está abierto (`{abierto && <Modal …/>}`). Usa el
 * `<dialog>` nativo con `showModal()`: el navegador vuelve inerte el resto de
 * la página —el foco no se escapa—, oscurece el fondo con `::backdrop` y emite
 * `cancel` con Esc. Al desmontarse lleva el foco a `focoAlCerrar` o, si no hay,
 * de vuelta al elemento que lo abrió.
 *
 * Se anima al **entrar** (`@starting-style` en overlays.css); al cerrar
 * desaparece en el acto, porque quien lo usa lo desmonta: animar la salida
 * exigiría retrasar el desmontaje, y con él el `focoAlCerrar`.
 */
export default function Modal({ titulo, children, acciones, onCerrar, focoAlCerrar }: Props) {
  const idTitulo = useId()
  const dialogo = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const elemento = dialogo.current
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    elemento?.showModal()
    return () => {
      elemento?.close()
      ;(focoAlCerrar?.() ?? anterior)?.focus()
    }
    // Abrir y cerrar una sola vez, al montar y desmontar: es lo buscado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={idTitulo}
      onCancel={(evento) => {
        // Esc cierra por el mismo camino que la X, para que quien lo usa decida.
        evento.preventDefault()
        onCerrar()
      }}
      // Caja, velo y animación de entrada: `.modal` en styles/overlays.css.
      className="modal"
    >
      <header className="flex items-start justify-between gap-4 border-b border-vidrio-linea px-5 py-4">
        <h2 id={idTitulo} className="font-serif text-headline-md text-vidrio-ink">
          {titulo}
        </h2>
        <BotonIcono icono="cerrar" aria-label="Cerrar" tamano="sm" onClick={onCerrar} className="-mt-1 -mr-2" />
      </header>

      <div className="px-5 py-4 text-sm text-vidrio-texto">{children}</div>

      <footer className="flex flex-col-reverse gap-2 border-t border-vidrio-linea bg-vidrio-field px-5 py-3 sm:flex-row sm:justify-end">
        {acciones}
      </footer>
    </dialog>
  )
}

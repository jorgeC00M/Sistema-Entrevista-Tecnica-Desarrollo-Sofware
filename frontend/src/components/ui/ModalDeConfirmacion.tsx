import type { ReactNode } from 'react'

import Boton from '@/components/ui/Boton'
import Modal from '@/components/ui/Modal'

interface Props {
  /** Verbo + sustantivo: "Aplicar configuración anterior", "Abandonar entrevista". */
  titulo: string
  /** Qué se pierde y si se puede deshacer; no repite el título. */
  children: ReactNode
  onConfirmar: () => void
  onCancelar: () => void
  textoConfirmar?: string
  textoCancelar?: string
  /** Deshabilita los botones y muestra el spinner mientras la acción corre. */
  cargando?: boolean
  /** Ver `Modal`: adónde va el foco al cerrarse. */
  focoAlCerrar?: () => HTMLElement | null
}

/**
 * Confirmación de una acción: `Modal` con "Cancelar" y "Confirmar" en el pie.
 * La X, Esc y "Cancelar" hacen lo mismo: cerrar sin ejecutar nada.
 */
export default function ModalDeConfirmacion({
  titulo,
  children,
  onConfirmar,
  onCancelar,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  cargando = false,
  focoAlCerrar,
}: Props) {
  return (
    <Modal
      titulo={titulo}
      onCerrar={onCancelar}
      focoAlCerrar={focoAlCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={onCancelar} disabled={cargando}>
            {textoCancelar}
          </Boton>
          <Boton variante="primario" onClick={onConfirmar} cargando={cargando}>
            {textoConfirmar}
          </Boton>
        </>
      }
    >
      {children}
    </Modal>
  )
}

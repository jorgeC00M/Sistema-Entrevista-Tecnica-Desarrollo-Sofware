import { useRef, useState } from 'react'

import Boton from '@/components/ui/Boton'
import ModalDeConfirmacion from '@/components/ui/ModalDeConfirmacion'
import type { UltimaConfiguracion } from '@/types/catalogos'

interface Props {
  configuracion: UltimaConfiguracion
  onConfirmar: () => void
  /**
   * Adónde llevar el foco tras confirmar (el siguiente paso). Se evalúa al
   * cerrar el modal, cuando la selección aplicada ya está en pantalla.
   */
  focoTrasConfirmar: () => HTMLElement | null
}

/**
 * Las tecnologías de la configuración anterior, para mostrarlas en el modal.
 * Las dos capas solo si ambas siguen vigentes: media combinación no se repite.
 */
function tecnologiasDeLaConfiguracion({ tecnologia_nombre, segunda_tecnologia, segunda_tecnologia_nombre }: UltimaConfiguracion) {
  if (!tecnologia_nombre) return null
  return segunda_tecnologia ? `${tecnologia_nombre} + ${segunda_tecnologia_nombre}` : tecnologia_nombre
}

/**
 * Botón junto al título para volver a la configuración de la última
 * entrevista. El modal muestra solo esa configuración; confirmar la aplica y
 * lleva al siguiente paso, cancelar no toca nada.
 */
export default function RepetirConfiguracion({ configuracion, onConfirmar, focoTrasConfirmar }: Props) {
  const [abierto, setAbierto] = useState(false)
  // Distingue cómo se cerró el modal: solo tras confirmar el foco avanza.
  const confirmado = useRef(false)

  // La configuración anterior es el contenido del cuerpo: lo que va a quedar elegido.
  const filas: { etiqueta: string; valor: string | null }[] = [
    { etiqueta: 'Puesto', valor: configuracion.puesto_nombre },
    // Con dos capas, "React + Node.js"; nula si ya no se ofrece.
    { etiqueta: 'Tecnología', valor: tecnologiasDeLaConfiguracion(configuracion) },
    { etiqueta: 'Nivel', valor: configuracion.nivel_nombre },
  ]

  return (
    <>
      <Boton
        variante="contorno"
        icono="repetir"
        aria-haspopup="dialog"
        className="shrink-0"
        onClick={() => {
          confirmado.current = false
          setAbierto(true)
        }}
      >
        Repetir última
      </Boton>

      {abierto && (
        <ModalDeConfirmacion
          titulo="Aplicar configuración anterior"
          onCancelar={() => setAbierto(false)}
          onConfirmar={() => {
            confirmado.current = true
            onConfirmar()
            setAbierto(false)
          }}
          focoAlCerrar={() => (confirmado.current ? focoTrasConfirmar() : null)}
        >
          <p className="text-vidrio-muted">Tu última entrevista:</p>
          <dl className="mt-2 divide-y divide-vidrio-linea rounded-control border border-vidrio-borde">
            {filas.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="flex justify-between gap-4 px-3.5 py-2.5">
                <dt className="text-vidrio-muted">{etiqueta}</dt>
                <dd className={valor ? 'text-right font-medium text-vidrio-ink' : 'text-right text-vidrio-muted'}>
                  {/* Las tecnologías de entrevistas antiguas ya no se ofrecen. */}
                  {valor ?? 'Ya no disponible: la eliges después'}
                </dd>
              </div>
            ))}
          </dl>
        </ModalDeConfirmacion>
      )}
    </>
  )
}

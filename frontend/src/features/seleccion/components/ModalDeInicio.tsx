import { useRef } from 'react'

import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import EtiquetaConvocatoria from '@/components/ui/EtiquetaConvocatoria'
import Modal from '@/components/ui/Modal'
import ModalDeConfirmacion from '@/components/ui/ModalDeConfirmacion'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import { minutosRestantes } from '@/features/entrevista/tiempo'

interface Props {
  puesto: string
  /** "React + Express": con dos capas, el nombre compuesto. */
  tecnologia: string
  nivel: string
  desdeConvocatoria: boolean
  totalPreguntas: number
  cargando: boolean
  /** Por qué no se pudo iniciar; vacío si no hubo error. */
  error: string
  /**
   * La entrevista que ya está en curso, si hay una (la sabía la interfaz o la
   * informó el 409 del servidor): el modal pregunta qué hacer con ella.
   */
  enCurso: EntrevistaEnCurso | null
  onComenzar: () => void
  /** Ir a la entrevista en curso. */
  onContinuarEnCurso: () => void
  /** Abandonar la entrevista en curso y empezar esta, en un solo paso. */
  onAbandonarYEmpezar: () => void
  onCancelar: () => void
}

/**
 * La pausa antes de empezar: qué se eligió y qué esperar. Se abre desde
 * "Iniciar entrevista" en las dos pestañas. Cancelar, la X y Esc cierran sin
 * iniciar (el foco vuelve al botón); si el inicio falla, el error se queda
 * aquí y el modal sigue abierto para reintentar.
 *
 * Con otra entrevista en curso cambia de contenido: solo puede haber una. Dice
 * cuál es y qué se pierde, y ofrece «Continuar la de <puesto>» —con el foco,
 * para que un Enter por error no abandone nada— o «Abandonarla y empezar», con
 * el estilo de una acción destructiva. La X y Esc no hacen nada más que cerrar.
 */
export default function ModalDeInicio({
  puesto,
  tecnologia,
  nivel,
  desdeConvocatoria,
  totalPreguntas,
  cargando,
  error,
  enCurso,
  onComenzar,
  onContinuarEnCurso,
  onAbandonarYEmpezar,
  onCancelar,
}: Props) {
  const botonContinuar = useRef<HTMLButtonElement>(null)

  const alerta = error && (
    <Alerta variante="enLinea" className="mt-4">
      {error}
    </Alerta>
  )

  if (enCurso) {
    const anterior = enCurso.puestoDisplay
    return (
      <Modal
        titulo="Iniciar entrevista"
        onCerrar={onCancelar}
        focoAlAbrir={() => botonContinuar.current}
        acciones={
          <>
            <Boton variante="peligro" onClick={onAbandonarYEmpezar} cargando={cargando}>
              Abandonarla y empezar
            </Boton>
            <Boton ref={botonContinuar} variante="primario" onClick={onContinuarEnCurso} disabled={cargando}>
              Continuar la de {anterior}
            </Boton>
          </>
        }
      >
        <p>
          Tienes una entrevista de <strong className="font-semibold text-vidrio-ink">{anterior}</strong> en curso
          (quedan {minutosRestantes(enCurso.segundosRestantes)} min).
        </p>
        <p className="mt-2">
          Si empiezas la de {puesto}, la de {anterior} se abandona: no tendrá nota y no podrás retomarla.
        </p>
        {alerta}
      </Modal>
    )
  }

  return (
    <ModalDeConfirmacion
      titulo="Iniciar entrevista"
      textoConfirmar="Comenzar"
      cargando={cargando}
      onConfirmar={onComenzar}
      onCancelar={onCancelar}
    >
      <p className="font-medium text-vidrio-ink">{puesto}</p>
      <p className="mt-0.5 text-vidrio-muted">
        {tecnologia} · {nivel}
      </p>
      {desdeConvocatoria && (
        <EtiquetaConvocatoria className="mt-2">Basada en tu convocatoria</EtiquetaConvocatoria>
      )}

      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-vidrio-texto marker:text-vidrio-tenue">
        <li>{totalPreguntas} preguntas, una a la vez.</li>
        <li>Verás tu nota y el detalle al terminar.</li>
        <li>Puedes abandonarla en cualquier momento.</li>
      </ul>

      {alerta}
    </ModalDeConfirmacion>
  )
}

import ModalDeConfirmacion from '@/components/ui/ModalDeConfirmacion'

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
  onComenzar: () => void
  onCancelar: () => void
}

/**
 * La pausa antes de empezar: qué se eligió y qué esperar. Se abre desde
 * "Iniciar entrevista" en las dos pestañas. Cancelar, la X y Esc cierran sin
 * iniciar (el foco vuelve al botón); si el inicio falla, el error se queda
 * aquí y el modal sigue abierto para reintentar.
 */
export default function ModalDeInicio({
  puesto,
  tecnologia,
  nivel,
  desdeConvocatoria,
  totalPreguntas,
  cargando,
  error,
  onComenzar,
  onCancelar,
}: Props) {
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
        <span className="mt-2 inline-flex rounded-full bg-vidrio-acento-suave px-2 py-0.5 text-meta text-vidrio-acento">
          Basada en tu convocatoria
        </span>
      )}

      <ul className="mt-4 list-disc space-y-1.5 pl-5 text-vidrio-texto marker:text-vidrio-tenue">
        <li>{totalPreguntas} preguntas, una a la vez.</li>
        <li>Verás tu nota y el detalle al terminar.</li>
        <li>Puedes abandonarla en cualquier momento.</li>
      </ul>

      {error && (
        <p role="alert" className="mt-4 rounded-control bg-error-fondo px-3 py-2 text-error-texto">
          {error}
        </p>
      )}
    </ModalDeConfirmacion>
  )
}

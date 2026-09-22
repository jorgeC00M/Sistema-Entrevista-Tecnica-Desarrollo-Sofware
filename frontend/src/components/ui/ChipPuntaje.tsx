import { ESTILO_DE_BANDA } from '@/lib/puntajes'
import type { BandaDeRubrica } from '@/types/evaluacion'

const TAMANOS = {
  sm: 'gap-1.5 px-2 py-0.5 text-label-mono',
  md: 'gap-2 px-2.5 py-1 text-code-inline',
} as const

interface Props {
  puntuacion: number
  /**
   * Obligatoria, no un número suelto: el color sale de la banda que ya
   * calculó el backend, nunca de un umbral reinventado en el cliente.
   */
  banda: BandaDeRubrica
  tamano?: keyof typeof TAMANOS
  /** Añade el nombre de la banda al chip: `92 / 100 · SÓLIDO`. */
  conEtiqueta?: boolean
}

export default function ChipPuntaje({
  puntuacion,
  banda,
  tamano = 'sm',
  conEtiqueta = false,
}: Props) {
  const estilo = ESTILO_DE_BANDA[banda]
  return (
    <span
      className={`inline-flex items-center rounded-chip font-mono font-medium uppercase ${estilo.fondoSuave} ${estilo.texto} ${TAMANOS[tamano]}`}
    >
      <span>
        {puntuacion} / 100
      </span>
      {conEtiqueta && (
        <>
          <span aria-hidden="true">·</span>
          <span>{estilo.etiqueta}</span>
        </>
      )}
    </span>
  )
}

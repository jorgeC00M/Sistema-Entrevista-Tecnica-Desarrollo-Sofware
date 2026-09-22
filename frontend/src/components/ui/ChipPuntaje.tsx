import { ESTILO_DE_BANDA } from '@/lib/puntajes'
import type { BandaDeRubrica } from '@/types/evaluacion'

const TAMANOS = {
  sm: 'px-2.5 py-1 text-sm',
  lg: 'px-4 py-2 text-4xl font-medium',
} as const

interface Props {
  puntuacion: number
  /**
   * Obligatoria, no un número suelto: el color sale de la banda que ya
   * calculó el backend, nunca de un umbral reinventado en el cliente.
   */
  banda: BandaDeRubrica
  tamano?: keyof typeof TAMANOS
}

export default function ChipPuntaje({ puntuacion, banda, tamano = 'sm' }: Props) {
  const estilo = ESTILO_DE_BANDA[banda]
  return (
    <span
      className={`inline-flex items-center rounded-full font-mono font-medium ${estilo.fondoSuave} ${estilo.texto} ${TAMANOS[tamano]}`}
    >
      {puntuacion}
    </span>
  )
}

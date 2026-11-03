import Chip from '@/components/ui/Chip'
import Icono from '@/components/ui/Icono'
import { ASPECTO_POR_ESTADO, NOTA_DE_TECNOLOGIA } from '@/features/curriculum/aspectos'
import type { Requisito } from '@/types/curriculum'

/**
 * El término con el ícono y el color de su estado; el estado, en palabras, para
 * el lector de pantalla. Uno solo para «Match con la Oferta» y «Plan de Mejora»,
 * así un requisito se pinta igual en las dos.
 */
export default function ChipDeRequisito({ requisito }: { requisito: Requisito }) {
  const aspecto = ASPECTO_POR_ESTADO[requisito.estado]
  return (
    <Chip tono={aspecto.clases}>
      <Icono nombre={aspecto.icono} className="h-3.5 w-3.5 shrink-0" />
      <span className="font-mono-vidrio">{requisito.termino}</span>
      <span className="sr-only">, {NOTA_DE_TECNOLOGIA[requisito.estado]}</span>
    </Chip>
  )
}

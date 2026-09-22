import ControlSegmentado from '@/components/ui/ControlSegmentado'
import type { Nivel } from '@/types/catalogos'

interface Props {
  niveles: Nivel[]
  seleccionado: string
  onSeleccionar: (codigo: string) => void
}

export default function SelectorNivel({ niveles, seleccionado, onSeleccionar }: Props) {
  return (
    <ControlSegmentado
      etiqueta="Nivel"
      opciones={niveles.map((n) => ({ valor: n.codigo, etiqueta: n.nombre }))}
      seleccionado={seleccionado}
      onSeleccionar={onSeleccionar}
    />
  )
}

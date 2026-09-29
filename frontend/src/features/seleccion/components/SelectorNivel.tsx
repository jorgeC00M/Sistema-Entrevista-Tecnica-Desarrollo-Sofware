import Tarjeta from '@/components/ui/Tarjeta'
import ControlSegmentado from '@/components/ui/ControlSegmentado'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import type { Nivel } from '@/types/catalogos'

interface Props {
  niveles: Nivel[]
  seleccionado: string
  onSeleccionar: (codigo: string) => void
}

export default function SelectorNivel({ niveles, seleccionado, onSeleccionar }: Props) {
  return (
    <Tarjeta className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-headline-sm font-semibold text-vidrio-ink">
            Profundidad conceptual
          </span>
          <EtiquetaMono>Adaptativa</EtiquetaMono>
        </div>
        <p className="text-sm text-vidrio-texto">
          El nivel ajusta la profundidad de lo que se te pregunta, no un límite de tiempo.
        </p>
      </div>

      <ControlSegmentado
        etiqueta="Nivel"
        opciones={niveles.map((n) => ({ valor: n.codigo, etiqueta: n.nombre }))}
        seleccionado={seleccionado}
        onSeleccionar={onSeleccionar}
        className="shrink-0"
      />
    </Tarjeta>
  )
}

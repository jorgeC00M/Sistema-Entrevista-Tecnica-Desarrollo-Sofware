import ControlSegmentado from '@/components/ui/ControlSegmentado'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import type { Nivel } from '@/types/catalogos'

interface Props {
  niveles: Nivel[]
  seleccionado: string
  onSeleccionar: (codigo: string) => void
}

export default function SelectorNivel({ niveles, seleccionado, onSeleccionar }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-superficie border border-tinta-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-headline-sm font-semibold text-tinta-950">
            Profundidad conceptual
          </span>
          <EtiquetaMono>Adaptativa</EtiquetaMono>
        </div>
        <p className="flex items-start gap-1.5 text-sm text-tinta-500">
          <Icono nombre="fortaleza" className="mt-0.5 h-4 w-4 shrink-0 text-iris-600" />
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
    </div>
  )
}

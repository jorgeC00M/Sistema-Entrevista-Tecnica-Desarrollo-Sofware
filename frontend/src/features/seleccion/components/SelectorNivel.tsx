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
    <Tarjeta className="flex flex-col gap-3 p-4">
      {/* Sin párrafo explicativo: ocupaba el alto que nivel y tecnología
          necesitan para compartir fila. La etiqueta "Adaptativa" conserva la
          señal de que el nivel ajusta la profundidad y no un límite de tiempo. */}
      <div className="flex items-center gap-2">
        <span className="text-headline-sm font-semibold text-vidrio-ink">
          Profundidad conceptual
        </span>
        <EtiquetaMono>Adaptativa</EtiquetaMono>
      </div>

      <ControlSegmentado
        etiqueta="Nivel"
        opciones={niveles.map((n) => ({ valor: n.codigo, etiqueta: n.nombre }))}
        seleccionado={seleccionado}
        onSeleccionar={onSeleccionar}
      />
    </Tarjeta>
  )
}

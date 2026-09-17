import TarjetaArea from '@/features/seleccion/components/TarjetaArea'
import type { Nivel } from '@/types/catalogos'

interface Props {
  niveles: Nivel[]
  seleccionado: string
  onSeleccionar: (codigo: string) => void
}

export default function SelectorNivel({ niveles, seleccionado, onSeleccionar }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-slate-700">Nivel</legend>
      <div className="flex gap-2">
        {niveles.map((n) => (
          <TarjetaArea
            key={n.codigo}
            activo={seleccionado === n.codigo}
            onClick={() => onSeleccionar(n.codigo)}
            className="flex-1"
          >
            {n.nombre}
          </TarjetaArea>
        ))}
      </div>
    </fieldset>
  )
}

import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

interface Props {
  nombre: string
  descripcion: string
  icono: NombreDeIcono
  totalPreguntas: number
  activo: boolean
  onClick: () => void
}

export default function TarjetaArea({
  nombre,
  descripcion,
  icono,
  totalPreguntas,
  activo,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex flex-col gap-3 rounded-superficie border bg-white p-4 text-left transition ${
        activo ? 'border-iris-600 ring-2 ring-iris-600' : 'border-tinta-100 hover:border-tinta-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${
            activo ? 'bg-iris-50 text-iris-600' : 'bg-tinta-100 text-tinta-500'
          }`}
        >
          <Icono nombre={icono} className="h-6 w-6" />
        </span>
        {activo && <EtiquetaMono tono="marca">Seleccionado</EtiquetaMono>}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-headline-md font-semibold text-tinta-950">{nombre}</h3>
          <EtiquetaMono>
            {totalPreguntas} pregunta{totalPreguntas === 1 ? '' : 's'}
          </EtiquetaMono>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-tinta-500">{descripcion}</p>
      </div>
    </button>
  )
}

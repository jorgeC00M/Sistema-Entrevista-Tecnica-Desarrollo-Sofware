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
      className={`flex flex-col gap-3 rounded-vidrio border bg-vidrio-card p-4 text-left backdrop-blur-[18px] transition ${
        activo
          ? 'border-2 border-vidrio-acento shadow-[0_0_0_4px_var(--color-vidrio-acento-suave)]'
          : 'border-vidrio-borde hover:border-vidrio-acento/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${
            activo ? 'bg-vidrio-acento-suave text-vidrio-acento' : 'bg-vidrio-field text-vidrio-muted'
          }`}
        >
          <Icono nombre={icono} className="h-6 w-6" />
        </span>
        {activo && <EtiquetaMono tono="marca">Seleccionado</EtiquetaMono>}
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-headline-md font-semibold text-vidrio-ink">{nombre}</h3>
          <EtiquetaMono>
            {totalPreguntas} pregunta{totalPreguntas === 1 ? '' : 's'}
          </EtiquetaMono>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-vidrio-texto">{descripcion}</p>
      </div>
    </button>
  )
}

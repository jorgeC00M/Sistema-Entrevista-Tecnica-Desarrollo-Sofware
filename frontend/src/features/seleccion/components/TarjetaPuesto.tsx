import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

interface Props {
  nombre: string
  descripcion: string
  icono: NombreDeIcono
  activo: boolean
  onClick: () => void
}

/**
 * Un puesto al que postular.
 *
 * Deliberadamente escueta: icono, nombre y una línea. Los temas que recorre la
 * entrevista —lo único que le anticipa al usuario sobre qué le van a preguntar,
 * ahora que no elige las áreas una por una— siguen estando a la vista, pero en
 * `PanelDeSesion` y solo para el puesto elegido. Enumerarlos aquí los repetía en
 * las tres tarjetas y las volvía tan altas que caían en dos filas, así que los
 * tres puestos no se podían comparar de un vistazo.
 */
export default function TarjetaPuesto({ nombre, descripcion, icono, activo, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex h-full flex-col gap-3 rounded-vidrio border bg-vidrio-card p-4 text-left backdrop-blur-[18px] transition ${
        activo
          ? 'border-2 border-vidrio-acento shadow-[0_0_0_4px_var(--color-vidrio-acento-suave)]'
          : 'border-vidrio-borde hover:border-vidrio-acento/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${
            activo
              ? 'bg-vidrio-acento-suave text-vidrio-acento'
              : 'bg-vidrio-field text-vidrio-muted'
          }`}
        >
          <Icono nombre={icono} className="h-6 w-6" />
        </span>
        {activo && <EtiquetaMono tono="marca">Elegido</EtiquetaMono>}
      </div>

      <div>
        <h3 className="text-headline-md font-semibold text-vidrio-ink">{nombre}</h3>
        <p className="mt-1 text-sm leading-relaxed text-vidrio-texto">{descripcion}</p>
      </div>
    </button>
  )
}

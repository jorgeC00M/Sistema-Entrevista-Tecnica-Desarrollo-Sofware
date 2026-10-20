import { useId } from 'react'

import Icono from '@/components/ui/Icono'

export interface OpcionDeCampo {
  valor: string
  etiqueta: string
}

/** Opciones sueltas, o en grupos (`<optgroup>`); un grupo con rótulo vacío va suelto. */
export type OpcionesDeCampo = OpcionDeCampo[] | [string, OpcionDeCampo[]][]

interface Props {
  id: string
  etiqueta: string
  valor: string
  opciones: OpcionesDeCampo
  onCambiar: (valor: string) => void
  /** Texto bajo el campo: qué significa lo elegido o por qué está deshabilitado. */
  ayuda?: string
  deshabilitado?: boolean
  marcador?: string
}

function esAgrupada(opciones: OpcionesDeCampo): opciones is [string, OpcionDeCampo[]][] {
  return opciones.length > 0 && Array.isArray(opciones[0])
}

function Opciones({ opciones }: { opciones: OpcionDeCampo[] }) {
  return opciones.map((o) => (
    <option key={o.valor} value={o.valor}>
      {o.etiqueta}
    </option>
  ))
}

/**
 * Un campo del formulario: etiqueta arriba, `<select>` nativo y ayuda debajo.
 *
 * Nativo a propósito: teclado, lector de pantalla y el selector del sistema en
 * el celular vienen resueltos, y `<optgroup>` agrupa sin código. Solo se
 * estiliza el control cerrado (`appearance-none` + chevron propio); la lista
 * abierta es la del sistema. "Selecciona…" es una opción deshabilitada: se ve
 * mientras no hay valor y no se puede volver a elegir.
 */
export default function CampoSelect({
  id,
  etiqueta,
  valor,
  opciones,
  onCambiar,
  ayuda,
  deshabilitado = false,
  marcador = 'Selecciona…',
}: Props) {
  const idAyuda = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-vidrio-ink">
        {etiqueta}
      </label>
      <div className="relative">
        <select
          id={id}
          value={valor}
          disabled={deshabilitado}
          onChange={(evento) => onCambiar(evento.target.value)}
          aria-describedby={ayuda ? idAyuda : undefined}
          className={`campo h-11 w-full appearance-none pr-10 pl-3.5 text-sm ${
            valor ? 'text-vidrio-ink' : 'text-vidrio-muted'
          }`}
        >
          <option value="" disabled>
            {marcador}
          </option>
          {esAgrupada(opciones) ? (
            opciones.map(([grupo, delGrupo]) =>
              grupo ? (
                <optgroup key={grupo} label={grupo}>
                  <Opciones opciones={delGrupo} />
                </optgroup>
              ) : (
                <Opciones key="sin-grupo" opciones={delGrupo} />
              ),
            )
          ) : (
            <Opciones opciones={opciones} />
          )}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-vidrio-muted"
        >
          <Icono nombre="abajo" className="h-4 w-4" />
        </span>
      </div>
      {ayuda && (
        <p id={idAyuda} className="text-meta text-vidrio-muted">
          {ayuda}
        </p>
      )}
    </div>
  )
}

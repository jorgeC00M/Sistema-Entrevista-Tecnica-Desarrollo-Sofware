import type { KeyboardEvent } from 'react'

interface Pestana {
  valor: string
  etiqueta: string
}

interface Props {
  /** Nombre accesible de la lista de pestañas. */
  etiqueta: string
  pestanas: Pestana[]
  seleccionada: string
  onSeleccionar: (valor: string) => void
  /**
   * Prefijo de los `id` de las pestañas: cada una es `${idBase}-${valor}`, y el
   * panel lo usa en su `aria-labelledby`.
   */
  idBase: string
  /** `id` del `role="tabpanel"` que controlan. */
  idPanel: string
  /**
   * En móvil, repartir el ancho en columnas iguales para que todas se vean
   * sin desplazarse. Desde `sm` vuelven a ir una tras otra.
   */
  repartir?: boolean
}

/** Clases literales (no `grid-cols-${n}`): Tailwind solo genera las que ve. */
const COLUMNAS: Record<number, string> = {
  2: 'grid grid-cols-2',
  3: 'grid grid-cols-3',
  4: 'grid grid-cols-4',
  5: 'grid grid-cols-5',
}

/**
 * Pestañas con el patrón ARIA *tabs*: una lista con `role="tablist"`, solo la
 * seleccionada en el orden de Tab (tabindex móvil) y las flechas para moverse.
 * La activación es automática (mover el foco selecciona): cambiar de pestaña
 * es instantáneo y no hay nada que cargar.
 *
 * Para cambiar de vista, no para elegir una opción dentro de un formulario:
 * eso es un grupo de radios, que es otra cosa para el lector de pantalla.
 */
export default function Pestanas({
  etiqueta,
  pestanas,
  seleccionada,
  onSeleccionar,
  idBase,
  idPanel,
  repartir = false,
}: Props) {
  const alPulsar = (evento: KeyboardEvent<HTMLButtonElement>) => {
    const actual = pestanas.findIndex((p) => p.valor === seleccionada)
    const ultima = pestanas.length - 1
    const destino = {
      ArrowRight: actual === ultima ? 0 : actual + 1,
      ArrowLeft: actual === 0 ? ultima : actual - 1,
      Home: 0,
      End: ultima,
    }[evento.key]
    if (destino === undefined) return
    evento.preventDefault()
    const { valor } = pestanas[destino]
    onSeleccionar(valor)
    document.getElementById(`${idBase}-${valor}`)?.focus()
  }

  return (
    // `overflow-x-auto`: con muchas pestañas en un móvil, la fila se desplaza
    // por sí misma en vez de ensanchar la página.
    <div
      role="tablist"
      aria-label={etiqueta}
      className={`border-b border-vidrio-linea ${
        repartir ? `${COLUMNAS[pestanas.length] ?? 'flex'} sm:flex sm:gap-6` : 'flex gap-4 overflow-x-auto sm:gap-6'
      }`}
    >
      {pestanas.map(({ valor, etiqueta: texto }) => {
        const activa = valor === seleccionada
        return (
          <button
            key={valor}
            id={`${idBase}-${valor}`}
            type="button"
            role="tab"
            aria-selected={activa}
            aria-controls={idPanel}
            tabIndex={activa ? 0 : -1}
            onClick={() => onSeleccionar(valor)}
            onKeyDown={alPulsar}
            className={`min-h-11 shrink-0 border-b-2 px-0.5 font-medium ${repartir ? 'text-center text-meta leading-tight sm:text-sm sm:whitespace-nowrap' : 'text-sm whitespace-nowrap'} transition-colors duration-150 foco-anillo ${
              activa
                ? 'border-vidrio-acento text-vidrio-ink'
                : 'border-transparent text-vidrio-muted hover:border-vidrio-borde hover:text-vidrio-ink'
            }`}
          >
            {texto}
          </button>
        )
      })}
    </div>
  )
}

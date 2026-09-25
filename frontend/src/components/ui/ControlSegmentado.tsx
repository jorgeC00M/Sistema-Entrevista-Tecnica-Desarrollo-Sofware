interface Opcion {
  valor: string
  etiqueta: string
}

interface Props {
  etiqueta: string
  opciones: Opcion[]
  seleccionado: string
  onSeleccionar: (valor: string) => void
  className?: string
}

/**
 * Grupo de opciones mutuamente excluyentes en una sola fila, tipo
 * "segmented control". Pensado para pocas opciones (2-4) — con más, una
 * lista o un desplegable se lee mejor.
 */
export default function ControlSegmentado({
  etiqueta,
  opciones,
  seleccionado,
  onSeleccionar,
  className = '',
}: Props) {
  return (
    <fieldset className={className}>
      <legend className="mb-2 text-sm font-medium text-vidrio-ink">{etiqueta}</legend>
      <div className="flex gap-1 rounded-full bg-vidrio-field p-1">
        {opciones.map((opcion) => {
          const activo = seleccionado === opcion.valor
          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => onSeleccionar(opcion.valor)}
              aria-pressed={activo}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento ${
                activo
                  ? 'bg-vidrio-acento text-white shadow-sm'
                  : 'text-vidrio-texto hover:text-vidrio-ink'
              }`}
            >
              {opcion.etiqueta}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

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
      <legend className="mb-2 text-sm font-medium text-tinta-700">{etiqueta}</legend>
      <div className="flex gap-2">
        {opciones.map((opcion) => {
          const activo = seleccionado === opcion.valor
          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => onSeleccionar(opcion.valor)}
              aria-pressed={activo}
              className={`flex-1 rounded-control border px-4 py-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-600 ${
                activo
                  ? 'border-iris-600 bg-iris-50 text-iris-700'
                  : 'border-tinta-100 bg-white text-tinta-700 hover:border-tinta-300'
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

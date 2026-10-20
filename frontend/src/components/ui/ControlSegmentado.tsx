interface Opcion {
  valor: string
  etiqueta: string
}

interface Props {
  etiqueta: string
  opciones: Opcion[]
  seleccionado: string
  onSeleccionar: (valor: string) => void
  /** La leyenda sigue existiendo para el lector de pantalla, pero no se ve. */
  ocultarEtiqueta?: boolean
  deshabilitado?: boolean
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
  ocultarEtiqueta = false,
  deshabilitado = false,
  className = '',
}: Props) {
  return (
    <fieldset className={className}>
      <legend className={ocultarEtiqueta ? 'sr-only' : 'mb-2 text-sm font-medium text-vidrio-ink'}>{etiqueta}</legend>
      <div className="flex gap-1 rounded-full bg-vidrio-field p-1">
        {opciones.map((opcion) => {
          const activo = seleccionado === opcion.valor
          return (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => onSeleccionar(opcion.valor)}
              disabled={deshabilitado}
              aria-pressed={activo}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-150 foco-anillo disabled:cursor-not-allowed disabled:opacity-50 ${
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

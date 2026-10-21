import BotonIcono from '@/components/ui/BotonIcono'
import { paginasVisibles } from '@/lib/paginacion'

interface Props {
  /** 1-indexada. */
  pagina: number
  totalPaginas: number
  onCambiar: (pagina: number) => void
}

/**
 * Paginación de una lista ya cargada: ‹ › con hasta tres números de página
 * (`lib/paginacion.ts`), alineados a la derecha, sin texto de rango.
 *
 * Vive en `components/ui/` porque lleva `<button>` propios, y los botones del
 * sistema solo se escriben aquí. Con una sola página no se pinta: no hay a
 * dónde ir. La página actual se anuncia solo al lector de pantalla
 * (`aria-live`), para que sepa que el contenido cambió sin tener que buscarlo.
 */
export default function Paginacion({ pagina, totalPaginas, onCambiar }: Props) {
  if (totalPaginas <= 1) return null

  return (
    <nav aria-label="Paginación" className="flex justify-end">
      <p aria-live="polite" className="sr-only">
        Página {pagina} de {totalPaginas}
      </p>

      <ul className="flex items-center gap-1">
        <li>
          <BotonIcono
            icono="chevron-izquierda"
            aria-label="Página anterior"
            disabled={pagina <= 1}
            onClick={() => onCambiar(pagina - 1)}
          />
        </li>
        {paginasVisibles(pagina, totalPaginas).map((numero) => {
          const actual = numero === pagina
          return (
            <li key={numero}>
              <button
                type="button"
                aria-label={`Página ${numero}`}
                aria-current={actual ? 'page' : undefined}
                onClick={() => onCambiar(numero)}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-control px-2 font-mono-vidrio text-sm transition-colors duration-150 foco-anillo ${
                  actual
                    ? 'bg-vidrio-acento font-semibold text-white'
                    : 'text-vidrio-texto hover:bg-vidrio-field hover:text-vidrio-ink'
                }`}
              >
                {numero}
              </button>
            </li>
          )
        })}
        <li>
          <BotonIcono
            icono="chevron-derecha"
            aria-label="Página siguiente"
            disabled={pagina >= totalPaginas}
            onClick={() => onCambiar(pagina + 1)}
          />
        </li>
      </ul>
    </nav>
  )
}

import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import type { CurriculumEnLista } from '@/types/curriculum'

interface Props {
  analisis: CurriculumEnLista[]
  cargando: boolean
  onAbrir: (id: number) => void
}

function fechaLegible(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Los análisis que el usuario ya hizo, para que pueda ver si su CV mejoró.
 *
 * Sin esto cada análisis se perdía al recargar, y el módulo existe justamente para
 * corregir el documento y volver a medirlo: faltaba la mitad del ciclo.
 *
 * **No se publica ninguna diferencia entre análisis** ("+2 campos desde la última
 * vez"). Dos filas pueden tener convocatorias distintas, así que la resta entre
 * sus resultados no significaría nada — el mismo error que el módulo ya evita al
 * no publicar un puntaje de compatibilidad. Las filas ordenadas con su propio
 * resultado dejan la comparación a la vista sin afirmar nada que no se sostenga.
 *
 * Si la lista está vacía no se renderiza nada. Una tarjeta que diga "aún no has
 * analizado ningún CV" en la pantalla donde vas a analizar el primero es ruido.
 */
export default function HistorialDeAnalisis({ analisis, cargando, onAbrir }: Props) {
  // Mientras carga tampoco se muestra nada: un esqueleto por una lista que suele
  // tener dos o tres filas parpadearía más de lo que informa.
  if (cargando || analisis.length === 0) return null

  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Tus análisis anteriores
        </h2>
        <EtiquetaMono>
          {analisis.length} {analisis.length === 1 ? 'análisis' : 'análisis'}
        </EtiquetaMono>
      </div>

      <p className="mt-1.5 text-sm text-vidrio-texto">
        Del más reciente al más antiguo. Pulsa uno para volver a verlo.
      </p>

      <ul className="mt-3 divide-y divide-vidrio-linea">
        {analisis.map((fila) => (
          <li key={fila.id}>
            <button
              type="button"
              onClick={() => onAbrir(fila.id)}
              className="flex w-full items-center gap-3 py-2.5 text-left transition-colors duration-150 hover:bg-vidrio-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento"
            >
              <Icono
                nombre="resultados"
                className="h-4 w-4 shrink-0 text-vidrio-tenue"
                aria-hidden
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono-vidrio text-sm text-vidrio-ink">
                  {fila.nombre_archivo}
                </span>
                <span className="block text-label-mono text-vidrio-muted uppercase">
                  {fechaLegible(fila.fecha)}
                </span>
              </span>

              {fila.con_convocatoria && (
                <EtiquetaMono tono="marca" className="shrink-0">
                  Con convocatoria
                </EtiquetaMono>
              )}

              {fila.parseabilidad && (
                <span className="shrink-0 font-mono-vidrio text-sm text-vidrio-texto">
                  {fila.parseabilidad}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}

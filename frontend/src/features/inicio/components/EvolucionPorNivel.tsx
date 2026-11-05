import GraficoDeNivel from '@/features/inicio/components/GraficoDeNivel'
import type { EvolucionDeNivel } from '@/features/inicio/evolucion'
import { colorDePuesto } from '@/lib/puestos'

interface Props {
  /** Los tres niveles en el orden del catálogo, aunque alguno esté vacío: en el Inicio no hay filtros. */
  niveles: EvolucionDeNivel[]
}

/**
 * «Tu evolución», en el Inicio: una tarjeta por nivel, en una fila desde 1280 px y
 * apiladas por debajo (con el sidebar, a menos ancho no caben tres gráficos
 * legibles). Una sola leyenda para la fila, solo con los puestos: cada uno
 * tiene el mismo color en las tres tarjetas, así la asociación se lee una vez.
 */
export default function EvolucionPorNivel({ niveles }: Props) {
  // Los puestos presentes, sin repetir, en el orden en que aparecen.
  const puestos = [
    ...new Map(niveles.flatMap((n) => n.series).map((s) => [s.puesto, s.etiqueta])).entries(),
  ]

  return (
    <div className="space-y-3">
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-meta text-vidrio-texto" aria-label="Leyenda">
        {puestos.map(([puesto, etiqueta]) => (
          <li key={puesto} className="flex items-center gap-1.5">
            <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" aria-hidden="true">
              <circle cx="5" cy="5" r="4.5" fill={colorDePuesto(puesto)} />
            </svg>
            {etiqueta}
          </li>
        ))}
      </ul>

      {/* Tres en fila desde xl. */}
      <div className="grid gap-4 xl:grid-cols-3">
        {niveles.map((nivel) => (
          <GraficoDeNivel key={nivel.nivel} evolucion={nivel} />
        ))}
      </div>
    </div>
  )
}

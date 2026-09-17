import type { PuntoDeEvolucion } from '@/types/evaluacion'

// SVG simple, sin librería de gráficos: el dato es una línea de puntos en el
// tiempo, no justifica una dependencia nueva para este proyecto.

const COLORES_AREA: Record<string, string> = {
  programacion: '#4f46e5', // indigo-600
  bases_de_datos: '#059669', // emerald-600
  estructuras_de_datos: '#d97706', // amber-600
  desarrollo_web: '#db2777', // pink-600
}
const COLOR_POR_DEFECTO = '#4f46e5'

const ANCHO = 600
const ALTO = 220
const PADDING = 32

interface Props {
  puntos: PuntoDeEvolucion[]
}

export default function GraficoProgreso({ puntos }: Props) {
  if (puntos.length < 2) {
    return (
      <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400 ring-1 ring-slate-200">
        Completa al menos dos entrevistas para ver tu evolución en el tiempo.
      </p>
    )
  }

  const anchoUtil = ANCHO - PADDING * 2
  const altoUtil = ALTO - PADDING * 2

  const coordenadas = puntos.map((punto, indice) => ({
    ...punto,
    x: PADDING + (indice / (puntos.length - 1)) * anchoUtil,
    y: PADDING + altoUtil - (punto.puntuacion_promedio / 100) * altoUtil,
  }))

  const lineaPath = coordenadas.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')

  const areasPresentes = [...new Map(puntos.map((p) => [p.area, p.area_display])).entries()]

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200 sm:p-5">
      <h3 className="mb-3 text-sm font-medium text-slate-700">Evolución en el tiempo</h3>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="w-full"
        role="img"
        aria-label="Gráfico de evolución de puntuaciones a lo largo del tiempo"
      >
        {[0, 25, 50, 75, 100].map((linea) => {
          const y = PADDING + altoUtil - (linea / 100) * altoUtil
          return (
            <g key={linea}>
              <line
                x1={PADDING}
                y1={y}
                x2={ANCHO - PADDING}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text x={PADDING - 8} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">
                {linea}
              </text>
            </g>
          )
        })}

        <path d={lineaPath} fill="none" stroke="#c7d2fe" strokeWidth="2" />

        {coordenadas.map((c) => (
          <circle
            key={c.entrevista_id}
            cx={c.x}
            cy={c.y}
            r="5"
            fill={COLORES_AREA[c.area] ?? COLOR_POR_DEFECTO}
            stroke="white"
            strokeWidth="2"
          >
            <title>
              {c.area_display}: {c.puntuacion_promedio}/100
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
        {areasPresentes.map(([area, etiqueta]) => (
          <span key={area} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: COLORES_AREA[area] ?? COLOR_POR_DEFECTO }}
            />
            {etiqueta}
          </span>
        ))}
      </div>
    </div>
  )
}

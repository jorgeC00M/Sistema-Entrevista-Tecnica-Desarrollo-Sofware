import Tarjeta from '@/components/ui/Tarjeta'
import type { PuntoDeEvolucion } from '@/types/evaluacion'

// SVG simple, sin librería de gráficos: el dato es una línea de puntos en el
// tiempo, no justifica una dependencia nueva para este proyecto.
//
// Los atributos fill/stroke de SVG no aceptan clases de Tailwind, así que
// necesitan valores literales. Donde el color coincide con un token real
// (programación = el acento del producto, la línea de conexión = su tinte
// suave) se referencia la variable de @theme en vez de repetir el hex. Las
// otras tres áreas son categóricas, no de estado: se eligen deliberadamente
// distintas de exito/progreso/error, para que un punto del gráfico nunca se
// lea como "esta área tiene mal puntaje".
const COLORES_AREA: Record<string, string> = {
  programacion: 'var(--color-vidrio-acento)',
  bases_de_datos: '#0d9488', // teal — categórico, no exito-texto
  estructuras_de_datos: '#7c3aed', // violeta — categórico, sin colisión con el acento ni progreso-texto
  desarrollo_web: '#db2777', // rosa — categórico, sin colisión con ningún semántico
}
const COLOR_POR_DEFECTO = 'var(--color-vidrio-acento)'

const ANCHO = 600
const ALTO = 220
const PADDING = 32

interface Props {
  puntos: PuntoDeEvolucion[]
}

export default function GraficoProgreso({ puntos }: Props) {
  if (puntos.length < 2) {
    return (
      <Tarjeta como="p" className="p-6 text-center text-sm text-vidrio-muted">
        Completa al menos dos entrevistas para ver tu evolución en el tiempo.
      </Tarjeta>
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
    <Tarjeta className="p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-medium text-vidrio-ink">Evolución en el tiempo</h3>

      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="w-full"
        // jsx-a11y sugiere <img> en vez de role="img". No se adopta: es un
        // SVG generado dinámicamente a partir de `puntos`, y <img> no admite
        // SVG como hijo — habría que volcarlo a un data URI y perder la
        // reactividad. El patrón ARIA (role="img" + aria-label) ya cubre el
        // caso de un gráfico que se resume en una sola descripción.
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
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
                stroke="var(--color-vidrio-linea)"
                strokeWidth="1"
              />
              <text
                x={PADDING - 8}
                y={y + 4}
                fontSize="10"
                fill="var(--color-vidrio-muted)"
                textAnchor="end"
              >
                {linea}
              </text>
            </g>
          )
        })}

        <path
          d={lineaPath}
          fill="none"
          stroke="var(--color-vidrio-acento-suave)"
          strokeWidth="2"
        />

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
              {c.area_display}: {Math.round(c.puntuacion_promedio)}/100
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-vidrio-muted">
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
    </Tarjeta>
  )
}

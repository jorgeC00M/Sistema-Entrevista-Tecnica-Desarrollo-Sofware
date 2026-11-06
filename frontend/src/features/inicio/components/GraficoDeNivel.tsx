import { useState } from 'react'

import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'
import DetalleDePunto from '@/features/inicio/components/DetalleDePunto'
import {
  type EvolucionDeNivel,
  type PuntoDeEvolucion,
  type SerieDePuesto,
  marcasDelEje,
  resumenDeSerie,
} from '@/features/inicio/evolucion'
import { fechaNumerica } from '@/lib/fechas'
import { colorDePuesto } from '@/lib/puestos'

// SVG simple, sin librería de gráficos: una línea de puntos por puesto no
// justifica una dependencia nueva. Los atributos fill/stroke de SVG no aceptan
// clases, así que los colores se referencian como variables de @theme.
//
// La escala vertical es fija (0-100) y la misma en las tres tarjetas: si cada
// una se ajustara a sus datos, un 60 se vería alto en una y bajo en otra, y la
// comparación entre niveles mentiría.

const ANCHO = 320
const ALTO = 200
const IZQUIERDA = 30
const DERECHA = 12
const ARRIBA = 12
const ABAJO = 26
const GUIAS = [0, 25, 50, 75, 100]

/** El nombre accesible de un punto: los mismos cuatro datos que su cuadro. */
function nombreDelPunto(serie: SerieDePuesto, punto: PuntoDeEvolucion): string {
  return [
    `Fecha ${fechaNumerica(punto.fecha)}`,
    `Puesto ${serie.etiqueta}`,
    `Tecnología ${punto.tecnologia ?? 'sin tecnología'}`,
    `Puntaje ${Math.round(punto.nota)} de 100`,
  ].join(', ')
}

interface PuntoActivo {
  serie: SerieDePuesto
  punto: PuntoDeEvolucion
}

interface Props {
  evolucion: EvolucionDeNivel
}

/**
 * Una tarjeta de "Evolución en el tiempo": la de un nivel, con una línea por
 * puesto. El eje horizontal es el número de entrevista dentro de cada puesto,
 * no el calendario; un salto de más de 90 días se marca con una línea punteada.
 * Todos los puntos se ven igual, sea la entrevista personalizada o de una
 * convocatoria. Al pasar el puntero o enfocar un punto (Tab) aparece su cuadro
 * de detalle; Esc, salir o perder el foco lo cierran.
 */
export default function GraficoDeNivel({ evolucion }: Props) {
  const { etiqueta, series } = evolucion
  const [activo, setActivo] = useState<PuntoActivo | null>(null)
  const maximo = Math.max(0, ...series.map((s) => s.puntos.length))

  const anchoUtil = ANCHO - IZQUIERDA - DERECHA
  const altoUtil = ALTO - ARRIBA - ABAJO
  // Con un solo punto no hay recorrido: se centra.
  const x = (numero: number) =>
    maximo <= 1 ? IZQUIERDA + anchoUtil / 2 : IZQUIERDA + ((numero - 1) / (maximo - 1)) * anchoUtil
  const y = (nota: number) => ARRIBA + altoUtil - (nota / 100) * altoUtil

  return (
    <section aria-label={`Evolución ${etiqueta}`}>
      <Tarjeta className="flex h-full flex-col gap-3 p-4">
        <EtiquetaMono tono="suelto">{etiqueta}</EtiquetaMono>

        {series.length === 0 ? (
          <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-vidrio-muted">
            Aún sin entrevistas {etiqueta} finalizadas.
          </p>
        ) : (
          <>
            <div className="relative">
              <svg
                viewBox={`0 0 ${ANCHO} ${ALTO}`}
                className="w-full overflow-visible"
                // Un grupo y no role="img": "img" volvería invisibles para el
                // lector de pantalla los puntos, que son enfocables y tienen
                // nombre propio. jsx-a11y sugiere una etiqueta HTML (fieldset…),
                // pero dentro de un SVG no existe: el rol ARIA es lo correcto.
                // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
                role="group"
                aria-label={`Evolución de tus entrevistas ${etiqueta}, por puesto`}
              >
                {GUIAS.map((guia) => (
                  <g key={guia}>
                    <line
                      x1={IZQUIERDA}
                      y1={y(guia)}
                      x2={ANCHO - DERECHA}
                      y2={y(guia)}
                      stroke="var(--color-vidrio-linea)"
                      strokeWidth="1"
                    />
                    <text
                      x={IZQUIERDA - 6}
                      y={y(guia) + 3}
                      fontSize="9"
                      fill="var(--color-vidrio-muted)"
                      textAnchor="end"
                    >
                      {guia}
                    </text>
                  </g>
                ))}

                {marcasDelEje(maximo).map((numero) => (
                  <text
                    key={numero}
                    x={x(numero)}
                    y={ALTO - 8}
                    fontSize="9"
                    fill="var(--color-vidrio-muted)"
                    textAnchor="middle"
                  >
                    {numero}
                  </text>
                ))}

                {series.map((serie) => {
                  const color = colorDePuesto(serie.puesto)
                  const recorrido = serie.puntos
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.numero)} ${y(p.nota)}`)
                    .join(' ')
                  return (
                    <g key={serie.puesto}>
                      <path d={recorrido} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.55" />

                      {serie.puntos.map((punto, i) =>
                        punto.saltoAntes && i > 0 ? (
                          <line
                            key={`salto-${punto.entrevistaId}`}
                            x1={(x(punto.numero) + x(serie.puntos[i - 1].numero)) / 2}
                            y1={ARRIBA}
                            x2={(x(punto.numero) + x(serie.puntos[i - 1].numero)) / 2}
                            y2={ARRIBA + altoUtil}
                            stroke={color}
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          >
                            <title>Pasaron {punto.diasDesdeAnterior} días</title>
                          </line>
                        ) : null,
                      )}

                      {serie.puntos.map((punto) => (
                        <circle
                          key={punto.entrevistaId}
                          cx={x(punto.numero)}
                          cy={y(punto.nota)}
                          r="4.5"
                          fill={color}
                          stroke="white"
                          strokeWidth="1.5"
                          tabIndex={0}
                          // Un <circle> no tiene equivalente HTML: el rol ARIA
                          // es lo que le da nombre ante el lector de pantalla.
                          // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
                          role="img"
                          aria-label={nombreDelPunto(serie, punto)}
                          className="cursor-pointer foco-anillo"
                          onPointerEnter={() => setActivo({ serie, punto })}
                          onPointerLeave={() => setActivo(null)}
                          onFocus={() => setActivo({ serie, punto })}
                          onBlur={() => setActivo(null)}
                          onKeyDown={(evento) => {
                            if (evento.key === 'Escape') setActivo(null)
                          }}
                        />
                      ))}
                    </g>
                  )
                })}
              </svg>

              {activo && (
                <DetalleDePunto
                  izquierda={(x(activo.punto.numero) / ANCHO) * 100}
                  arriba={(y(activo.punto.nota) / ALTO) * 100}
                  fecha={activo.punto.fecha}
                  puesto={activo.serie.etiqueta}
                  tecnologia={activo.punto.tecnologia}
                  nota={activo.punto.nota}
                />
              )}
            </div>

            <ul className="sr-only">
              {series.map((serie) => (
                <li key={serie.puesto}>{resumenDeSerie(serie)}</li>
              ))}
            </ul>
          </>
        )}
      </Tarjeta>
    </section>
  )
}

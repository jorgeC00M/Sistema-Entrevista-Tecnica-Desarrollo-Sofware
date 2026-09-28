import { useEffect, useRef, useState } from 'react'
import type { TouchEvent } from 'react'

import Icono from '@/components/ui/Icono'
import { useCarrusel } from '@/features/landing/hooks/useCarrusel'
import { ICONO_POR_AREA, ICONO_POR_DEFECTO } from '@/lib/iconosPorArea'
import type { Area, Nivel } from '@/types/catalogos'

interface Props {
  areas: Area[]
  niveles: Nivel[]
}

const DURACION_MS = 3500
const GAP_PX = 20

function calcularPorVista(): number {
  if (typeof window === 'undefined') return 3
  if (window.innerWidth <= 700) return 1
  if (window.innerWidth <= 1024) return 2
  return 3
}

/**
 * Carrusel de áreas técnicas: 3/2/1 tarjetas visibles según el ancho,
 * avanza sola cada 3.5s, se puede navegar con flechas, indicadores o
 * deslizando el dedo, y se pausa al pasar el mouse. Solo muestra las áreas
 * reales que llegan por props — nunca agrega áreas de ejemplo.
 */
export default function CarruselAreas({ areas, niveles }: Props) {
  const [porVista, setPorVista] = useState(calcularPorVista)
  useEffect(() => {
    const alRedimensionar = () => setPorVista(calcularPorVista())
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [])

  const { indice, maxIndice, ir, siguiente, anterior, pausar, reanudar } = useCarrusel(
    areas.length,
    porVista,
    DURACION_MS,
  )

  // El ancho de cada tarjeta se calcula del ancho REAL del contenedor
  // visible (vía ResizeObserver), no de un `flex-basis` en porcentaje: con
  // porcentaje, el navegador reparte el redondeo de forma desigual entre
  // tarjetas (1-2px de diferencia), y ese error se acumula multiplicado por
  // el índice — por eso solo se notaba al llegar a la última posición.
  // Medir en JS y aplicar `width` en píxeles a cada tarjeta elimina el
  // desfase: el mismo número que arma el ancho es el que arma el `translateX`.
  const viewportRef = useRef<HTMLDivElement>(null)
  const [anchoContenedor, setAnchoContenedor] = useState(0)
  useEffect(() => {
    const elemento = viewportRef.current
    if (!elemento) return
    const observador = new ResizeObserver((entradas) => {
      setAnchoContenedor(entradas[0].contentRect.width)
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [])

  const anchoTarjeta =
    anchoContenedor > 0 ? (anchoContenedor - (porVista - 1) * GAP_PX) / porVista : 0
  const pasoPx = anchoTarjeta + GAP_PX

  const inicioToqueRef = useRef<number | null>(null)
  const manejarInicioToque = (e: TouchEvent<HTMLDivElement>) => {
    inicioToqueRef.current = e.touches[0].clientX
  }
  const manejarFinToque = (e: TouchEvent<HTMLDivElement>) => {
    if (inicioToqueRef.current === null) return
    const dx = e.changedTouches[0].clientX - inicioToqueRef.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) siguiente()
      else anterior()
    }
    inicioToqueRef.current = null
  }

  // Con las áreas reales cabiendo todas a la vez no hay nada que navegar:
  // se ocultan flechas e indicadores (el avance automático ya se apaga solo
  // en `useCarrusel` cuando `maxIndice` es 0).
  const hayNavegacion = maxIndice > 0

  return (
    <div
      className="relative"
      onMouseEnter={pausar}
      onMouseLeave={reanudar}
      aria-roledescription="carrusel"
      aria-label="Áreas técnicas"
    >
      <div ref={viewportRef} className="-m-5 overflow-hidden p-5">
        <div
          className="flex gap-5 transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
          style={{ transform: `translateX(-${indice * pasoPx}px)` }}
          onTouchStart={manejarInicioToque}
          onTouchEnd={manejarFinToque}
        >
          {areas.map((area, i) => {
            const actual = i === indice
            return (
              <article
                key={area.codigo}
                className={`relative shrink-0 overflow-hidden rounded-vidrio border bg-vidrio-card p-7 backdrop-blur-[18px] transition-all duration-500 ${
                  actual
                    ? '-translate-y-1.5 border-vidrio-acento/45 bg-white/80 shadow-[0_26px_50px_-24px_rgba(28,47,94,0.45)]'
                    : 'border-vidrio-borde'
                }`}
                style={{ width: anchoTarjeta > 0 ? `${anchoTarjeta}px` : undefined }}
              >
                <span
                  className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-control transition-colors duration-500 ${
                    actual
                      ? 'bg-vidrio-acento text-white'
                      : 'bg-vidrio-acento-suave text-vidrio-acento'
                  }`}
                >
                  <Icono nombre={ICONO_POR_AREA[area.codigo] ?? ICONO_POR_DEFECTO} />
                </span>
                <h3 className="relative z-10 mt-4 text-[1.15rem] font-semibold text-vidrio-ink">
                  {area.nombre}
                </h3>
                <p className="relative z-10 mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">
                  {area.descripcion}
                </p>
              </article>
            )
          })}
        </div>
      </div>

      <div className="mt-[30px] flex flex-wrap items-center justify-between gap-5">
        {niveles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 text-[0.95rem]">
            <span className="text-vidrio-texto">Niveles disponibles:</span>
            {niveles.map((n) => (
              <span
                key={n.codigo}
                className="rounded-full border border-vidrio-borde bg-vidrio-field px-3.5 py-1.5 font-medium text-vidrio-ink"
              >
                {n.nombre}
              </span>
            ))}
          </div>
        )}

        {hayNavegacion && (
          <div className="flex items-center gap-[18px]">
            <div className="flex gap-2" role="tablist">
              {Array.from({ length: maxIndice + 1 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-label={`Ir al grupo ${i + 1}`}
                  aria-selected={i === indice}
                  onClick={() => ir(i)}
                  className={`relative h-1.5 overflow-hidden rounded-full bg-vidrio-linea transition-[width] ${
                    i === indice ? 'w-12' : 'w-7'
                  }`}
                >
                  {i === indice && (
                    <span
                      key={indice}
                      className="absolute inset-0 origin-left animate-[llenar_3.5s_linear_forwards] bg-vidrio-acento"
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={anterior}
                aria-label="Área anterior"
                className="grid h-11 w-11 place-items-center rounded-control border border-vidrio-borde bg-vidrio-field text-vidrio-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Icono nombre="chevron-izquierda" className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                onClick={siguiente}
                aria-label="Área siguiente"
                className="grid h-11 w-11 place-items-center rounded-control border border-vidrio-borde bg-vidrio-field text-vidrio-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Icono nombre="chevron-derecha" className="h-[18px] w-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

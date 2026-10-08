import { useEffect, useRef, useState } from 'react'
import type { ReactNode, TouchEvent } from 'react'

import Icono from '@/components/ui/Icono'
import { useCarrusel } from '@/features/landing/hooks/useCarrusel'

interface Props<T> {
  elementos: T[]
  /** Clave estable de cada elemento, para React. */
  clave: (elemento: T) => string
  /** Qué se recorre, para lectores de pantalla ("Puestos"). */
  etiqueta: string
  /** Cómo se llama un elemento en los botones ("puesto" → "Puesto anterior"). */
  nombreDelElemento: string
  /** Contenido de cada tarjeta; `actual` es la que está al frente. */
  renderTarjeta: (elemento: T, actual: boolean) => ReactNode
  /** Contenido opcional a la izquierda de la navegación (p. ej., los niveles). */
  pie?: ReactNode
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
 * Carrusel de tarjetas: 3/2/1 visibles según el ancho, avanza solo cada 3.5s,
 * se navega con flechas, indicadores o deslizando el dedo, y se pausa al pasar
 * el mouse. Solo muestra los elementos reales que llegan por props.
 *
 * Genérico a propósito: nació como carrusel de áreas y la landing pasó a mostrar
 * puestos. Con dos copias casi iguales, el primer arreglo se haría en una sola;
 * aquí la mecánica es una y cada sección decide cómo se ve su tarjeta.
 */
export default function CarruselDeTarjetas<T>({
  elementos,
  clave,
  etiqueta,
  nombreDelElemento,
  renderTarjeta,
  pie,
}: Props<T>) {
  const [porVista, setPorVista] = useState(calcularPorVista)
  useEffect(() => {
    const alRedimensionar = () => setPorVista(calcularPorVista())
    window.addEventListener('resize', alRedimensionar)
    return () => window.removeEventListener('resize', alRedimensionar)
  }, [])

  const { indice, maxIndice, ir, siguiente, anterior, pausar, reanudar } = useCarrusel(
    elementos.length,
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

  // Si todos los elementos caben a la vez no hay nada que navegar: se ocultan
  // flechas e indicadores (el avance automático ya se apaga solo en
  // `useCarrusel` cuando `maxIndice` es 0).
  const hayNavegacion = maxIndice > 0
  const nombre = nombreDelElemento.charAt(0).toUpperCase() + nombreDelElemento.slice(1)

  return (
    <div
      className="relative"
      onMouseEnter={pausar}
      onMouseLeave={reanudar}
      aria-roledescription="carrusel"
      aria-label={etiqueta}
    >
      <div ref={viewportRef} className="-m-5 overflow-hidden p-5">
        <div
          className="flex gap-5 transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
          style={{ transform: `translateX(-${indice * pasoPx}px)` }}
          onTouchStart={manejarInicioToque}
          onTouchEnd={manejarFinToque}
        >
          {elementos.map((elemento, i) => {
            const actual = i === indice
            return (
              <article
                key={clave(elemento)}
                className={`relative shrink-0 overflow-hidden rounded-vidrio border bg-vidrio-card p-7 backdrop-blur-[18px] transition-all duration-500 ${
                  actual
                    ? '-translate-y-1.5 border-vidrio-acento/45 bg-white/80 shadow-[0_26px_50px_-24px_rgba(28,47,94,0.45)]'
                    : 'border-vidrio-borde'
                }`}
                style={{ width: anchoTarjeta > 0 ? `${anchoTarjeta}px` : undefined }}
              >
                {renderTarjeta(elemento, actual)}
              </article>
            )
          })}
        </div>
      </div>

      <div className="mt-[30px] flex flex-wrap items-center justify-between gap-5">
        {pie}

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
                aria-label={`${nombre} anterior`}
                className="grid h-11 w-11 place-items-center rounded-control border border-vidrio-borde bg-vidrio-field text-vidrio-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                <Icono nombre="chevron-izquierda" className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                onClick={siguiente}
                aria-label={`${nombre} siguiente`}
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

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'
import Wrap from '@/features/landing/components/Wrap'

const SECCIONES = [
  { id: 'inicio', etiqueta: 'Inicio' },
  { id: 'como-funciona', etiqueta: 'Cómo funciona' },
  { id: 'que-recibes', etiqueta: 'Qué recibes' },
  { id: 'cv', etiqueta: 'Revisión de CV' },
  { id: 'puestos', etiqueta: 'Puestos' },
]

/**
 * Encabezado de la landing: barra flotante de vidrio, separada de los
 * bordes, que cambia de "oscura sobre el hero" a "clara tras el hero" y
 * marca el enlace activo según la sección visible.
 *
 * No reutiliza `components/layout/Header`, que es el de la aplicación
 * autenticada: aquel usa `useAuth` y muestra el nombre del usuario y el botón
 * de salir. Comparten la marca y nada más.
 */
export default function HeaderLanding() {
  const [sobreHero, setSobreHero] = useState(true)
  const [seccionActiva, setSeccionActiva] = useState('inicio')

  // Oscura mientras el hero (id="inicio") está en pantalla, clara al salir
  // de él — mismo mecanismo de IntersectionObserver que ya usa
  // `useRevelarAlEntrar`, aplicado aquí directo por ser un único consumidor.
  useEffect(() => {
    const hero = document.getElementById('inicio')
    if (!hero) return
    const observador = new IntersectionObserver(
      ([entrada]) => setSobreHero(entrada.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px' },
    )
    observador.observe(hero)
    return () => observador.disconnect()
  }, [])

  // Enlace activo según qué sección ocupa el centro de la pantalla.
  useEffect(() => {
    const elementos = SECCIONES.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) setSeccionActiva(entrada.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    elementos.forEach((el) => observador.observe(el))
    return () => observador.disconnect()
  }, [])

  return (
    <header
      className={`fixed inset-x-0 z-50 transition-[top] duration-300 ${sobreHero ? 'top-[18px]' : 'top-3'}`}
    >
      <Wrap>
        <div
          className={`flex items-center gap-5 rounded-vidrio border py-2.5 pr-2.5 pl-4 transition-[background-color,border-color,box-shadow] duration-[350ms] ${
            sobreHero
              ? 'border-white/20 bg-white/10 text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.4)] backdrop-blur-md'
              : 'border-[rgba(255,255,255,.6)] bg-[rgba(232,237,245,.55)] text-vidrio-ink shadow-[0_8px_24px_-18px_rgba(28,47,94,.25)] backdrop-blur-[16px] backdrop-saturate-[1.4]'
          }`}
        >
          <Link to="/" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-control bg-white text-vidrio-acento">
              <Icono nombre="marca" className="h-[18px] w-[18px]" />
            </span>
            <span className="text-sm sm:text-base">Antesala</span>
          </Link>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {SECCIONES.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`rounded-control border px-4 py-2 text-sm transition-colors duration-200 ${
                  seccionActiva === s.id
                    ? sobreHero
                      ? 'border-white/25 bg-white/15 text-white'
                      : 'border-vidrio-acento/20 bg-vidrio-acento-suave text-vidrio-acento'
                    : sobreHero
                      ? 'border-transparent text-white/80 hover:bg-white/10 hover:text-white'
                      : 'border-transparent text-vidrio-texto hover:bg-vidrio-acento-suave hover:text-vidrio-ink'
                }`}
              >
                {s.etiqueta}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className={`hidden rounded-control px-3.5 py-2.5 text-sm font-medium transition-colors duration-200 sm:block ${
                sobreHero
                  ? 'text-white/90 hover:bg-white/10'
                  : 'text-vidrio-ink hover:bg-vidrio-acento-suave'
              }`}
            >
              Iniciar sesión
            </Link>
            <Link to="/registro">
              <Boton
                variante={sobreHero ? 'vidrio-secundario' : 'vidrio'}
                forma="pildora"
                tamano="sm"
                className="group"
              >
                Crear cuenta
                <Icono
                  nombre="flecha-diagonal"
                  className="h-[17px] w-[17px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Boton>
            </Link>
          </div>
        </div>
      </Wrap>
    </header>
  )
}

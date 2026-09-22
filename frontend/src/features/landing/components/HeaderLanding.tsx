import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'

const SECCIONES = [
  { href: '#como-funciona', etiqueta: 'Cómo funciona' },
  { href: '#que-recibes', etiqueta: 'Qué recibes' },
  { href: '#areas', etiqueta: 'Áreas' },
]

/**
 * Encabezado de la landing.
 *
 * No reutiliza `components/layout/Header`, que es el de la aplicación
 * autenticada: aquel usa `useAuth` y muestra el nombre del usuario y el botón
 * de salir. Comparten la marca y nada más.
 *
 * Es pegajoso para que las dos acciones sigan alcanzables por larga que sea la
 * página, que es lo que la guía de conversión llama CTA persistente.
 */
export default function HeaderLanding() {
  return (
    <header className="sticky top-0 z-20 border-b border-tinta-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-tinta-950">
          <span className="flex h-8 w-8 items-center justify-center rounded-control bg-iris-600 text-white">
            <Icono nombre="marca" className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold sm:text-base">Entrevistas Técnicas</span>
        </Link>

        {/* Los enlaces de sección se ocultan en móvil: el contenido está a un
            desplazamiento de distancia y las dos acciones importan más. */}
        <nav className="hidden items-center gap-1 md:flex">
          {SECCIONES.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className="rounded-control px-3 py-2 text-sm font-medium text-tinta-500 transition hover:bg-tinta-100 hover:text-tinta-950"
            >
              {s.etiqueta}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/login">
            <Boton variante="secundario">Iniciar sesión</Boton>
          </Link>
          <Link to="/registro" className="hidden sm:block">
            <Boton>Crear cuenta</Boton>
          </Link>
        </div>
      </div>
    </header>
  )
}

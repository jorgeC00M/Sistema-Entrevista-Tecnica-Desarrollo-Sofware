import { Link } from 'react-router-dom'

import Icono from '@/components/ui/Icono'
import Wrap from '@/features/landing/components/Wrap'

// Marcadores de posición hasta que Jorge confirme el correo definitivo.
const CORREO_CONTACTO = 'jorgecondorimaitarom@gmail.com'
const AUTOR = 'Jorge Condori'
const ANIO = new Date().getFullYear()

const ENLACES = [
  { href: '#como-funciona', etiqueta: 'Cómo funciona' },
  { href: '#que-recibes', etiqueta: 'Qué recibes' },
  { href: '#cv', etiqueta: 'Revisión de CV' },
  { href: '#puestos', etiqueta: 'Puestos' },
]

/** Footer compacto de dos filas: marca + navegación en línea arriba,
 * identificación académica y contacto abajo — mismo contenido que antes,
 * sin las tres columnas separadas. */
export default function FooterLanding() {
  return (
    <footer className="bg-vidrio-ink py-7 text-sm text-vidrio-sidebar-muted">
      <Wrap>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-cuerpo font-semibold text-white"
          >
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-control bg-white text-vidrio-ink">
              <Icono nombre="marca" className="h-4 w-4" />
            </span>
            Antesala
          </Link>

          <nav aria-label="Secciones" className="flex flex-wrap gap-[22px]">
            {ENLACES.map((e) => (
              <a key={e.href} href={e.href} className="hover:text-white">
                {e.etiqueta}
              </a>
            ))}
            <Link to="/registro" className="hover:text-white">
              Crear cuenta
            </Link>
            <Link to="/login" className="hover:text-white">
              Iniciar sesión
            </Link>
          </nav>
        </div>

        <div className="mt-[18px] flex flex-wrap justify-between gap-3 border-t border-white/10 pt-4 text-meta text-vidrio-sidebar-muted">
          <span>Proyecto de Grado · Ingeniería de Sistemas · Universidad Mayor de San Simón</span>
          <span>
            {AUTOR} · {ANIO} ·{' '}
            <a href={`mailto:${CORREO_CONTACTO}`} className="hover:text-white">
              {CORREO_CONTACTO}
            </a>
          </span>
        </div>
      </Wrap>
    </footer>
  )
}

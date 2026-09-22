import { Link } from 'react-router-dom'

import Icono from '@/components/ui/Icono'

// Marcadores de posición hasta que Jorge confirme el correo definitivo.
const CORREO_CONTACTO = 'jorgecondorimaitarom@gmail.com'
const AUTOR = 'Jorge Condori'
const ANIO = new Date().getFullYear()

export default function FooterLanding() {
  return (
    <footer className="border-t border-tinta-100 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 text-tinta-950">
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-iris-600 text-white">
                <Icono nombre="marca" className="h-5 w-5" />
              </span>
              <span className="text-sm font-semibold">Entrevistas Técnicas</span>
            </div>
            <p className="mt-3 text-sm text-tinta-500">
              Simulador de entrevistas técnicas con evaluación automatizada, para egresados de
              Ingeniería de Sistemas.
            </p>
          </div>

          <nav aria-label="Secciones">
            <h2 className="text-sm font-semibold text-tinta-950">Navegación</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="#como-funciona" className="text-tinta-500 hover:text-iris-600">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#que-recibes" className="text-tinta-500 hover:text-iris-600">
                  Qué recibes
                </a>
              </li>
              <li>
                <a href="#areas" className="text-tinta-500 hover:text-iris-600">
                  Áreas técnicas
                </a>
              </li>
              <li>
                <Link to="/registro" className="text-tinta-500 hover:text-iris-600">
                  Crear cuenta
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-tinta-500 hover:text-iris-600">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-tinta-950">Proyecto</h2>
            <p className="mt-3 text-sm text-tinta-500">
              Proyecto de Grado
              <br />
              Carrera de Ingeniería de Sistemas
              <br />
              Universidad Mayor de San Simón
            </p>
            <p className="mt-3 text-sm text-tinta-500">
              <a href={`mailto:${CORREO_CONTACTO}`} className="hover:text-iris-600">
                {CORREO_CONTACTO}
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-tinta-100 pt-6 text-sm text-tinta-500">
          {AUTOR} · {ANIO}
        </p>
      </div>
    </footer>
  )
}

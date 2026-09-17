import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Boton from './Boton'

const enlaceClase = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Encabezado() {
  const { usuario, cerrarSesion } = useAuth()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-sm font-semibold text-slate-900">
          Entrevistas Técnicas
        </NavLink>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={enlaceClase}>
            Nueva entrevista
          </NavLink>
          <NavLink to="/historial" className={enlaceClase}>
            Historial
          </NavLink>
          <NavLink to="/progreso" className={enlaceClase}>
            Progreso
          </NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-500 sm:inline">{usuario?.nombre_completo}</span>
          <Boton variante="secundario" onClick={cerrarSesion}>
            Salir
          </Boton>
        </div>
      </div>
    </header>
  )
}

import { NavLink } from 'react-router-dom'

import ContinuarEntrevista from '@/components/layout/ContinuarEntrevista'
import { DESTINOS, DESTINO_PRINCIPAL } from '@/components/layout/destinos'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import IconoNav from '@/components/ui/IconoNav'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Props {
  plegado: boolean
  onAlternarPlegado?: () => void
  entrevistaEnCurso: EntrevistaEnCurso | null
  /** Se invoca al elegir un destino; el cajón de móvil lo usa para cerrarse. */
  onNavegar?: () => void
}

function iniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

export default function Sidebar({
  plegado,
  onAlternarPlegado,
  entrevistaEnCurso,
  onNavegar,
}: Props) {
  const { usuario, cerrarSesion } = useAuth()

  const claseDestino = ({ isActive }: { isActive: boolean }) =>
    [
      // `relative` sostiene la barra vertical del estado activo, que es lo que
      // permite distinguirlo sin depender solo del color.
      'group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
      plegado ? 'justify-center p-2.5' : 'px-3 py-2.5',
      isActive
        ? 'bg-indigo-50 text-indigo-700 before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-1 before:rounded-full before:bg-indigo-600'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    ].join(' ')

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Acción principal: botón sólido, no un enlace más de la lista. */}
      <div className="flex flex-col gap-2">
        <NavLink
          to={DESTINO_PRINCIPAL.ruta}
          onClick={onNavegar}
          title={plegado ? DESTINO_PRINCIPAL.etiqueta : undefined}
          className={`flex items-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            plegado ? 'justify-center p-2.5' : 'justify-center px-3 py-2.5'
          }`}
        >
          <IconoNav nombre={DESTINO_PRINCIPAL.icono} className="h-4 w-4" />
          {!plegado && DESTINO_PRINCIPAL.etiqueta}
        </NavLink>

        {entrevistaEnCurso && (
          <ContinuarEntrevista
            entrevista={entrevistaEnCurso}
            plegado={plegado}
            onNavegar={onNavegar}
          />
        )}
      </div>

      <nav aria-label="Secciones" className="flex-1">
        <ul className="flex flex-col gap-1">
          {DESTINOS.map((destino) => (
            <li key={destino.ruta}>
              {/* NavLink pone `aria-current="page"` solo cuando está activo;
                  no hay que declararlo a mano ni pisarlo. */}
              <NavLink
                to={destino.ruta}
                onClick={onNavegar}
                title={plegado ? destino.etiqueta : undefined}
                className={claseDestino}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      <IconoNav nombre={destino.icono} />
                    </span>
                    {!plegado && <span>{destino.etiqueta}</span>}
                    {isActive && <span className="sr-only">(sección actual)</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil del usuario al pie, separado del resto. */}
      <div className="flex flex-col gap-1 border-t border-slate-200 pt-4">
        {!plegado && usuario && (
          <div className="flex items-center gap-3 px-1 pb-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {iniciales(usuario.nombre_completo)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-slate-900">
                {usuario.nombre_completo}
              </span>
              <span className="block truncate text-xs text-slate-500">{usuario.email}</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={cerrarSesion}
          title={plegado ? 'Cerrar sesión' : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
            plegado ? 'justify-center p-2.5' : 'px-3 py-2.5'
          }`}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center">
            <IconoNav nombre="salir" />
          </span>
          {!plegado && 'Cerrar sesión'}
        </button>

        {onAlternarPlegado && (
          <button
            type="button"
            onClick={onAlternarPlegado}
            aria-expanded={!plegado}
            className={`mt-1 flex items-center gap-3 rounded-lg text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              plegado ? 'justify-center p-2.5' : 'px-3 py-2.5'
            }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              <IconoNav nombre={plegado ? 'desplegar' : 'plegar'} />
            </span>
            {!plegado && 'Plegar menú'}
            {plegado && <span className="sr-only">Desplegar menú</span>}
          </button>
        )}
      </div>
    </div>
  )
}

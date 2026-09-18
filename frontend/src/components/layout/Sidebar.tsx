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
      'group flex items-center gap-3 rounded-lg text-sm font-medium transition-colors duration-150',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
      plegado ? 'justify-center p-2.5' : 'px-3 py-2.5',
      // El activo se distingue por el relleno sólido de la píldora, no solo por
      // el color: los inactivos nunca tienen fondo propio, ni siquiera en hover
      // (que usa slate-800, no indigo). aria-current="page" lo refuerza.
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white',
    ].join(' ')

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      {/* Bloque de marca: mismo icono que la landing, para que la marca se vea
          igual en las dos zonas de la app. Se oculta el texto al plegar. */}
      <div className={`flex items-center gap-3 px-1 ${plegado ? 'justify-center' : ''}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <IconoNav nombre="marca" className="h-5 w-5" />
        </span>
        {!plegado && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">
              Entrevistas Técnicas
            </span>
            <span className="block truncate text-xs text-slate-400">Simulador con IA</span>
          </span>
        )}
      </div>

      {/* Acción principal: botón sólido, no un enlace más de la lista. */}
      <div className="flex flex-col gap-2">
        <NavLink
          to={DESTINO_PRINCIPAL.ruta}
          onClick={onNavegar}
          title={plegado ? DESTINO_PRINCIPAL.etiqueta : undefined}
          className={`flex items-center gap-2 rounded-lg bg-indigo-600 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
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
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
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
      <div className="flex flex-col gap-1 border-t border-slate-800 pt-4">
        {!plegado && usuario && (
          <div className="flex items-center gap-3 px-1 pb-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-semibold text-indigo-300">
              {iniciales(usuario.nombre_completo)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-white">
                {usuario.nombre_completo}
              </span>
              <span className="block truncate text-xs text-slate-400">{usuario.email}</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={cerrarSesion}
          title={plegado ? 'Cerrar sesión' : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm font-medium text-slate-300 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 ${
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
            className={`mt-1 flex items-center gap-3 rounded-lg text-sm font-medium text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
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

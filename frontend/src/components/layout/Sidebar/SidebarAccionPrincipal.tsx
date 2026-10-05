import { NavLink } from 'react-router-dom'

import Icono from '@/components/ui/Icono'
import Tooltip from '@/components/ui/Tooltip'
import type { EntrevistaEnCurso } from '@/components/layout/useDestinosDisponibles'

interface Props {
  plegado: boolean
  entrevistaEnCurso: EntrevistaEnCurso | null
}

export default function SidebarAccionPrincipal({ plegado, entrevistaEnCurso }: Props) {
  const botonNuevaEntrevista = (
    <NavLink
      to="/nueva-entrevista"
      title={plegado ? 'Nueva entrevista' : undefined}
      className={`flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        plegado ? 'p-2.5' : 'px-3 py-2.5'
      } ${
        entrevistaEnCurso
          ? 'border border-white/20 text-vidrio-sidebar-muted hover:bg-white/10 hover:text-white'
          : 'bg-white text-vidrio-ink shadow-sm hover:bg-vidrio-bg'
      }`}
    >
      <Icono nombre="mas" className="h-4 w-4" />
      {!plegado && 'Nueva entrevista'}
    </NavLink>
  )

  return (
    <div className="flex flex-col gap-2">
      {entrevistaEnCurso && (
        <NavLink
          to={`/entrevista/${entrevistaEnCurso.id}`}
          title={
            plegado
              ? `Continuar entrevista — ${entrevistaEnCurso.puestoDisplay} · ${entrevistaEnCurso.numeroActual}/${entrevistaEnCurso.totalPreguntas}`
              : undefined
          }
          className={`flex items-center gap-2 rounded-full bg-vidrio-acento text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-vidrio-acento-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            plegado ? 'justify-center p-2.5' : 'justify-center px-3 py-2.5'
          }`}
        >
          <Icono nombre="play" className="h-4 w-4" />
          {!plegado &&
            `Continuar · ${entrevistaEnCurso.numeroActual}/${entrevistaEnCurso.totalPreguntas}`}
        </NavLink>
      )}

      {plegado ? <Tooltip texto="Nueva entrevista">{botonNuevaEntrevista}</Tooltip> : botonNuevaEntrevista}
    </div>
  )
}

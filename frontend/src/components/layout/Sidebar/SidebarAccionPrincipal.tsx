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
      className={`flex items-center justify-center gap-2 rounded-control text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-500 ${
        plegado ? 'p-2.5' : 'px-3 py-2.5'
      } ${
        entrevistaEnCurso
          ? 'border border-tinta-700 text-tinta-300 hover:bg-tinta-900 hover:text-white'
          : 'bg-iris-600 text-white shadow-sm hover:bg-iris-500'
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
              ? `Continuar entrevista — ${entrevistaEnCurso.areaDisplay} · ${entrevistaEnCurso.numeroActual}/${entrevistaEnCurso.totalPreguntas}`
              : undefined
          }
          className={`flex items-center gap-2 rounded-control bg-iris-600 text-sm font-medium text-white shadow-sm transition-colors duration-150 hover:bg-iris-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-500 ${
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

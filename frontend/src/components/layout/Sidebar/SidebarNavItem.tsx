import { NavLink } from 'react-router-dom'

import Icono from '@/components/ui/Icono'
import Tooltip from '@/components/ui/Tooltip'
import type { Destino } from '@/components/layout/destinos'

interface Props {
  destino: Destino
  plegado: boolean
  onNavegar?: () => void
}

export default function SidebarNavItem({ destino, plegado, onNavegar }: Props) {
  const enlace = (
    <NavLink
      to={destino.ruta}
      // Sin esto, `/entrevista/:id` marcaría "activo" también estando en
      // `/entrevista/:id/resultados` (coincidencia por prefijo): ambos
      // pueden convivir en el menú a la vez desde que existen los destinos
      // condicionales.
      end
      onClick={onNavegar}
      title={plegado ? destino.etiqueta : undefined}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-control text-sm font-medium transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          plegado ? 'justify-center p-2.5' : 'px-3 py-2.5',
          isActive
            ? 'bg-white/[0.12] text-white'
            : 'text-vidrio-sidebar-muted hover:bg-white/[0.08] hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center ${
              isActive ? 'text-white' : 'text-vidrio-sidebar-muted group-hover:text-white'
            }`}
          >
            <Icono nombre={destino.icono} />
          </span>
          {!plegado && <span>{destino.etiqueta}</span>}
          {isActive && <span className="sr-only">(sección actual)</span>}
        </>
      )}
    </NavLink>
  )

  return <li>{plegado ? <Tooltip texto={destino.etiqueta}>{enlace}</Tooltip> : enlace}</li>
}

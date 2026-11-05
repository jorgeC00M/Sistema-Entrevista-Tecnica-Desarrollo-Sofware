import { NavLink } from 'react-router-dom'

import Icono from '@/components/ui/Icono'
import Tooltip from '@/components/ui/Tooltip'
import type { Destino } from '@/components/layout/destinos'
import { clasesDeEnlace } from '@/components/layout/Sidebar/clasesDeEnlace'

interface Props {
  destino: Destino
  plegado: boolean
  onNavegar?: () => void
}

export default function SidebarNavItem({ destino, plegado, onNavegar }: Props) {
  const enlace = (
    <NavLink
      to={destino.ruta}
      end={!destino.prefijo}
      onClick={onNavegar}
      title={plegado ? destino.etiqueta : undefined}
      // Plegado, `p-3` alrededor del icono de 20 px: 44 px de área táctil.
      className={({ isActive }) =>
        `${clasesDeEnlace(isActive)} gap-3 text-sm font-medium ${plegado ? 'justify-center p-3' : 'px-3 py-2.5'}`
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

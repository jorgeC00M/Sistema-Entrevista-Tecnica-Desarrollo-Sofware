import { NavLink } from 'react-router-dom'

import Divisor from '@/components/ui/Divisor'
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
      onClick={onNavegar}
      title={plegado ? destino.etiqueta : undefined}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-control border-l-[3px] text-sm font-medium transition-colors duration-150',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-500',
          plegado ? 'justify-center p-2.5' : 'px-3 py-2.5',
          isActive
            ? 'border-l-iris-600 bg-tinta-800 text-white'
            : 'border-l-transparent text-tinta-300 hover:bg-tinta-900 hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center ${
              isActive ? 'text-iris-400' : 'text-tinta-400 group-hover:text-white'
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

  return (
    <li>
      {plegado ? <Tooltip texto={destino.etiqueta}>{enlace}</Tooltip> : enlace}
      <Divisor tono="oscuro" className="mt-1" />
    </li>
  )
}

import { NavLink } from 'react-router-dom'

import BotonIcono from '@/components/ui/BotonIcono'
import Icono from '@/components/ui/Icono'

interface Props {
  plegado: boolean
  /** Ausente en el cajón móvil: ahí no tiene sentido colapsar a franja de iconos. */
  onAlternarPlegado?: () => void
}

export default function SidebarMarca({ plegado, onAlternarPlegado }: Props) {
  return (
    <div className={`flex items-center gap-2 ${plegado ? 'flex-col' : 'justify-between'}`}>
      <NavLink
        to="/nueva-entrevista"
        className={`flex min-w-0 items-center gap-3 rounded-control px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
          plegado ? 'justify-center' : ''
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white text-vidrio-ink">
          <Icono nombre="marca" className="h-5 w-5" />
        </span>
        {!plegado && (
          <span className="min-w-0">
            <span className="block truncate font-serif text-sm font-semibold text-white">
              Entrevistas Técnicas
            </span>
            <span className="block truncate text-xs text-vidrio-sidebar-muted">
              Simulador con IA
            </span>
          </span>
        )}
      </NavLink>

      {onAlternarPlegado && (
        <BotonIcono
          icono={plegado ? 'desplegar' : 'plegar'}
          aria-label={plegado ? 'Expandir menú' : 'Colapsar menú'}
          aria-expanded={!plegado}
          variante="oscuro"
          onClick={onAlternarPlegado}
          className="shrink-0"
        />
      )}
    </div>
  )
}

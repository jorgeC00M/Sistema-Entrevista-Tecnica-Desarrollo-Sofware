import { DESTINOS } from '@/components/layout/destinos'
import SidebarAccionPrincipal from '@/components/layout/Sidebar/SidebarAccionPrincipal'
import SidebarMarca from '@/components/layout/Sidebar/SidebarMarca'
import SidebarNavItem from '@/components/layout/Sidebar/SidebarNavItem'
import SidebarPerfil from '@/components/layout/Sidebar/SidebarPerfil'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'

interface Props {
  plegado: boolean
  /** Ausente en el cajón móvil: ahí no tiene sentido colapsar a franja de iconos. */
  onAlternarPlegado?: () => void
  entrevistaEnCurso: EntrevistaEnCurso | null
  /** Se invoca al elegir un destino; el cajón de móvil lo usa para cerrarse. */
  onNavegar?: () => void
}

export default function Sidebar({
  plegado,
  onAlternarPlegado,
  entrevistaEnCurso,
  onNavegar,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <SidebarMarca plegado={plegado} onAlternarPlegado={onAlternarPlegado} />

      <SidebarAccionPrincipal plegado={plegado} entrevistaEnCurso={entrevistaEnCurso} />

      <nav aria-label="Secciones" className="flex-1">
        <ul className="flex flex-col gap-1">
          {DESTINOS.map((destino) => (
            <SidebarNavItem
              key={destino.ruta}
              destino={destino}
              plegado={plegado}
              onNavegar={onNavegar}
            />
          ))}
        </ul>
      </nav>

      <SidebarPerfil plegado={plegado} />
    </div>
  )
}

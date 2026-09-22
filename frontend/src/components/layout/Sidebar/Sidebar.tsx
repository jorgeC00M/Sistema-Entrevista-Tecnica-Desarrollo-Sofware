import {
  DESTINOS,
  destinoEntrevistaEnCurso,
  destinoResultados,
} from '@/components/layout/destinos'
import SidebarAccionPrincipal from '@/components/layout/Sidebar/SidebarAccionPrincipal'
import SidebarMarca from '@/components/layout/Sidebar/SidebarMarca'
import SidebarNavItem from '@/components/layout/Sidebar/SidebarNavItem'
import SidebarPerfil from '@/components/layout/Sidebar/SidebarPerfil'
import type { EntrevistaEnCurso, EntrevistaFinalizada } from '@/components/layout/useDestinosDisponibles'

interface Props {
  plegado: boolean
  /** Ausente en el cajón móvil: ahí no tiene sentido colapsar a franja de iconos. */
  onAlternarPlegado?: () => void
  entrevistaEnCurso: EntrevistaEnCurso | null
  /** `null` cuando el estudiante todavía no finalizó ninguna entrevista. */
  ultimaFinalizada: EntrevistaFinalizada | null
  /** Se invoca al elegir un destino; el cajón de móvil lo usa para cerrarse. */
  onNavegar?: () => void
}

export default function Sidebar({
  plegado,
  onAlternarPlegado,
  entrevistaEnCurso,
  ultimaFinalizada,
  onNavegar,
}: Props) {
  // Los condicionales van primero, como en el diseño: un destino que no
  // aplica no se muestra como enlace inerte, directamente no existe en la
  // lista.
  const destinos = [
    ...(entrevistaEnCurso ? [destinoEntrevistaEnCurso(entrevistaEnCurso.id)] : []),
    ...(ultimaFinalizada ? [destinoResultados(ultimaFinalizada.id)] : []),
    ...DESTINOS,
  ]

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <SidebarMarca plegado={plegado} onAlternarPlegado={onAlternarPlegado} />

      <SidebarAccionPrincipal plegado={plegado} entrevistaEnCurso={entrevistaEnCurso} />

      <nav aria-label="Secciones" className="flex-1">
        <ul className="flex flex-col gap-1">
          {destinos.map((destino) => (
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

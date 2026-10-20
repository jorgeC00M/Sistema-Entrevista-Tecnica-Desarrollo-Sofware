import { GRUPOS_DE_DESTINOS } from '@/components/layout/destinos'
import SidebarAccionPrincipal from '@/components/layout/Sidebar/SidebarAccionPrincipal'
import SidebarMarca from '@/components/layout/Sidebar/SidebarMarca'
import SidebarNavItem from '@/components/layout/Sidebar/SidebarNavItem'
import SidebarPerfil from '@/components/layout/Sidebar/SidebarPerfil'
import Divisor from '@/components/ui/Divisor'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'

interface Props {
  plegado: boolean
  /** Ausente fuera de escritorio: en el cajón y en tablet no se pliega a mano. */
  onAlternarPlegado?: () => void
  entrevistaEnCurso: EntrevistaEnCurso | null
  /** Se invoca al elegir un destino; el cajón de móvil lo usa para cerrarse. */
  onNavegar?: () => void
}

/**
 * Arriba la marca y la acción de practicar; en medio los destinos, por etapa
 * ("Prepararte", "Tu progreso"); abajo el bloque de usuario, que lleva al
 * perfil, y cerrar sesión.
 *
 * Plegado, el rótulo de cada grupo se vuelve una línea y queda solo para el
 * lector de pantalla: sigue nombrando la lista que viene.
 */
export default function Sidebar({ plegado, onAlternarPlegado, entrevistaEnCurso, onNavegar }: Props) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <SidebarMarca plegado={plegado} onAlternarPlegado={onAlternarPlegado} />

      <SidebarAccionPrincipal plegado={plegado} entrevistaEnCurso={entrevistaEnCurso} />

      <nav aria-label="Secciones" className="flex flex-1 flex-col gap-5">
        {GRUPOS_DE_DESTINOS.map((grupo) => {
          const idTitulo = `grupo-${grupo.titulo.toLowerCase().replace(/\s+/g, '-')}`
          return (
            <div key={grupo.titulo} className="flex flex-col gap-2">
              {plegado && <Divisor tono="oscuro" />}
              <h2
                id={idTitulo}
                className={plegado ? 'sr-only' : 'px-3 text-label-mono text-vidrio-sidebar-muted uppercase'}
              >
                {grupo.titulo}
              </h2>
              <ul aria-labelledby={idTitulo} className="flex flex-col gap-1">
                {grupo.destinos.map((destino) => (
                  <SidebarNavItem key={destino.ruta} destino={destino} plegado={plegado} onNavegar={onNavegar} />
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      <SidebarPerfil plegado={plegado} onNavegar={onNavegar} />
    </div>
  )
}

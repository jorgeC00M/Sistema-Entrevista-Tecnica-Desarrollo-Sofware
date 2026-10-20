import { NavLink } from 'react-router-dom'

import Avatar from '@/components/ui/Avatar'
import Boton from '@/components/ui/Boton'
import BotonIcono from '@/components/ui/BotonIcono'
import Divisor from '@/components/ui/Divisor'
import Icono from '@/components/ui/Icono'
import Tooltip from '@/components/ui/Tooltip'
import { clasesDeEnlace } from '@/components/layout/Sidebar/clasesDeEnlace'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Props {
  plegado: boolean
  /** El cajón de móvil lo usa para cerrarse al ir al perfil. */
  onNavegar?: () => void
}

/**
 * El pie del sidebar: quién eres —que es a la vez el enlace a "Mi perfil",
 * como en la mayoría de apps— y cerrar sesión. El perfil no se repite como
 * destino de la lista.
 */
export default function SidebarPerfil({ plegado, onNavegar }: Props) {
  const { usuario, cerrarSesion } = useAuth()

  // Plegado solo queda el icono: es un control (BotonIcono, 8 px). Con
  // texto es una acción (Boton, píldora). Regla de forma del sistema.
  const botonSalir = plegado ? (
    <BotonIcono icono="salir" tono="oscuro" aria-label="Cerrar sesión" onClick={cerrarSesion} className="w-full" />
  ) : (
    <Boton variante="fantasma" icono="salir" onClick={cerrarSesion} className="w-full justify-start">
      Cerrar sesión
    </Boton>
  )

  const enlacePerfil = usuario && (
    <NavLink
      to="/perfil"
      end
      onClick={onNavegar}
      aria-label={plegado ? 'Mi perfil' : undefined}
      // Plegado, `p-1` alrededor del avatar de 36 px: 44 px de área táctil.
      className={({ isActive }) =>
        `${clasesDeEnlace(isActive)} gap-3 ${plegado ? 'justify-center p-1' : 'px-2 py-2'}`
      }
    >
      {({ isActive }) => (
        <>
          <Avatar nombre={usuario.nombre_completo} />
          {!plegado && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">{usuario.nombre_completo}</span>
                <span className="block truncate text-xs text-vidrio-sidebar-muted">{usuario.email}</span>
              </span>
              <Icono nombre="abajo" className="h-4 w-4 shrink-0 -rotate-90 text-vidrio-sidebar-muted" />
            </>
          )}
          {isActive && <span className="sr-only">(sección actual)</span>}
        </>
      )}
    </NavLink>
  )

  return (
    <div className="flex flex-col gap-3 pt-3">
      <Divisor tono="oscuro" />
      {enlacePerfil && (plegado ? <Tooltip texto="Mi perfil">{enlacePerfil}</Tooltip> : enlacePerfil)}
      {plegado ? <Tooltip texto="Cerrar sesión">{botonSalir}</Tooltip> : botonSalir}
    </div>
  )
}

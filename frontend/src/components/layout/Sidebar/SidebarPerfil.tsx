import Avatar from '@/components/ui/Avatar'
import Boton from '@/components/ui/Boton'
import BotonIcono from '@/components/ui/BotonIcono'
import Divisor from '@/components/ui/Divisor'
import Tooltip from '@/components/ui/Tooltip'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Props {
  plegado: boolean
}

/**
 * El pie del sidebar: quién inició sesión y cerrar sesión.
 *
 * El bloque del usuario solo informa, no es un enlace: al perfil se llega por
 * el destino «Mi perfil» de la lista (`perfil-como-destino`), que dice qué es.
 * Antes este bloque era el único camino y no nombraba el perfil en ningún lado.
 */
export default function SidebarPerfil({ plegado }: Props) {
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

  // Plegado, el mismo relleno que tenía el enlace (`p-1` alrededor del avatar
  // de 36 px), para que el pie no salte al quitarlo. Ahí el nombre lo da el
  // tooltip, cuyo texto queda en el DOM: el lector de pantalla lo lee una vez.
  const bloqueUsuario = usuario && (
    <div className={`flex items-center gap-3 ${plegado ? 'justify-center p-1' : 'px-2 py-2'}`}>
      <Avatar nombre={usuario.nombre_completo} />
      {!plegado && (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{usuario.nombre_completo}</span>
          <span className="block truncate text-xs text-vidrio-sidebar-muted">{usuario.email}</span>
        </span>
      )}
    </div>
  )

  return (
    <div className="flex flex-col gap-3 pt-3">
      <Divisor tono="oscuro" />
      {usuario && bloqueUsuario && (plegado ? <Tooltip texto={usuario.nombre_completo}>{bloqueUsuario}</Tooltip> : bloqueUsuario)}
      {plegado ? <Tooltip texto="Cerrar sesión">{botonSalir}</Tooltip> : botonSalir}
    </div>
  )
}

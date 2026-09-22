import Avatar from '@/components/ui/Avatar'
import Boton from '@/components/ui/Boton'
import Divisor from '@/components/ui/Divisor'
import Tooltip from '@/components/ui/Tooltip'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface Props {
  plegado: boolean
}

export default function SidebarPerfil({ plegado }: Props) {
  const { usuario, cerrarSesion } = useAuth()

  const botonSalir = (
    <Boton
      variante="fantasma"
      icono="salir"
      onClick={cerrarSesion}
      className={plegado ? 'w-full justify-center p-2.5' : 'w-full justify-start'}
    >
      {!plegado && 'Cerrar sesión'}
    </Boton>
  )

  return (
    <div className="flex flex-col gap-3 pt-3">
      <Divisor tono="oscuro" />

      {!plegado && usuario && (
        <div className="flex items-center gap-3 px-1">
          <Avatar nombre={usuario.nombre_completo} tono="oscuro" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">
              {usuario.nombre_completo}
            </span>
            <span className="block truncate text-xs text-tinta-300">{usuario.email}</span>
          </span>
        </div>
      )}

      {plegado ? <Tooltip texto="Cerrar sesión">{botonSalir}</Tooltip> : botonSalir}
    </div>
  )
}

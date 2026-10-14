import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'

interface Props {
  /** El texto del botón principal cambia según dónde está ("Crear cuenta gratis"). */
  textoRegistro: string
  /** Sobre qué fondo va: decide el color del enlace secundario. */
  fondo: 'oscuro' | 'claro'
}

const ENLACE_POR_FONDO = {
  oscuro: 'text-white/85 hover:text-white focus-visible:outline-white',
  claro: 'text-vidrio-ink hover:text-vidrio-acento focus-visible:outline-vidrio-acento',
} as const

/**
 * Una sola acción principal y, al lado, la secundaria como enlace de texto.
 *
 * Antes eran dos botones —uno lleno y uno fantasma—, el par por defecto de toda
 * landing generada. Quien ya tiene cuenta no necesita un botón que compita con
 * el de registro: le basta un enlace que se encuentre.
 */
export default function AccionesDeRegistro({ textoRegistro, fondo }: Props) {
  return (
    <>
      <Link to="/registro" className="w-full sm:w-auto">
        <Boton variante="vidrio" forma="pildora" className="group h-12 w-full px-6 sm:w-auto">
          {textoRegistro}
          <Icono
            nombre="flecha-diagonal"
            className="ml-1 h-[17px] w-[17px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Boton>
      </Link>
      <Link
        to="/login"
        className={`rounded-control px-1 py-2 text-cuerpo font-medium underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 ${ENLACE_POR_FONDO[fondo]}`}
      >
        Ya tengo cuenta
      </Link>
    </>
  )
}

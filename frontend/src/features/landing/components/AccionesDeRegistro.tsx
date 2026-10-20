import { Link } from 'react-router-dom'

import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import Icono from '@/components/ui/Icono'

interface Props {
  /** El texto del botón principal cambia según dónde está ("Crear cuenta gratis"). */
  textoRegistro: string
  /** Sobre qué fondo va: decide el color del enlace secundario. */
  fondo: 'oscuro' | 'claro'
}

const ENLACE_POR_FONDO = {
  oscuro: 'foco-claro text-white/85 hover:text-white',
  claro: 'foco-anillo text-vidrio-ink hover:text-vidrio-acento',
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
      {/* Un enlace con apariencia de botón, no un <button> dentro de un <a>. */}
      <Link to="/registro" className={clasesDeBoton({ tamano: 'lg', className: 'group w-full sm:w-auto' })}>
        {textoRegistro}
        <Icono
          nombre="flecha-diagonal"
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
      <Link
        to="/login"
        className={`rounded-control px-1 py-2 text-cuerpo font-medium underline-offset-4 transition-colors duration-150 hover:underline ${ENLACE_POR_FONDO[fondo]}`}
      >
        Ya tengo cuenta
      </Link>
    </>
  )
}

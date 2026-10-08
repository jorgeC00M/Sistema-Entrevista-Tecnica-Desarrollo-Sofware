import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import Icono from '@/components/ui/Icono'

interface Props {
  /** El texto del botón principal cambia según dónde está ("Crear cuenta gratis"). */
  textoRegistro: string
}

/**
 * El par "crear cuenta / ya tengo cuenta" que cierra el hero y la llamada final.
 *
 * Solo los botones: el contenedor —márgenes, dirección, centrado— queda en cada
 * sección, porque es lo único que difiere entre ellas.
 */
export default function AccionesDeRegistro({ textoRegistro }: Props) {
  return (
    <>
      <Link to="/registro" className="w-full sm:w-auto">
        <Boton variante="vidrio-secundario" forma="pildora" className="group h-12 w-full sm:w-auto">
          {textoRegistro}
          <Icono
            nombre="flecha-diagonal"
            className="h-[17px] w-[17px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Boton>
      </Link>
      <Link to="/login" className="w-full sm:w-auto">
        <Boton variante="vidrio-glass" forma="pildora" className="h-12 w-full sm:w-auto">
          Ya tengo cuenta
        </Boton>
      </Link>
    </>
  )
}

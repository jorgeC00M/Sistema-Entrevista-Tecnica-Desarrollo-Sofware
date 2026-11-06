import { Link } from 'react-router-dom'

import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import Tarjeta from '@/components/ui/Tarjeta'
import { tramoDelReloj } from '@/lib/tiempo'
import type { SiguientePaso as Paso } from '@/features/inicio/inicio'

interface Props {
  paso: Paso
}

/**
 * Qué conviene hacer ahora: una frase y un botón. Siempre está. El caso lo
 * decide `inicio.ts::siguientePaso`; aquí solo se pinta. Con una entrevista en
 * curso en sus últimos 5 minutos, la tarjeta toma el ámbar del reloj del chat.
 *
 * El botón es un `Link` con las clases de `Boton`: envolver un `Boton` en un
 * `Link` anidaría un botón dentro de un enlace.
 */
export default function SiguientePaso({ paso }: Props) {
  const avisa = paso.tipo === 'continuar' && tramoDelReloj(paso.segundos) !== 'normal'

  const contenido = (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className={`text-label-mono uppercase ${avisa ? 'text-progreso-texto' : 'text-vidrio-muted'}`}>
          Tu siguiente paso
        </h2>
        <p className={`text-cuerpo font-medium ${avisa ? 'text-progreso-texto' : 'text-vidrio-ink'}`}>{paso.frase}</p>
      </div>
      <Link to={paso.ruta} className={clasesDeBoton({ tamano: 'sm', className: 'shrink-0' })}>
        {paso.accion}
      </Link>
    </>
  )
  const disposicion = 'flex flex-wrap items-center justify-between gap-4 p-5'

  // En aviso, un panel ámbar propio: el vidrio de `Tarjeta` ya fija su fondo.
  return avisa ? (
    <section className={`rounded-vidrio bg-progreso-fondo ${disposicion}`}>{contenido}</section>
  ) : (
    <Tarjeta como="section" className={disposicion}>
      {contenido}
    </Tarjeta>
  )
}

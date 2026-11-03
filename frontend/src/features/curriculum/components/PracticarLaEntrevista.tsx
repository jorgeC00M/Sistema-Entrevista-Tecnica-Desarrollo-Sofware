import { Link } from 'react-router-dom'

import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import { destinoDePractica } from '@/features/curriculum/practica'
import type { RevisionIA } from '@/types/curriculum'

/**
 * El cierre del Resumen: el paso a practicar la entrevista.
 *
 * Es lo que une el módulo de CV con el de entrevistas. Lo único que pasa de un
 * módulo al otro es el puesto, preseleccionado por la URL; la entrevista
 * simulada sigue su plan fijo por puesto, que es lo que la hace reproducible.
 *
 * La revisión con IA también trae preguntas probables (`revision.preguntas`),
 * pero no se muestran: se quitaron de la pantalla por decisión del usuario.
 * Dejar de pedirlas a la IA sería otro cambio, porque toca el prompt.
 */
export default function PracticarLaEntrevista({ revision }: { revision: RevisionIA | null }) {
  return (
    <section
      aria-label="Practicar la entrevista"
      className="flex flex-col items-start gap-2 border-t border-vidrio-linea pt-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-vidrio-texto">
        {revision?.puesto_sugerido
          ? 'Practica la entrevista técnica del puesto que mejor encaja con tu CV.'
          : 'Con el CV listo, el siguiente paso es practicar la entrevista técnica.'}
      </p>
      {/* Un enlace con las clases de `Boton` (`clasesDeBoton`): envolver un
          `Boton` en un `Link` anidaría un botón dentro de un enlace. */}
      <Link to={destinoDePractica(revision)} className={clasesDeBoton({ tamano: 'sm', className: 'shrink-0' })}>
        Practicar la entrevista
      </Link>
    </section>
  )
}

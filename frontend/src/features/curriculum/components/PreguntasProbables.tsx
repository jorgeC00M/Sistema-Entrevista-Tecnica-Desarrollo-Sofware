import { Link } from 'react-router-dom'

import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import { destinoDePractica } from '@/features/curriculum/practica'
import type { RevisionIA } from '@/types/curriculum'

/**
 * Lo que podrían preguntarte, y el paso a practicarlo.
 *
 * Es lo que une el módulo de CV con el de entrevistas. Cada pregunta muestra el
 * fragmento del CV o de la convocatoria que la motiva: el backend descarta las
 * que no se pueden anclar, así que ninguna sale de la nada.
 *
 * Las preguntas **no** alimentan la entrevista simulada, que sigue su plan fijo
 * por puesto —eso es lo que la hace reproducible—. Lo único que pasa de un módulo
 * al otro es el puesto, preseleccionado por la URL.
 *
 * Sin revisión (la IA no respondió o se omitió) queda solo el enlace a practicar:
 * es el mismo paso que antes ocupaba un bloque fijo al final de la página.
 */
export default function PreguntasProbables({ revision }: { revision: RevisionIA | null }) {
  const preguntas = revision?.preguntas ?? []
  const puesto = revision?.puesto_sugerido
  const destino = destinoDePractica(revision)

  return (
    <Tarjeta como="section" className="p-5">
      {preguntas.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
              Lo que podrían preguntarte
            </h2>
            <EtiquetaMono tono="marca">Sugerencia de IA</EtiquetaMono>
          </div>
          <ol className="mt-3 space-y-3">
            {preguntas.map(({ pregunta, motivo }) => (
              <li key={pregunta} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-vidrio-acento">
                  <Icono nombre="respuesta" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-vidrio-ink">{pregunta}</p>
                  <p className="mt-0.5 text-xs text-vidrio-muted">
                    Por lo que dice tu CV: <span className="italic">«{motivo}»</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      <div
        className={`flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between ${
          preguntas.length > 0 ? 'mt-5 border-t border-vidrio-linea pt-4' : ''
        }`}
      >
        <p className="text-sm text-vidrio-texto">
          {puesto
            ? 'Practica la entrevista técnica del puesto que mejor encaja con tu CV.'
            : 'Con el CV listo, el siguiente paso es practicar la entrevista técnica.'}
        </p>
        {/* Un enlace con las clases de `Boton` (`clasesDeBoton`): envolver un
            `Boton` en un `Link` anidaría un botón dentro de un enlace. */}
        <Link to={destino} className={clasesDeBoton({ className: 'shrink-0' })}>
          Practicar la entrevista
        </Link>
      </div>
    </Tarjeta>
  )
}

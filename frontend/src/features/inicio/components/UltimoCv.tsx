import { Link } from 'react-router-dom'

import EnlaceDeAccion from '@/components/ui/EnlaceDeAccion'
import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import { rutaDelAnalisis, VEREDICTOS } from '@/features/curriculum/hallazgos'
import { destinoDePractica } from '@/features/curriculum/practica'
import type { Puesto } from '@/types/catalogos'
import type { Curriculum, CurriculumEnLista } from '@/types/curriculum'

interface Props {
  fila: CurriculumEnLista
  /** El detalle, por la revisión guardada; `null` si no se pudo traer. */
  detalle: Curriculum | null
  puestos: Puesto[]
}

/**
 * El último análisis de CV: su estado (icono y texto, nunca solo color), los
 * campos que leyó el ATS y, si la revisión ya guardada sugiere un puesto, el
 * acceso a simular esa entrevista. No pide nada a la IA.
 */
export default function UltimoCv({ fila, detalle, puestos }: Props) {
  const veredicto = fila.veredicto ? VEREDICTOS[fila.veredicto] : null
  const revision = detalle?.analisis?.revision_ia ?? null
  const sugerido = revision?.puesto_sugerido
  const nombreSugerido = sugerido ? (puestos.find((p) => p.codigo === sugerido)?.nombre ?? null) : null

  return (
    <Tarjeta como="section" className="flex flex-col gap-3 p-5">
      <h2 className="text-label-mono text-vidrio-muted uppercase">Tu CV</h2>
      <div>
        <p className="truncate font-medium text-vidrio-ink">{fila.nombre_archivo}</p>
        <p className="text-meta text-vidrio-muted">{fila.con_convocatoria ? 'Con oferta' : 'General'}</p>
      </div>
      {veredicto && (
        <p className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${veredicto.clases}`}>
          <Icono nombre={veredicto.icono} className="h-3.5 w-3.5" />
          {veredicto.etiqueta}
        </p>
      )}
      {fila.parseabilidad && <p className="text-sm text-vidrio-texto">{fila.parseabilidad} campos leídos</p>}
      {nombreSugerido && <p className="text-sm text-vidrio-texto">Tu CV apunta a {nombreSugerido}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-3">
        {nombreSugerido && (
          <Link to={destinoDePractica(revision)} className={clasesDeBoton({ tamano: 'sm' })}>
            Simular esa entrevista
          </Link>
        )}
        <EnlaceDeAccion
          to={rutaDelAnalisis(fila.con_convocatoria, fila.id)}
          icono="ojo"
          aria-label={`Ver el análisis de ${fila.nombre_archivo}`}
        >
          Ver análisis
        </EnlaceDeAccion>
      </div>
    </Tarjeta>
  )
}

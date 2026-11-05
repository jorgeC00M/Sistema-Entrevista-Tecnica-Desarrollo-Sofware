import { Link } from 'react-router-dom'

import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import Tarjeta from '@/components/ui/Tarjeta'
import PreguntaDeLaTranscripcion from '@/features/resultados/components/PreguntaDeLaTranscripcion'
import type { Rubrica } from '@/types/catalogos'
import type { Entrevista, Intercambio } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
  intercambios: Intercambio[]
  rubrica: Rubrica | null
}

const MOTIVO: Partial<Record<Entrevista['estado'], string>> = {
  tiempo_agotado: 'Se acabaron los 30 minutos antes de responder todas las preguntas.',
  abandonada: 'La entrevista se cerró antes de responder todas las preguntas.',
}

/**
 * El reporte de una entrevista que no se finalizó (abandonada o con el tiempo
 * agotado): sin nota, banda, veredicto ni plan, porque lo incompleto no se
 * califica —en una entrevista técnica real tampoco hay media nota—. Queda lo
 * que sí sirve para aprender: la transcripción con la retroalimentación de
 * cada respuesta, y volver a intentarlo con el mismo puesto y nivel.
 */
export default function ReporteSinNota({ entrevista, intercambios, rubrica }: Props) {
  const respondidas = intercambios.filter((i) => i.respuesta !== '').length
  const reintento = `/simular-entrevista?${new URLSearchParams({ puesto: entrevista.puesto, nivel: entrevista.nivel })}`

  return (
    <>
      <Tarjeta como="section" className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex max-w-prose flex-col gap-1">
          <h2 className="text-sm font-semibold text-vidrio-ink">
            Respondiste {respondidas} de {entrevista.preguntas_previstas}. Sin nota: la entrevista no se completó.
          </h2>
          {MOTIVO[entrevista.estado] && <p className="text-sm text-vidrio-muted">{MOTIVO[entrevista.estado]}</p>}
        </div>
        {/* Solo preselecciona puesto y nivel: «Simular entrevista» pide confirmar
            antes de empezar. Un `Link` con las clases de `Boton`, no un botón
            dentro de un enlace. */}
        <Link to={reintento} className={clasesDeBoton({ tamano: 'sm', className: 'shrink-0' })}>
          Volver a intentarlo
        </Link>
      </Tarjeta>

      <section aria-labelledby="titulo-transcripcion" className="flex flex-col gap-3">
        <h2 id="titulo-transcripcion" className="font-serif text-headline-sm font-semibold text-vidrio-ink">
          Transcripción
        </h2>
        <ol className="flex flex-col gap-3">
          {intercambios.map((intercambio) => (
            <PreguntaDeLaTranscripcion key={intercambio.numero} intercambio={intercambio} rubrica={rubrica} />
          ))}
        </ol>
      </section>
    </>
  )
}

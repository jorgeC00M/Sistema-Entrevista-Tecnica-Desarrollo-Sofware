import ChipPuntaje from '@/components/ui/ChipPuntaje'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'
import { CRITERIOS_POR_DEFECTO, NIVEL_MAXIMO_POR_DEFECTO } from '@/features/resultados/rubricaPorDefecto'
import type { Rubrica } from '@/types/catalogos'
import type { Entrevista, ResumenEntrevista } from '@/types/entrevista'
import type { CodigoDeCriterio } from '@/types/evaluacion'

interface Props {
  entrevista: Entrevista
  resumen: ResumenEntrevista
  /** Para los nombres de los criterios y el máximo de la escala; puede faltar. */
  rubrica: Rubrica | null
}

function Diferencia({ valor }: { valor: number }) {
  const texto = valor > 0 ? `+${valor}` : `${valor}`
  return (
    <p className="mt-2 text-sm text-vidrio-texto">
      <span className="font-mono-vidrio text-vidrio-ink">{texto}</span>{' '}
      {valor === 0 ? 'puntos: igual que' : 'puntos respecto a'} tu entrevista anterior de este puesto y nivel.
    </p>
  )
}

/**
 * El reporte consolidado: lo que el perfil llama retroalimentación "consolidada
 * en un reporte final".
 *
 * Sustituye al número grande de antes. La nota va en la banda, en palabras y a
 * tamaño de chip; lo que ocupa el espacio es qué hacer después: el criterio y
 * el área a trabajar. Todo llega calculado del servidor; aquí no se recalcula
 * ningún umbral.
 */
export default function ResumenFinal({ entrevista, resumen, rubrica }: Props) {
  const parcial = entrevista.estado === 'abandonada'
  const { criterios } = resumen
  const nivelMaximo = rubrica?.nivel_maximo ?? NIVEL_MAXIMO_POR_DEFECTO
  const nombreDe = (codigo: CodigoDeCriterio) =>
    rubrica?.criterios.find((c) => c.codigo === codigo)?.nombre ??
    CRITERIOS_POR_DEFECTO.find((c) => c.codigo === codigo)?.nombre ??
    codigo

  return (
    <Tarjeta className="mb-6 grid gap-6 p-5 sm:p-6 md:grid-cols-2">
      <section aria-labelledby="resumen-nota">
        <EtiquetaMono tono="suelto">
          <span id="resumen-nota">{parcial ? 'Nota parcial' : 'Calificación general'}</span>
        </EtiquetaMono>
        <p className="text-sm text-vidrio-texto">
          {entrevista.puesto_display} · {entrevista.nivel_display}
          {entrevista.tecnologia_display && <> · {entrevista.tecnologia_display}</>}
        </p>
        <div className="mt-3">
          <ChipPuntaje puntuacion={Math.round(resumen.promedio)} banda={resumen.banda} tamano="md" conEtiqueta />
        </div>
        {parcial && (
          <p className="mt-2 text-meta text-vidrio-muted">
            Sobre {entrevista.preguntas_calificadas} de {entrevista.preguntas_previstas} preguntas: la entrevista
            no se terminó.
          </p>
        )}
        {resumen.comparacion && <Diferencia valor={resumen.comparacion.diferencia} />}

        {criterios && (
          <dl className="mt-5 space-y-3">
            {CRITERIOS_POR_DEFECTO.map(({ codigo }) => {
              const nivel = criterios[codigo]
              return (
                <div key={codigo}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <dt className="text-vidrio-texto">{nombreDe(codigo)}</dt>
                    <dd className="font-mono-vidrio text-vidrio-ink">
                      {nivel.toLocaleString('es-BO', { maximumFractionDigits: 1 })} / {nivelMaximo}
                    </dd>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-vidrio-field" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-vidrio-acento"
                      style={{ width: `${(nivel / nivelMaximo) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </dl>
        )}
        {criterios && resumen.criterios_sobre < entrevista.preguntas_calificadas && (
          <p className="mt-2 text-meta text-vidrio-muted">
            Nivel medio sobre {resumen.criterios_sobre} de {entrevista.preguntas_calificadas} respuestas.
          </p>
        )}
      </section>

      <section aria-labelledby="resumen-prioridad" className="md:border-l md:border-vidrio-linea md:pl-6">
        <h2 id="resumen-prioridad" className="font-serif text-headline-md text-vidrio-ink">
          Prioridad para la próxima
        </h2>
        <p className="mt-2 text-sm text-vidrio-muted">
          Pregunta {resumen.prioridad.numero} · {resumen.prioridad.area_display} · tu nota más baja,{' '}
          <span className="font-mono-vidrio">{resumen.prioridad.puntuacion}</span>
        </p>
        <p className="mt-2 text-sm text-vidrio-texto">{resumen.prioridad.sugerencia}</p>

        {resumen.criterio_mas_debil && (
          <p className="mt-4 text-sm text-vidrio-texto">
            En toda la entrevista, el criterio más bajo fue{' '}
            <strong className="font-medium text-vidrio-ink">{resumen.criterio_mas_debil.nombre}</strong>.
          </p>
        )}
      </section>
    </Tarjeta>
  )
}

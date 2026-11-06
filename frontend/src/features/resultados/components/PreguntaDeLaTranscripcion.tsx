import Icono from '@/components/ui/Icono'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import Tarjeta from '@/components/ui/Tarjeta'
import BurbujaPregunta from '@/components/ui/BurbujaPregunta'
import { operacion } from '@/features/resultados/formula'
import { tieneNota } from '@/features/resultados/reporte'
import { NIVEL_MAXIMO_POR_DEFECTO, NOMBRE_EN_PANTALLA, ORDEN_DE_CRITERIOS } from '@/features/resultados/rubricaPorDefecto'
import { formatearSegundosCompacto } from '@/lib/estados'
import type { Rubrica } from '@/types/catalogos'
import type { Intercambio } from '@/types/entrevista'

interface Props {
  intercambio: Intercambio
  rubrica: Rubrica | null
}

/**
 * Una pregunta de la transcripción: un `<details>` nativo (teclado y lector de
 * pantalla sin código) titulado «Pregunta N: Tema (Puntaje: X/100)». Abierto,
 * muestra la conversación —la pregunta de la IA y tu respuesta, con las mismas
 * burbujas del chat— y el «Análisis IA» de esa respuesta: sus niveles y la
 * cuenta que da su nota en una sola línea, y sus fortalezas, debilidades y
 * sugerencias. Qué significa cada nivel se explica una vez, en el Resumen.
 *
 * En una entrevista no finalizada la evaluación llega sin nota: se muestran
 * fortalezas, debilidades y sugerencias, sin puntaje ni la línea de niveles.
 */
export default function PreguntaDeLaTranscripcion({ intercambio, rubrica }: Props) {
  const { numero, area_display, pregunta, respuesta, evaluacion, tiempo_respuesta } = intercambio
  const conNota = evaluacion && tieneNota(evaluacion) ? evaluacion : null
  const marca = !respuesta ? '(Sin responder)' : conNota ? `(Puntaje: ${conNota.puntuacion}/100)` : null

  return (
    <Tarjeta como="li" className="overflow-hidden">
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 foco-anillo sm:px-5">
          <span className="text-sm font-medium text-vidrio-ink">
            Pregunta {numero}: {area_display}
            {marca && <span className="font-mono-vidrio text-vidrio-muted"> {marca}</span>}
          </span>
          <Icono nombre="abajo" className="h-4 w-4 shrink-0 text-vidrio-muted transition-transform group-open:rotate-180" />
        </summary>

        <div className="flex flex-col gap-4 border-t border-vidrio-linea px-4 py-4 sm:px-5">
          <BurbujaPregunta autor="sistema">{pregunta}</BurbujaPregunta>
          {respuesta ? (
            <BurbujaPregunta autor="usuario">{respuesta}</BurbujaPregunta>
          ) : (
            <p className="text-sm text-vidrio-muted">Esta pregunta quedó sin responder.</p>
          )}

          {evaluacion && (
            <section className="rounded-control border border-vidrio-borde bg-white p-4">
              <h4 className="flex flex-wrap items-center gap-2 text-sm font-semibold text-vidrio-ink">
                <Icono nombre="evaluacion" className="h-4 w-4 shrink-0 text-vidrio-acento" />
                Análisis IA
                {tiempo_respuesta !== null && (
                  <span className="font-mono-vidrio text-meta font-normal text-vidrio-muted">
                    · respondiste en {formatearSegundosCompacto(tiempo_respuesta)}
                  </span>
                )}
              </h4>
              <div className="mt-3 flex flex-col gap-3">
                {/* Las evaluaciones anteriores a la rúbrica por niveles no traen
                    niveles: conservan su nota y se muestran sin esta línea. */}
                {conNota?.niveles && (
                  <p className="text-meta text-vidrio-muted">
                    {ORDEN_DE_CRITERIOS.map(
                      (codigo) =>
                        `${NOMBRE_EN_PANTALLA[codigo]} ${conNota.niveles?.[codigo]}/${rubrica?.nivel_maximo ?? NIVEL_MAXIMO_POR_DEFECTO}`,
                    ).join(' · ')}{' '}
                    <span className="font-mono-vidrio text-vidrio-ink">
                      → {operacion(conNota.niveles, conNota.puntuacion, rubrica)}
                    </span>
                  </p>
                )}
                <dl className="grid gap-3 sm:grid-cols-3">
                  <ListaRetroalimentacion variante="fortalezas" texto={evaluacion.fortalezas} />
                  <ListaRetroalimentacion variante="debilidades" texto={evaluacion.debilidades} />
                  <ListaRetroalimentacion variante="sugerencias" texto={evaluacion.sugerencias} />
                </dl>
              </div>
            </section>
          )}
        </div>
      </details>
    </Tarjeta>
  )
}

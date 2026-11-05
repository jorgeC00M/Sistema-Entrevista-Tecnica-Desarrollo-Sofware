import Tarjeta from '@/components/ui/Tarjeta'
import { formulaGeneral } from '@/features/resultados/formula'
import {
  NIVEL_MAXIMO_POR_DEFECTO,
  NOMBRE_EN_PANTALLA,
  ORDEN_DE_CRITERIOS,
} from '@/features/resultados/rubricaPorDefecto'
import type { Rubrica } from '@/types/catalogos'
import type { Entrevista, ResumenEntrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
  resumen: ResumenEntrevista
  /** Para el máximo de la escala; puede faltar. */
  rubrica: Rubrica | null
}

/**
 * «Desglose de la evaluación»: el nivel medio de cada uno de los tres criterios
 * de la rúbrica, sobre 4, y el único «¿Cómo se calcula?» del reporte: la fórmula
 * y lo que significa cada nivel. La Transcripción solo muestra, por pregunta,
 * sus niveles y su cuenta en una línea. Sin el catálogo no hay descriptores que
 * mostrar, así que el desplegable no aparece.
 */
export default function DesgloseDeLaEvaluacion({ entrevista, resumen, rubrica }: Props) {
  const { criterios } = resumen
  const nivelMaximo = rubrica?.nivel_maximo ?? NIVEL_MAXIMO_POR_DEFECTO

  return (
    <Tarjeta como="section" className="p-5">
      <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
        Desglose de la evaluación
      </h2>
      {criterios ? (
        <>
          <dl className="mt-4 space-y-3">
            {ORDEN_DE_CRITERIOS.map((codigo) => {
              const nivel = criterios[codigo]
              return (
                <div key={codigo}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <dt className="text-vidrio-texto">{NOMBRE_EN_PANTALLA[codigo]}</dt>
                    <dd className="font-mono-vidrio text-vidrio-ink">
                      {nivel.toLocaleString('es-BO', { maximumFractionDigits: 1 })} / {nivelMaximo}
                    </dd>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-vidrio-field" aria-hidden="true">
                    <div className="h-full rounded-full bg-vidrio-acento" style={{ width: `${(nivel / nivelMaximo) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </dl>
          <p className="mt-3 text-meta text-vidrio-muted">
            Nivel medio de 0 a {nivelMaximo} en cada criterio; los tres pesan igual.
            {resumen.criterios_sobre < entrevista.preguntas_calificadas &&
              ` Sobre ${resumen.criterios_sobre} de ${entrevista.preguntas_calificadas} respuestas.`}
          </p>
          {rubrica && (
            <details className="mt-3 text-sm">
              <summary className="foco-anillo w-fit cursor-pointer rounded-chip text-vidrio-acento hover:underline">
                ¿Cómo se calcula?
              </summary>
              <div className="mt-2 flex flex-col gap-3 rounded-control bg-vidrio-field p-3 text-vidrio-texto">
                <p>
                  La nota de cada respuesta es{' '}
                  <span className="font-mono-vidrio text-vidrio-ink">{formulaGeneral(rubrica)}</span>, donde cada n es
                  el nivel de 0 a {rubrica.nivel_maximo} que la IA eligió en un criterio. La IA solo elige los niveles;
                  la nota es esta cuenta.
                </p>
                <div className="grid gap-3 lg:grid-cols-3">
                  {rubrica.criterios.map((criterio) => (
                    <dl key={criterio.codigo}>
                      <dt className="font-medium text-vidrio-ink">{NOMBRE_EN_PANTALLA[criterio.codigo]}</dt>
                      {criterio.descriptores.map((descriptor, nivel) => (
                        <dd key={nivel} className="mt-0.5 text-meta">
                          <span className="font-mono-vidrio text-vidrio-ink">{nivel}:</span> {descriptor}
                        </dd>
                      ))}
                    </dl>
                  ))}
                </div>
              </div>
            </details>
          )}
        </>
      ) : (
        // Evaluaciones anteriores a la rúbrica por niveles: conservan su nota.
        <p className="mt-2 text-sm text-vidrio-muted">Esta entrevista se calificó antes del desglose por criterio.</p>
      )}
    </Tarjeta>
  )
}

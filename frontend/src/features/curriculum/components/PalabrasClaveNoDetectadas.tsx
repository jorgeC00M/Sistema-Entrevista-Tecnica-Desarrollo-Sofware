import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import ChipDeRequisito from '@/features/curriculum/components/ChipDeRequisito'
import SugerenciaIA from '@/features/curriculum/components/SugerenciaIA'
import { requisitosPorEstado } from '@/features/curriculum/requisitos'
import type { Brecha, SugerenciaDeRequisito } from '@/types/curriculum'

interface Props {
  brecha: Brecha
  /** De la revisión con IA, por término. */
  sugerencias: Record<string, SugerenciaDeRequisito>
}

/**
 * Lo que vale mientras la IA no respondió (o si falló, o es de una revisión
 * anterior): sale del estado medido, así que no lleva rótulo de IA.
 */
const PAUTA_MUESTRALO = 'Escríbelo dentro de un logro de tu experiencia o un proyecto, con qué hiciste y qué lograste.'
const PAUTA_APRENDELO = 'Hazlo en un proyecto propio, un curso o una certificación, y entonces agrégalo.'

/**
 * «Palabras clave no detectadas», en «Plan de Mejora» del dirigido: una sección
 * por cada requisito que el CV no escribe, primero los obligatorios, cada una
 * con dos caminos lado a lado (apilados por debajo de 640 px).
 *
 * Los dos caminos están siempre: nunca se ofrece agregar una tecnología sin
 * respaldo como única salida, porque eso se descubre en la entrevista técnica. Lo que está
 * solo en la lista de habilidades no va aquí: ya coincide, y su consejo («menciónalo
 * en un logro») está en «Match con la Oferta».
 */
export default function PalabrasClaveNoDetectadas({ brecha, sugerencias }: Props) {
  const { noDetectados } = requisitosPorEstado(brecha)

  return (
    <Tarjeta como="section" className="p-5">
      <h3 className="font-serif text-headline-md font-semibold text-vidrio-ink">Palabras clave no detectadas</h3>
      <p className="mt-1 text-sm text-vidrio-texto">
        Dos caminos según tu caso. Agregar algo que no usaste se descubre en la entrevista técnica.
      </p>

      {noDetectados.length === 0 ? (
        <p className="mt-4 flex items-center gap-3 text-sm text-exito-texto">
          <Icono nombre="fortaleza" className="h-5 w-5 shrink-0" />
          No hay palabras clave sin detectar
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-vidrio-linea">
          {noDetectados.map(({ requisito, tipo }) => {
            const sugerencia = sugerencias[requisito.termino]
            return (
              <li key={requisito.termino} className="py-4 first:pt-0 last:pb-0">
                <section aria-label={requisito.termino} className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ChipDeRequisito requisito={requisito} />
                    {tipo && <span className="text-meta text-vidrio-muted">{tipo}</span>}
                    {tipo === 'deseable' && (
                      <span className="text-meta text-vidrio-muted">· Prioriza primero las obligatorias</span>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-control border border-vidrio-linea p-3">
                      <h4 className="text-sm font-semibold text-vidrio-ink">Si ya lo usaste: muéstralo</h4>
                      {sugerencia?.muestralo ? (
                        <SugerenciaIA>
                          {sugerencia.muestralo}
                          {sugerencia.ejemplo && (
                            <span className="mt-1 block text-vidrio-texto">
                              Ejemplo: <span className="font-mono-vidrio">{sugerencia.ejemplo}</span>
                            </span>
                          )}
                        </SugerenciaIA>
                      ) : (
                        <p className="mt-1.5 text-sm text-vidrio-texto">{PAUTA_MUESTRALO}</p>
                      )}
                    </div>
                    <div className="rounded-control border border-vidrio-linea p-3">
                      <h4 className="text-sm font-semibold text-vidrio-ink">Si aún no: apréndelo</h4>
                      {sugerencia?.aprendelo ? (
                        <SugerenciaIA>{sugerencia.aprendelo}</SugerenciaIA>
                      ) : (
                        <p className="mt-1.5 text-sm text-vidrio-texto">{PAUTA_APRENDELO}</p>
                      )}
                    </div>
                  </div>
                </section>
              </li>
            )
          })}
        </ul>
      )}
    </Tarjeta>
  )
}

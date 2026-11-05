import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import ChipDeRequisito from '@/features/curriculum/components/ChipDeRequisito'
import { requisitosPorEstado } from '@/features/curriculum/requisitos'
import type { Brecha } from '@/types/curriculum'

/**
 * «Requisitos de la oferta», el panel al lado de «Formato» en el banner del
 * Resumen dirigido: «No se detectó:» una sola vez y, debajo, una fila por cada
 * requisito que no está escrito en el CV, primero los obligatorios.
 *
 * No cambia el estado del banner, que mide solo lo que el ATS extrae: un CV bien
 * leído puede tener requisitos sin detectar, y son dos preguntas distintas. El
 * detalle de lo que sí coincide está en «Match con la Oferta».
 */
export default function RequisitosNoDetectados({ brecha }: { brecha: Brecha }) {
  const { noDetectados } = requisitosPorEstado(brecha)

  return (
    <Tarjeta como="section" className="min-w-0 p-5">
      <h4 className="font-serif text-headline-md font-semibold text-vidrio-ink">Requisitos de la oferta</h4>
      {noDetectados.length === 0 ? (
        <p className="mt-1 flex items-center gap-2 text-sm text-exito-texto">
          <Icono nombre="fortaleza" className="h-4 w-4 shrink-0" />
          Se detectaron todos los requisitos de la oferta
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-vidrio-texto">No se detectó:</p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {noDetectados.map(({ requisito, tipo }) => (
              <li key={requisito.termino} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <ChipDeRequisito requisito={requisito} />
                {tipo && <span className="text-meta text-vidrio-muted">{tipo}</span>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-meta text-vidrio-muted">
            “No se detectó” indica que no está escrito en tu CV, no que no lo sepas.
          </p>
        </>
      )}
    </Tarjeta>
  )
}

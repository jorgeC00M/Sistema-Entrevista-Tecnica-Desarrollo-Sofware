import type { ReactNode } from 'react'

import Icono, { type NombreDeIcono } from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import ChipDeRequisito from '@/features/curriculum/components/ChipDeRequisito'
import { NOTA_DE_DONDE, requisitosPorEstado, type RequisitoConTipo } from '@/features/curriculum/requisitos'
import type { Brecha } from '@/types/curriculum'

function Columna({
  titulo,
  icono,
  color,
  requisitos,
  vacio,
  pie,
}: {
  titulo: string
  icono: NombreDeIcono
  color: string
  requisitos: RequisitoConTipo[]
  vacio: string
  pie?: ReactNode
}) {
  return (
    <Tarjeta como="section" className="flex flex-col gap-3 p-5">
      <h3 className="flex items-center gap-2 font-serif text-headline-md font-semibold text-vidrio-ink">
        <Icono nombre={icono} className={`h-5 w-5 shrink-0 ${color}`} />
        {titulo}
      </h3>
      {requisitos.length === 0 ? (
        <p className="text-sm text-vidrio-muted">{vacio}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-vidrio-linea">
          {requisitos.map(({ requisito, tipo }) => (
            <li key={requisito.termino} className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <ChipDeRequisito requisito={requisito} />
                {tipo && <span className="text-meta text-vidrio-muted">{tipo}</span>}
              </div>
              {requisito.estado !== 'ausente' && (
                <p className="text-meta text-vidrio-texto">{NOTA_DE_DONDE[requisito.estado]}</p>
              )}
            </li>
          ))}
        </ul>
      )}
      {pie && <p className="mt-auto border-t border-vidrio-linea pt-3 text-meta text-vidrio-muted">{pie}</p>}
    </Tarjeta>
  )
}

/**
 * Lo primero de «Match con la Oferta»: lo que el CV y el aviso tienen en común y
 * lo que el aviso pide y el CV no escribe, en dos tarjetas lado a lado desde
 * 1024 px (una debajo de la otra por debajo).
 *
 * «Coinciden» junta lo demostrado, lo que solo está en la lista de habilidades y
 * lo que aparece sin secciones reconocidas: cada fila dice dónde aparece, y el
 * ícono del chip y su texto oculto dicen el estado, nunca solo el color. «No
 * detectados en tu CV» —no «Faltan»— porque el análisis solo sabe qué está
 * escrito, no qué domina la persona. Los obligatorios van primero en cada una.
 */
export default function ColumnasDeMatch({ brecha }: { brecha: Brecha }) {
  const { coinciden, noDetectados } = requisitosPorEstado(brecha)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Columna
        titulo="Coinciden"
        icono="fortaleza"
        color="text-exito-texto"
        requisitos={coinciden}
        vacio="Ningún requisito de la oferta aparece en tu CV."
      />
      <Columna
        titulo="No detectados en tu CV"
        icono="cerrar"
        color="text-error-texto"
        requisitos={noDetectados}
        vacio="Todos los requisitos de la oferta aparecen en tu CV."
        pie="No detectado no significa que no lo domines: solo que no está escrito en tu CV."
      />
    </div>
  )
}

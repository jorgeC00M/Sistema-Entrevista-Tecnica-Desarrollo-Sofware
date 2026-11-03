import type { ReactNode } from 'react'

import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import {
  ASPECTO_DE_EXPERIENCIA,
  ASPECTO_DE_FILTRO,
  ASPECTO_POR_ESTADO,
  ETIQUETA_DE_FILTRO,
  ETIQUETA_DE_EXPERIENCIA,
  NOTA_DE_CARGO,
  type Aspecto,
} from '@/features/curriculum/aspectos'
import SugerenciaIA from '@/features/curriculum/components/SugerenciaIA'
import type { Brecha, Filtro, SugerenciaDeRequisito } from '@/types/curriculum'

/** Clave de la sugerencia del requisito de años, la misma que usa el backend. */
const CLAVE_DE_EXPERIENCIA = 'experiencia'

interface Props {
  brecha: Brecha
  /** De la revisión con IA, por término; aquí solo se leen la experiencia y el cargo. */
  sugerencias: Record<string, SugerenciaDeRequisito>
}

const ETIQUETA_DE_TIPO: Record<Filtro['tipo'], string> = {
  titulo: 'Título',
  idioma: 'Idioma',
  ubicacion: 'Ubicación',
}

/** Un requisito del puesto que no es una tecnología: el estado con ícono y color, su texto y, si la hay, la sugerencia. */
function Fila({
  etiqueta,
  aspecto,
  sugerencia,
  children,
}: {
  etiqueta: string
  aspecto: Aspecto
  sugerencia?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-2">
      <dt className="text-vidrio-muted">{etiqueta}:</dt>
      <dd className="flex min-w-0 flex-1 items-start gap-1.5 text-vidrio-texto">
        <Icono nombre={aspecto.icono} className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${aspecto.clases}`} />
        <span className="min-w-0 flex-1">
          {children}
          {sugerencia && <SugerenciaIA>{sugerencia}</SugerenciaIA>}
        </span>
      </dd>
    </div>
  )
}

/**
 * «Requisitos del puesto», al final de «Match con la Oferta»: lo que el aviso
 * exige y no es una tecnología —los años de experiencia, el cargo y los filtros
 * de título, idioma y ubicación—, con su estado y, para la experiencia y el
 * cargo, la sugerencia de IA rotulada. Nada de esto cuenta en la cobertura.
 *
 * Lleva también el aviso de cuando no se reconocieron las secciones, porque
 * entonces las columnas de arriba solo pueden decir si un término aparece, no
 * dónde. Sin nada de eso, no se muestra.
 */
export default function RequisitosDelPuesto({ brecha, sugerencias }: Props) {
  const { experiencia, cargo } = brecha
  const filtros = brecha.filtros ?? []
  const conFilas = Boolean(experiencia || cargo || filtros.length > 0)
  if (!conFilas && brecha.con_evidencia) return null

  return (
    <Tarjeta como="section" className="flex flex-col gap-3 p-5">
      <h3 className="font-serif text-headline-md font-semibold text-vidrio-ink">Requisitos del puesto</h3>

      {!brecha.con_evidencia && (
        // Encadena con `secciones_no_reconocidas`: una debilidad de formato
        // degrada el análisis de contenido, y decirlo es más honesto que mostrar
        // un mapa a medias sin explicación.
        <p className="text-sm text-progreso-texto">
          No se pudo precisar <em>dónde</em> evidencias cada requisito, porque no se reconocieron
          las secciones de tu CV. Corrige los títulos y vuelve a analizarlo para ver el detalle.
        </p>
      )}

      {conFilas && (
        <dl className="flex flex-col gap-1.5 text-sm">
          {experiencia && (
            <Fila
              etiqueta="Experiencia"
              aspecto={ASPECTO_DE_EXPERIENCIA[experiencia.estado]}
              sugerencia={sugerencias[CLAVE_DE_EXPERIENCIA]?.sugerencia}
            >
              {ETIQUETA_DE_EXPERIENCIA[experiencia.estado]} · pide {experiencia.requeridos}{' '}
              {experiencia.requeridos === 1 ? 'año' : 'años'}
              {experiencia.estado !== 'no_calculable' && `, el ATS calcula ${experiencia.calculados}`}
              {/* No se aconseja cambiar la experiencia para alcanzar el mínimo:
                  se avisa de que el cálculo puede quedarse corto por las fechas. */}
              {experiencia.posible_subestimacion && experiencia.estado !== 'cumple' && (
                <span className="block text-xs text-vidrio-muted">
                  Puede estar contando menos de la que tienes: escribe todas tus fechas como «Mes Año».
                </span>
              )}
            </Fila>
          )}
          {cargo && (
            <Fila
              etiqueta="Cargo"
              aspecto={ASPECTO_POR_ESTADO[cargo.estado]}
              sugerencia={sugerencias[cargo.termino]?.sugerencia}
            >
              {cargo.termino}: {NOTA_DE_CARGO[cargo.estado]}
            </Fila>
          )}
          {filtros.map((filtro) => (
            <Fila
              key={`${filtro.tipo}-${filtro.pedido}`}
              etiqueta={ETIQUETA_DE_TIPO[filtro.tipo]}
              aspecto={ASPECTO_DE_FILTRO[filtro.estado]}
            >
              {filtro.pedido}: {ETIQUETA_DE_FILTRO[filtro.estado].toLowerCase()}
              {filtro.nota && <span className="block text-xs text-vidrio-muted">{filtro.nota}</span>}
            </Fila>
          ))}
        </dl>
      )}
    </Tarjeta>
  )
}

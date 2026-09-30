import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import ChipPuntaje from '@/components/ui/ChipPuntaje'
import ControlSegmentado from '@/components/ui/ControlSegmentado'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import Tarjeta from '@/components/ui/Tarjeta'
import { obtenerNivel } from '@/lib/puntajes'
import type { NivelDePuntaje } from '@/lib/puntajes'
import type { Observacion } from '@/types/evaluacion'

interface Props {
  observaciones: Observacion[]
}

/**
 * Qué muestra cada filtro, en términos de los niveles de `lib/puntajes`.
 *
 * El corte "por mejorar" agrupa `insuficiente` y `en_desarrollo`: esa
 * correspondencia ya la resuelve `obtenerNivel`, así que no se repite aquí la
 * lista de bandas — si los cortes de la rúbrica cambian en el backend, este
 * filtro los sigue sin tocarse.
 */
const FILTROS = {
  todas: { etiqueta: 'Todas', incluye: (_nivel: NivelDePuntaje) => true },
  mejorar: {
    etiqueta: 'Por mejorar',
    incluye: (nivel: NivelDePuntaje) => nivel === 'error',
  },
  solidas: {
    etiqueta: 'Sólidas',
    incluye: (nivel: NivelDePuntaje) => nivel === 'exito',
  },
} as const

type ClaveDeFiltro = keyof typeof FILTROS

interface GrupoDeArea {
  area: string
  areaDisplay: string
  observaciones: Observacion[]
}

/**
 * Las observaciones acumuladas, agrupadas por área técnica.
 *
 * Antes era una única lista cronológica de hasta 20 tarjetas. Con tres o
 * cuatro entrevistas eso es scroll puro, y además contradice el propósito de
 * la pantalla: detectar lo que se repite es comparar dentro de un mismo tema,
 * no recorrer la historia en orden inverso. Dentro de cada área sí se
 * conserva el orden de más reciente a más antigua.
 */
export default function ListaObservaciones({ observaciones }: Props) {
  const [filtro, setFiltro] = useState<ClaveDeFiltro>('todas')

  const grupos = useMemo<GrupoDeArea[]>(() => {
    const visibles = observaciones.filter((o) => FILTROS[filtro].incluye(obtenerNivel(o.banda)))

    // El backend ya entrega las observaciones ordenadas, así que respetar el
    // orden de aparición basta para que las áreas más recientes salgan antes.
    const porArea = new Map<string, GrupoDeArea>()
    for (const o of visibles) {
      const grupo = porArea.get(o.area)
      if (grupo) grupo.observaciones.push(o)
      else porArea.set(o.area, { area: o.area, areaDisplay: o.area_display, observaciones: [o] })
    }
    return [...porArea.values()]
  }, [observaciones, filtro])

  if (observaciones.length === 0) return null

  return (
    <div>
      <h2 className="text-headline-sm font-semibold text-vidrio-ink">Lo que te han señalado</h2>
      <p className="mt-1 text-body-sm text-vidrio-texto">
        Agrupado por área, incluidas las entrevistas que dejaste a medias.
      </p>

      <ControlSegmentado
        className="mt-4"
        etiqueta="Filtrar por desempeño"
        opciones={Object.entries(FILTROS).map(([valor, { etiqueta }]) => ({ valor, etiqueta }))}
        seleccionado={filtro}
        onSeleccionar={(valor) => setFiltro(valor as ClaveDeFiltro)}
      />

      {grupos.length === 0 ? (
        <p className="mt-4 rounded-vidrio bg-vidrio-field px-4 py-3 text-center text-sm text-vidrio-muted">
          Ninguna de tus respuestas cayó en este rango todavía.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          {grupos.map((grupo) => (
            <section key={grupo.area}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-semibold text-vidrio-ink">{grupo.areaDisplay}</h3>
                <span className="text-body-sm text-vidrio-muted">
                  {grupo.observaciones.length} respuesta
                  {grupo.observaciones.length === 1 ? '' : 's'}
                </span>
              </div>

              <ul className="space-y-3">
                {grupo.observaciones.map((o) => (
                  <Tarjeta como="li" key={`${o.entrevista_id}-${o.numero}`} className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <EtiquetaMono tono="suelto">
                        Pregunta {String(o.numero).padStart(2, '0')} ·{' '}
                        {new Date(o.fecha).toLocaleDateString('es-BO')}
                      </EtiquetaMono>
                      <ChipPuntaje puntuacion={o.puntuacion} banda={o.banda} conEtiqueta />
                    </div>

                    <p className="mt-2 text-sm font-medium text-vidrio-ink">{o.pregunta}</p>

                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      <ListaRetroalimentacion variante="debilidades" texto={o.debilidades} />
                      <ListaRetroalimentacion variante="sugerencias" texto={o.sugerencias} />
                    </dl>

                    <Link
                      to={`/entrevista/${o.entrevista_id}/resultados`}
                      className="mt-3 inline-block rounded text-xs font-medium text-vidrio-acento underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento"
                    >
                      Ver la entrevista completa
                    </Link>
                  </Tarjeta>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

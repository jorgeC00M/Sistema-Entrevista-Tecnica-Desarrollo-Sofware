import { useLayoutEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import Badge from '@/components/ui/Badge'
import Boton from '@/components/ui/Boton'
import CampoBusqueda from '@/components/ui/CampoBusqueda'
import CampoSelect from '@/components/ui/CampoSelect'
import EstadoVacio from '@/components/ui/EstadoVacio'
import EtiquetaConvocatoria from '@/components/ui/EtiquetaConvocatoria'
import Paginacion from '@/components/ui/Paginacion'
import Tabla, { type ColumnaDeTabla } from '@/components/ui/Tabla'
import Tarjeta from '@/components/ui/Tarjeta'
import type { FiltroDeEstado } from '@/features/historial/historial'
import type { FiltrosDeHistorial } from '@/features/historial/hooks/useFiltrosDeHistorial'
import { TONO_POR_ESTADO } from '@/lib/estados'
import { prefiereMovimientoReducido } from '@/lib/movimiento'
import { recortar } from '@/lib/paginacion'
import type { Entrevista } from '@/types/entrevista'

const POR_PAGINA = 10

interface Props {
  /** La lista ya filtrada y los controles; ver `useFiltrosDeHistorial`. */
  filtros: FiltrosDeHistorial
  /** Los niveles del catálogo para su filtro; `null` mientras no llega (y el filtro no se pinta). */
  niveles: { codigo: string; nombre: string }[] | null
}

function fecha(entrevista: Entrevista): string {
  return new Date(entrevista.fecha_inicio).toLocaleDateString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function Puntuacion({ entrevista }: { entrevista: Entrevista }) {
  if (entrevista.puntuacion_promedio !== null) {
    return (
      <span className="font-mono-vidrio font-semibold text-vidrio-ink">
        {Math.round(entrevista.puntuacion_promedio)}
      </span>
    )
  }
  if (entrevista.puntuacion_parcial !== null) {
    return (
      <span>
        <span className="font-mono-vidrio font-semibold text-vidrio-ink">
          {Math.round(entrevista.puntuacion_parcial)}
        </span>
        <span className="text-meta text-vidrio-muted"> · parcial</span>
      </span>
    )
  }
  return (
    <span className="text-vidrio-muted" aria-label="Sin nota">
      —
    </span>
  )
}

function Accion({ entrevista }: { entrevista: Entrevista }) {
  // Una entrevista a medias se retoma; una terminada lleva a sus resultados.
  const enCurso = entrevista.estado === 'en_progreso'
  const texto = enCurso ? 'Continuar' : 'Ver resultados'
  return (
    <Link
      to={enCurso ? `/entrevista/${entrevista.id}` : `/entrevista/${entrevista.id}/resultados`}
      // Siete "Ver resultados" iguales no le dicen nada a un lector de
      // pantalla: el nombre accesible dice de qué entrevista es.
      aria-label={`${texto}: ${entrevista.puesto_display} del ${fecha(entrevista)}`}
      className="inline-flex items-center gap-1 rounded-control text-sm font-medium whitespace-nowrap text-vidrio-acento hover:underline foco-anillo"
    >
      {texto} <span aria-hidden="true">→</span>
    </Link>
  )
}

const COLUMNAS: ColumnaDeTabla<Entrevista>[] = [
  {
    clave: 'fecha',
    titulo: 'Fecha',
    celda: (e) => <span className="font-mono-vidrio whitespace-nowrap text-vidrio-texto">{fecha(e)}</span>,
  },
  {
    clave: 'puesto',
    titulo: 'Puesto',
    celda: (e) => (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-medium break-words text-vidrio-ink">{e.puesto_display}</span>
        {e.desde_convocatoria && <EtiquetaConvocatoria>Convocatoria</EtiquetaConvocatoria>}
      </span>
    ),
  },
  { clave: 'tecnologia', titulo: 'Tecnología', celda: (e) => e.tecnologia_display ?? '—' },
  { clave: 'nivel', titulo: 'Nivel', celda: (e) => e.nivel_display },
  { clave: 'puntuacion', titulo: 'Puntuación', celda: (e) => <Puntuacion entrevista={e} /> },
  {
    clave: 'estado',
    titulo: 'Estado',
    celda: (e) => <Badge tono={TONO_POR_ESTADO[e.estado]}>{e.estado_display}</Badge>,
  },
  { clave: 'accion', titulo: 'Acción', alinear: 'fin', celda: (e) => <Accion entrevista={e} /> },
]

function TarjetaDeEntrevista({ entrevista }: { entrevista: Entrevista }) {
  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium break-words text-vidrio-ink">
        <span>
          {entrevista.puesto_display}
          {entrevista.tecnologia_display && <> · {entrevista.tecnologia_display}</>}
        </span>
        {entrevista.desde_convocatoria && <EtiquetaConvocatoria>Convocatoria</EtiquetaConvocatoria>}
      </p>
      <p className="text-meta text-vidrio-muted">
        {entrevista.nivel_display} · {fecha(entrevista)}
      </p>
      <div className="flex items-center gap-3 text-sm">
        <Puntuacion entrevista={entrevista} />
        <Badge tono={TONO_POR_ESTADO[entrevista.estado]}>{entrevista.estado_display}</Badge>
        <span className="ml-auto">
          <Accion entrevista={entrevista} />
        </span>
      </div>
    </div>
  )
}

/** Las opciones del filtro de estado, en el orden en que se piensan. */
const OPCIONES_DE_ESTADO: { valor: FiltroDeEstado; etiqueta: string }[] = [
  { valor: 'todos', etiqueta: 'Todos los estados' },
  { valor: 'finalizada', etiqueta: 'Finalizada' },
  { valor: 'en_progreso', etiqueta: 'En curso' },
  { valor: 'abandonada', etiqueta: 'Abandonada' },
]

/**
 * "Tus entrevistas": buscador, filtros de estado y nivel, y diez filas por página.
 *
 * Recibe la lista **ya filtrada** y los controles de `useFiltrosDeHistorial`,
 * que la página comparte con los gráficos: así lo que se dibuja es exactamente
 * lo que se ve aquí. La página actual vive en `?pagina=`; cambiar de página sí
 * apila una entrada en el historial del navegador, para que "atrás" funcione.
 *
 * Filtrar y paginar ocurren en el cliente: la API ya entrega el historial
 * completo, porque el sidebar lo necesita entero para encontrar la entrevista
 * en curso.
 */
export default function TablaDeEntrevistas({ filtros, niveles }: Props) {
  const { filtradas } = filtros
  const [parametros, setParametros] = useSearchParams()
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const pagina = recortar(Number(parametros.get('pagina') ?? 1), totalPaginas)
  const filas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  const inicio = useRef<HTMLDivElement>(null)
  const campoDeBusqueda = useRef<HTMLInputElement>(null)
  // Solo tras un cambio de página pedido aquí: al llegar a la pantalla el foco
  // se queda donde lo deja la navegación.
  const moverFoco = useRef(false)

  useLayoutEffect(() => {
    if (!moverFoco.current) return
    moverFoco.current = false
    inicio.current?.focus({ preventScroll: true })
    inicio.current?.scrollIntoView({ behavior: prefiereMovimientoReducido() ? 'auto' : 'smooth', block: 'start' })
  }, [pagina])

  const cambiarPagina = (nueva: number) => {
    moverFoco.current = true
    setParametros(
      (previos) => {
        const siguientes = new URLSearchParams(previos)
        if (nueva === 1) siguientes.delete('pagina')
        else siguientes.set('pagina', String(nueva))
        return siguientes
      },
      { preventScrollReset: true },
    )
  }

  const limpiar = () => {
    filtros.limpiar()
    campoDeBusqueda.current?.focus()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <CampoBusqueda
            ref={campoDeBusqueda}
            valor={filtros.texto}
            onCambiar={(valor) => filtros.cambiar('q', valor)}
            etiqueta="Buscar en tus entrevistas"
            placeholder="Buscar por puesto, tecnología o nivel"
          />
        </div>
        <div className="sm:w-48">
          <CampoSelect
            id="filtro-estado"
            etiqueta="Estado"
            ocultarEtiqueta
            marcador={null}
            valor={filtros.estado}
            opciones={OPCIONES_DE_ESTADO}
            onCambiar={(valor) => filtros.cambiar('estado', valor)}
          />
        </div>
        {niveles && (
          <div className="sm:w-48">
            <CampoSelect
              id="filtro-nivel"
              etiqueta="Nivel"
              ocultarEtiqueta
              marcador={null}
              valor={filtros.nivel}
              opciones={[
                { valor: 'todos', etiqueta: 'Todos los niveles' },
                ...niveles.map((n) => ({ valor: n.codigo, etiqueta: n.nombre })),
              ]}
              onCambiar={(valor) => filtros.cambiar('nivel', valor)}
            />
          </div>
        )}
      </div>

      {filtradas.length === 0 ? (
        <Tarjeta>
          <EstadoVacio icono="buscar" titulo="Ninguna entrevista coincide con tu búsqueda.">
            <Boton variante="secundario" tamano="sm" onClick={limpiar}>
              Limpiar búsqueda
            </Boton>
          </EstadoVacio>
        </Tarjeta>
      ) : (
        <>
          <Tabla
            titulo="Tus entrevistas"
            columnas={COLUMNAS}
            filas={filas}
            claveDeFila={(e) => e.id}
            tarjeta={(e) => <TarjetaDeEntrevista entrevista={e} />}
            refInicio={inicio}
          />
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            onCambiar={cambiarPagina}
          />
        </>
      )}
    </div>
  )
}

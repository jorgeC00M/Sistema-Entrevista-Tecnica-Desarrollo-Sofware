import EnlaceDeAccion from '@/components/ui/EnlaceDeAccion'
import EtiquetaConvocatoria from '@/components/ui/EtiquetaConvocatoria'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Paginacion from '@/components/ui/Paginacion'
import Tabla, { type ColumnaDeTabla } from '@/components/ui/Tabla'
import { VEREDICTOS, tipoDeRevision } from '@/features/curriculum/hallazgos'
import { usePaginaEnLaUrl } from '@/hooks/usePaginaEnLaUrl'
import { fechaLegible } from '@/lib/fechas'
import type { CurriculumEnLista } from '@/types/curriculum'

// La mitad que en «Tus entrevistas»: aquí la tabla va debajo del formulario y
// diez filas la alargaban hasta perder de vista la entrada.
const POR_PAGINA = 5

interface Props {
  analisis: CurriculumEnLista[]
  cargando: boolean
}

function Tipo({ fila }: { fila: CurriculumEnLista }) {
  // El tipo con el mismo nombre que en la barra del resultado.
  return fila.con_convocatoria ? (
    <EtiquetaConvocatoria>{tipoDeRevision(true)}</EtiquetaConvocatoria>
  ) : (
    <EtiquetaMono>{tipoDeRevision(false)}</EtiquetaMono>
  )
}

/** El veredicto del Resumen en palabras, con icono: nunca color solo, nunca un número. */
function Estado({ fila }: { fila: CurriculumEnLista }) {
  if (!fila.veredicto) return <span className="text-vidrio-muted">—</span>
  const aspecto = VEREDICTOS[fila.veredicto]
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium whitespace-nowrap ${aspecto.tono}`}>
      <Icono nombre={aspecto.icono} className="h-4 w-4 shrink-0" />
      {aspecto.etiqueta}
    </span>
  )
}

function Ver({ fila }: { fila: CurriculumEnLista }) {
  return (
    <EnlaceDeAccion
      to={`/mi-cv/${fila.id}`}
      icono="ojo"
      aria-label={`Ver el análisis de ${fila.nombre_archivo} del ${fechaLegible(fila.fecha)}`}
    >
      Ver
    </EnlaceDeAccion>
  )
}

const COLUMNAS: ColumnaDeTabla<CurriculumEnLista>[] = [
  {
    clave: 'fecha',
    titulo: 'Fecha',
    celda: (fila) => <span className="font-mono-vidrio whitespace-nowrap text-vidrio-texto">{fechaLegible(fila.fecha)}</span>,
  },
  {
    clave: 'archivo',
    titulo: 'Archivo CV',
    celda: (fila) => (
      <span title={fila.nombre_archivo} className="block max-w-56 truncate font-mono-vidrio text-vidrio-ink">
        {fila.nombre_archivo}
      </span>
    ),
  },
  { clave: 'tipo', titulo: 'Tipo de análisis', celda: (fila) => <Tipo fila={fila} /> },
  { clave: 'estado', titulo: 'Estado del CV', celda: (fila) => <Estado fila={fila} /> },
  {
    clave: 'campos',
    titulo: 'Campos leídos',
    alinear: 'fin',
    celda: (fila) => <span className="font-mono-vidrio text-vidrio-texto">{fila.parseabilidad ?? '—'}</span>,
  },
  { clave: 'accion', titulo: 'Acción', alinear: 'fin', celda: (fila) => <Ver fila={fila} /> },
]

function TarjetaDeAnalisis({ fila }: { fila: CurriculumEnLista }) {
  return (
    <div className="space-y-2">
      <p title={fila.nombre_archivo} className="truncate font-mono-vidrio text-sm text-vidrio-ink">
        {fila.nombre_archivo}
      </p>
      <p className="flex flex-wrap items-center gap-2 text-meta text-vidrio-muted">
        {fechaLegible(fila.fecha)}
        <Tipo fila={fila} />
      </p>
      <div className="flex items-center gap-3 text-sm">
        <Estado fila={fila} />
        {fila.parseabilidad && (
          <span className="font-mono-vidrio text-vidrio-texto">{fila.parseabilidad} campos</span>
        )}
        <span className="ml-auto">
          <Ver fila={fila} />
        </span>
      </div>
    </div>
  )
}

/**
 * Los análisis que el usuario ya hizo, para que pueda ver si su CV mejoró: una
 * tabla del más reciente al más antiguo, de cinco en cinco (`?pagina=`), que por
 * debajo de 640 px pinta cada fila como tarjeta.
 *
 * Sin esto cada análisis se perdía al recargar, y el módulo existe justamente para
 * corregir el documento y volver a medirlo: faltaba la mitad del ciclo.
 *
 * **No se publica ninguna diferencia entre análisis** ("+2 campos desde la última
 * vez"). Dos filas pueden tener convocatorias distintas, así que la resta entre
 * sus resultados no significaría nada — el mismo error que el módulo ya evita al
 * no publicar un puntaje de compatibilidad. Las filas ordenadas con su propio
 * resultado dejan la comparación a la vista sin afirmar nada que no se sostenga.
 *
 * Si la lista está vacía no se renderiza nada. Una tarjeta que diga "aún no has
 * analizado ningún CV" en la pantalla donde vas a analizar el primero es ruido.
 */
export default function HistorialDeAnalisis({ analisis, cargando }: Props) {
  const { pagina, totalPaginas, filas, refInicio, cambiarPagina } = usePaginaEnLaUrl(analisis, POR_PAGINA)

  // Mientras carga tampoco se muestra nada: un esqueleto por una lista que suele
  // tener dos o tres filas parpadearía más de lo que informa.
  if (cargando || analisis.length === 0) return null

  return (
    <section aria-labelledby="titulo-historial-cv" className="space-y-3">
      <h2 id="titulo-historial-cv" className="text-headline-sm font-semibold text-vidrio-ink">
        Historial de análisis
      </h2>
      <Tabla
        titulo="Historial de análisis de tu CV"
        columnas={COLUMNAS}
        filas={filas}
        claveDeFila={(fila) => fila.id}
        tarjeta={(fila) => <TarjetaDeAnalisis fila={fila} />}
        refInicio={refInicio}
      />
      <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={cambiarPagina} />
    </section>
  )
}

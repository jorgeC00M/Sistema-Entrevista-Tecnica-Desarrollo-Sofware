import { Link } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import EstadoVacio from '@/components/ui/EstadoVacio'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Spinner from '@/components/ui/Spinner'
import ComparativaAreas from '@/features/historial/components/ComparativaAreas'
import GraficoProgreso from '@/features/historial/components/GraficoProgreso'
import ListaEntrevistas from '@/features/historial/components/ListaEntrevistas'
import { useHistorial } from '@/features/historial/hooks/useHistorial'

export default function HistorialPage() {
  const { entrevistas, estadisticas, cargando, error } = useHistorial()

  if (error) return <Alerta>{error}</Alerta>
  if (cargando || !entrevistas || !estadisticas)
    return <Spinner texto="Cargando tu historial…" />

  if (entrevistas.length === 0) {
    return (
      <EstadoVacio icono="historial" titulo="Todavía no realizaste ninguna entrevista.">
        <Link to="/nueva-entrevista" className="font-medium text-vidrio-acento hover:underline">
          Empieza la primera
        </Link>
      </EstadoVacio>
    )
  }

  const completadas = estadisticas.entrevistas_completadas

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <EtiquetaMono tono="suelto">
          {entrevistas.length} entrevista{entrevistas.length === 1 ? '' : 's'} registrada
          {entrevistas.length === 1 ? '' : 's'}
        </EtiquetaMono>
        <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">
          Historial y progreso
        </h1>
        {completadas > 0 && estadisticas.promedio_general !== null ? (
          <p className="text-base text-vidrio-texto">
            {completadas} entrevista{completadas === 1 ? '' : 's'} completada
            {completadas === 1 ? '' : 's'} · promedio general{' '}
            <span className="font-mono-vidrio text-metric-counter">
              {Math.round(estadisticas.promedio_general)}
            </span>
          </p>
        ) : (
          <p className="text-base text-vidrio-texto">
            Tu progreso aparecerá aquí cuando completes la primera entrevista.
          </p>
        )}
      </div>

      {completadas > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <GraficoProgreso puntos={estadisticas.evolucion} />
          <ComparativaAreas areas={estadisticas.promedio_por_area} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-headline-md font-semibold text-vidrio-ink">Tus entrevistas</h2>
        <ListaEntrevistas entrevistas={entrevistas} />
      </div>
    </div>
  )
}

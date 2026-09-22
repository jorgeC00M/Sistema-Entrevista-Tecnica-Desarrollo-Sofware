import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { obtenerHistorial } from '@/api/entrevistas'
import { obtenerEstadisticas } from '@/api/evaluaciones'
import Alerta from '@/components/ui/Alerta'
import EstadoVacio from '@/components/ui/EstadoVacio'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Spinner from '@/components/ui/Spinner'
import ComparativaAreas from '@/features/historial/components/ComparativaAreas'
import GraficoProgreso from '@/features/historial/components/GraficoProgreso'
import ListaEntrevistas from '@/features/historial/components/ListaEntrevistas'
import type { Entrevista } from '@/types/entrevista'
import type { Estadisticas } from '@/types/evaluacion'

export default function HistorialPage() {
  const [entrevistas, setEntrevistas] = useState<Entrevista[] | null>(null)
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false

    // En paralelo: son dos endpoints independientes y encadenarlos solo
    // duplicaría la espera.
    Promise.all([obtenerHistorial(), obtenerEstadisticas()])
      .then(([historial, stats]) => {
        if (cancelado) return
        setEntrevistas(historial)
        setEstadisticas(stats)
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudo cargar tu historial.')
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  if (error) return <Alerta tipo="error">{error}</Alerta>
  if (!entrevistas || !estadisticas) return <Spinner texto="Cargando tu historial…" />

  if (entrevistas.length === 0) {
    return (
      <EstadoVacio icono="historial" titulo="Todavía no realizaste ninguna entrevista.">
        <Link to="/nueva-entrevista" className="font-medium text-iris-600 hover:underline">
          Empieza la primera
        </Link>
      </EstadoVacio>
    )
  }

  const completadas = estadisticas.entrevistas_completadas

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <EtiquetaMono tono="suelto">
          {entrevistas.length} entrevista{entrevistas.length === 1 ? '' : 's'} registrada
          {entrevistas.length === 1 ? '' : 's'}
        </EtiquetaMono>
        <h1 className="text-headline-xl font-semibold text-tinta-950">Historial y progreso</h1>
        {completadas > 0 && estadisticas.promedio_general !== null ? (
          <p className="text-base text-tinta-500">
            {completadas} entrevista{completadas === 1 ? '' : 's'} completada
            {completadas === 1 ? '' : 's'} · promedio general{' '}
            <span className="font-mono text-metric-counter">
              {Math.round(estadisticas.promedio_general)}
            </span>
          </p>
        ) : (
          <p className="text-base text-tinta-500">
            Tu progreso aparecerá aquí cuando completes la primera entrevista.
          </p>
        )}
      </div>

      {completadas > 0 && (
        <>
          <GraficoProgreso puntos={estadisticas.evolucion} />
          <ComparativaAreas areas={estadisticas.promedio_por_area} />
        </>
      )}

      <div>
        <h2 className="mb-3 text-headline-md font-semibold text-tinta-950">Tus entrevistas</h2>
        <ListaEntrevistas entrevistas={entrevistas} />
      </div>
    </div>
  )
}

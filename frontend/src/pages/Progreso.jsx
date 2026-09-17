import { useEffect, useState } from 'react'
import Alerta from '../components/comunes/Alerta'
import Cargando from '../components/comunes/Cargando'
import ComparativaAreas from '../components/resultados/ComparativaAreas'
import GraficoEvolucion from '../components/resultados/GraficoEvolucion'
import { ErrorAPI } from '../api/cliente'
import { obtenerEstadisticas } from '../api/estadisticas'

export default function Progreso() {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    obtenerEstadisticas()
      .then((res) => {
        if (!cancelado) setDatos(res)
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudo cargar tu progreso.')
        }
      })
    return () => {
      cancelado = true
    }
  }, [])

  if (error) return <Alerta tipo="error">{error}</Alerta>
  if (!datos) return <Cargando texto="Cargando tu progreso…" />

  if (datos.entrevistas_completadas === 0) {
    return (
      <div className="mx-auto max-w-lg text-center text-sm text-slate-500">
        Todavía no completaste ninguna entrevista. Tu progreso aparecerá aquí después de la
        primera.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Tu progreso</h1>
        <p className="text-sm text-slate-500">
          {datos.entrevistas_completadas} entrevista{datos.entrevistas_completadas === 1 ? '' : 's'}{' '}
          completada{datos.entrevistas_completadas === 1 ? '' : 's'} · promedio general{' '}
          {Math.round(datos.promedio_general)}
        </p>
      </div>

      <GraficoEvolucion puntos={datos.evolucion} />
      <ComparativaAreas areas={datos.promedio_por_area} />
    </div>
  )
}

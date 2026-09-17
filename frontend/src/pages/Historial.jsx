import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alerta from '../components/comunes/Alerta'
import Cargando from '../components/comunes/Cargando'
import { ErrorAPI } from '../api/cliente'
import { obtenerHistorial } from '../api/entrevistas'

// Historial básico. El panel de progreso a lo largo del tiempo (comparar
// puntuaciones entre entrevistas de una misma área) es el Incremento 5.
const ESTADO_ESTILO = {
  finalizada: 'bg-emerald-50 text-emerald-700',
  en_progreso: 'bg-amber-50 text-amber-700',
  abandonada: 'bg-slate-100 text-slate-500',
}

export default function Historial() {
  const [entrevistas, setEntrevistas] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    obtenerHistorial()
      .then((datos) => {
        if (!cancelado) setEntrevistas(datos)
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudo cargar el historial.')
        }
      })
    return () => {
      cancelado = true
    }
  }, [])

  if (error) return <Alerta tipo="error">{error}</Alerta>
  if (!entrevistas) return <Cargando texto="Cargando historial…" />

  if (entrevistas.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center text-sm text-slate-500">
        Todavía no completaste ninguna entrevista.{' '}
        <Link to="/" className="font-medium text-indigo-600 hover:underline">
          Empieza la primera
        </Link>
        .
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Historial de entrevistas</h1>
      <div className="space-y-2">
        {entrevistas.map((entrevista) => {
          const destino =
            entrevista.estado === 'en_progreso'
              ? `/entrevista/${entrevista.id}`
              : `/entrevista/${entrevista.id}/resultados`
          return (
            <Link
              key={entrevista.id}
              to={destino}
              className="flex items-center justify-between gap-3 rounded-lg bg-white p-4 ring-1 ring-slate-200 transition hover:ring-indigo-300"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {entrevista.area_display} · {entrevista.nivel_display}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(entrevista.fecha_inicio).toLocaleString('es-BO')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {entrevista.puntuacion_promedio != null && (
                  <span className="text-sm font-semibold text-slate-700">
                    {entrevista.puntuacion_promedio}
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTADO_ESTILO[entrevista.estado]}`}
                >
                  {entrevista.estado_display}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

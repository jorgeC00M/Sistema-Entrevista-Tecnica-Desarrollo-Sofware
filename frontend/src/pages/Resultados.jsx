import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alerta from '../components/comunes/Alerta'
import Boton from '../components/comunes/Boton'
import Cargando from '../components/comunes/Cargando'
import TarjetaEvaluacion from '../components/resultados/TarjetaEvaluacion'
import { ErrorAPI } from '../api/cliente'
import { obtenerResultados } from '../api/entrevistas'

export default function Resultados() {
  const { id } = useParams()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelado = false
    obtenerResultados(id)
      .then((res) => {
        if (!cancelado) setDatos(res)
      })
      .catch((err) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudieron cargar los resultados.')
        }
      })
    return () => {
      cancelado = true
    }
  }, [id])

  if (error) return <Alerta tipo="error">{error}</Alerta>
  if (!datos) return <Cargando texto="Cargando resultados…" />

  const { entrevista, intercambios } = datos

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-xl bg-white p-5 text-center ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">
          {entrevista.area_display} · {entrevista.nivel_display}
        </p>
        <p className="mt-2 text-4xl font-semibold text-indigo-600">
          {entrevista.puntuacion_promedio ?? '—'}
        </p>
        <p className="text-sm text-slate-500">Puntuación promedio sobre 100</p>
      </div>

      <div className="space-y-4">
        {intercambios.map((intercambio) => (
          <TarjetaEvaluacion
            key={intercambio.numero}
            numero={intercambio.numero}
            pregunta={intercambio.pregunta}
            respuesta={intercambio.respuesta}
            evaluacion={intercambio.evaluacion}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/">
          <Boton variante="secundario">Nueva entrevista</Boton>
        </Link>
        <Link to="/historial">
          <Boton>Ver historial</Boton>
        </Link>
      </div>
    </div>
  )
}

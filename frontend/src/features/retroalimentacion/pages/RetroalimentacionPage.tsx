import { Link } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import EstadoVacio from '@/components/ui/EstadoVacio'
import Spinner from '@/components/ui/Spinner'
import ListaObservaciones from '@/features/retroalimentacion/components/ListaObservaciones'
import RepartoPorBandas from '@/features/retroalimentacion/components/RepartoPorBandas'
import { useRetroalimentacion } from '@/features/retroalimentacion/hooks/useRetroalimentacion'

export default function RetroalimentacionPage() {
  const { datos, cargando, error } = useRetroalimentacion()

  if (error) return <Alerta tipo="error">{error}</Alerta>
  if (cargando || !datos) return <Spinner texto="Cargando tu retroalimentación…" />

  if (datos.total_respuestas_evaluadas === 0) {
    return (
      <EstadoVacio icono="brujula" titulo="Tu retroalimentación aparecerá aquí cuando completes tu primera entrevista.">
        <Link to="/nueva-entrevista" className="font-medium text-iris-600 hover:underline">
          Empieza ahora
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-tinta-950">Tu retroalimentación</h1>
        <p className="mt-1 text-base text-tinta-500">
          Reúne lo que las evaluaciones dijeron de ti en {datos.total_respuestas_evaluadas}{' '}
          respuesta{datos.total_respuestas_evaluadas === 1 ? '' : 's'}, para que veas qué se te
          repite.
        </p>
      </div>

      <RepartoPorBandas areas={datos.por_area} />
      <ListaObservaciones observaciones={datos.observaciones} />

      {/* Mismo aviso que la landing: una vista que agrega texto generado por IA
          transmite más autoridad que una evaluación suelta, y el alcance del
          perfil obliga a acotarlo. */}
      <p className="rounded-control bg-tinta-100 px-4 py-3 text-center text-sm text-tinta-500">
        La evaluación la genera un modelo de inteligencia artificial. Es una herramienta de
        práctica y no sustituye el criterio de un entrevistador humano.
      </p>
    </div>
  )
}

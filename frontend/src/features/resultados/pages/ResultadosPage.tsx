import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { obtenerResultados } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Boton from '@/components/ui/Boton'
import Spinner from '@/components/ui/Spinner'
import PanelCualitativo from '@/features/resultados/components/PanelCualitativo'
import TablaPuntuaciones from '@/features/resultados/components/TablaPuntuaciones'
import TarjetaResumen from '@/features/resultados/components/TarjetaResumen'
import type { RespuestaResultados } from '@/types/entrevista'

export default function ResultadosPage() {
  const { id } = useParams<{ id: string }>()
  const [datos, setDatos] = useState<RespuestaResultados | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelado = false

    obtenerResultados(id)
      .then((res) => {
        if (!cancelado) setDatos(res)
      })
      .catch((err: unknown) => {
        if (!cancelado) {
          setError(err instanceof ErrorAPI ? err.message : 'No se pudieron cargar los resultados.')
        }
      })

    return () => {
      cancelado = true
    }
  }, [id])

  if (error) return <Alerta tipo="error">{error}</Alerta>
  if (!datos) return <Spinner texto="Cargando resultados…" />

  const { entrevista, intercambios } = datos

  return (
    <div className="mx-auto max-w-2xl">
      <TarjetaResumen entrevista={entrevista} />
      <TablaPuntuaciones intercambios={intercambios} />

      <div className="space-y-4">
        {intercambios.map((intercambio) => (
          <PanelCualitativo key={intercambio.numero} intercambio={intercambio} />
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/nueva-entrevista">
          <Boton variante="secundario">Nueva entrevista</Boton>
        </Link>
        <Link to="/historial">
          <Boton>Ver historial</Boton>
        </Link>
      </div>
    </div>
  )
}

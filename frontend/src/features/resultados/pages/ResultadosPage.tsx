import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ErrorAPI } from '@/api/client'
import { obtenerResultados } from '@/api/entrevistas'
import Alerta from '@/components/ui/Alerta'
import Badge from '@/components/ui/Badge'
import Boton from '@/components/ui/Boton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Spinner from '@/components/ui/Spinner'
import PanelCualitativo from '@/features/resultados/components/PanelCualitativo'
import TablaPuntuaciones from '@/features/resultados/components/TablaPuntuaciones'
import TarjetaResumen from '@/features/resultados/components/TarjetaResumen'
import { formatearDuracion, TONO_POR_ESTADO } from '@/lib/estados'
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
  if (!datos) return <Spinner texto="Cargando resultados…" tono="vidrio" />

  const { entrevista, intercambios } = datos
  const duracion = formatearDuracion(entrevista.fecha_inicio, entrevista.fecha_fin)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <EtiquetaMono tono="suelto">
            Sesión #{entrevista.id} · {entrevista.area_display}
          </EtiquetaMono>
          <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">
            Reporte de evaluación técnica
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge tono={TONO_POR_ESTADO[entrevista.estado]}>{entrevista.estado_display}</Badge>
          {duracion && (
            <span className="font-mono-vidrio text-code-inline text-vidrio-muted">
              {duracion}
            </span>
          )}
        </div>
      </div>

      <TarjetaResumen entrevista={entrevista} />
      <TablaPuntuaciones intercambios={intercambios} />

      <div className="space-y-4">
        {intercambios.map((intercambio) => (
          <PanelCualitativo key={intercambio.numero} intercambio={intercambio} />
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link to="/nueva-entrevista">
          <Boton variante="vidrio-secundario" forma="pildora">
            Nueva entrevista
          </Boton>
        </Link>
        <Link to="/historial">
          <Boton variante="vidrio" forma="pildora">
            Ver historial
          </Boton>
        </Link>
      </div>
    </div>
  )
}

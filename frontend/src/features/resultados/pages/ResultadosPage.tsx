import { useId, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import Badge from '@/components/ui/Badge'
import Icono from '@/components/ui/Icono'
import Pestanas from '@/components/ui/Pestanas'
import Spinner from '@/components/ui/Spinner'
import DesgloseDeLaEvaluacion from '@/features/resultados/components/DesgloseDeLaEvaluacion'
import FortalezasYDebilidades from '@/features/resultados/components/FortalezasYDebilidades'
import PlanDeMejora from '@/features/resultados/components/PlanDeMejora'
import PreguntaDeLaTranscripcion from '@/features/resultados/components/PreguntaDeLaTranscripcion'
import PuntuacionGlobal from '@/features/resultados/components/PuntuacionGlobal'
import ReporteSinNota from '@/features/resultados/components/ReporteSinNota'
import VeredictoDeLaIA from '@/features/resultados/components/VeredictoDeLaIA'
import { useResultados } from '@/features/resultados/hooks/useResultados'
import { useVeredicto } from '@/features/resultados/hooks/useVeredicto'
import { useCatalogos } from '@/hooks/useCatalogos'
import { formatearDuracion, TONO_POR_ESTADO } from '@/lib/estados'

type Pestana = 'resumen' | 'plan' | 'transcripcion'

const PESTANAS: { valor: Pestana; etiqueta: string }[] = [
  { valor: 'resumen', etiqueta: 'Resumen' },
  { valor: 'plan', etiqueta: 'Plan de mejora' },
  { valor: 'transcripcion', etiqueta: 'Transcripción' },
]

/**
 * El reporte de una entrevista: un encabezado y tres pestañas sobre un solo
 * panel, para no apilar todo en una columna larga. «Resumen» responde cómo te
 * fue, «Plan de mejora» qué hacer después y «Transcripción» qué se preguntó y
 * respondió, con el análisis de cada respuesta.
 *
 * Solo una entrevista finalizada tiene nota y, con ella, esas pestañas. Una
 * abandonada o con el tiempo agotado muestra `ReporteSinNota`; una en curso no
 * tiene reporte y vuelve al chat.
 */
export default function ResultadosPage() {
  const { id } = useParams<{ id: string }>()
  const { datos, cargando, error } = useResultados(id)
  // Para los descriptores de "¿Cómo se calcula?" y el nivel siguiente de la
  // práctica: si el catálogo falla, el reporte se muestra igual.
  const { catalogos } = useCatalogos()
  const [pestana, setPestana] = useState<Pestana>('resumen')
  const idPestanas = useId()
  const idPanel = useId()
  const veredicto = useVeredicto(id, datos?.veredicto ?? null, datos?.entrevista.estado === 'finalizada')

  if (error) return <Alerta>{error}</Alerta>
  if (cargando || !datos) return <Spinner texto="Cargando resultados…" />

  const { entrevista, intercambios, resumen } = datos
  if (entrevista.estado === 'en_progreso') return <Navigate to={`/entrevista/${entrevista.id}`} replace />
  const duracion = formatearDuracion(entrevista.fecha_inicio, entrevista.fecha_fin)
  const rubrica = catalogos?.rubrica ?? null

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <header className="flex flex-col gap-3">
        <Link
          to="/historial"
          className="inline-flex w-fit items-center gap-1 rounded-chip text-sm text-vidrio-acento foco-anillo hover:underline"
        >
          <Icono nombre="abajo" className="h-4 w-4 rotate-90" />
          Ver historial
        </Link>
        <div>
          <h1 className="font-serif text-headline-xl font-semibold text-vidrio-ink">Reporte de evaluación técnica</h1>
          {/* Una sola línea bajo el título; se parte en pantallas angostas. La
              tecnología solo entra si existe, para no dejar un «·» vacío. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-vidrio-muted">
            <span>
              {[entrevista.puesto_display, entrevista.tecnologia_display, entrevista.nivel_display]
                .filter(Boolean)
                .join(' · ')}
            </span>
            <span aria-hidden="true">·</span>
            <Badge tono={TONO_POR_ESTADO[entrevista.estado]}>{entrevista.estado_display}</Badge>
            {duracion && <span className="font-mono-vidrio text-code-inline">{duracion}</span>}
          </p>
        </div>
      </header>

      {entrevista.estado === 'finalizada' && resumen ? (
        <>
          <Pestanas
            etiqueta="Partes del reporte"
            pestanas={PESTANAS}
            seleccionada={pestana}
            onSeleccionar={(valor) => setPestana(valor as Pestana)}
            idBase={idPestanas}
            idPanel={idPanel}
            repartir
          />
          <div role="tabpanel" id={idPanel} aria-labelledby={`${idPestanas}-${pestana}`} className="flex flex-col gap-4 lg:gap-6">
            {pestana === 'resumen' && (
              <>
                <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:gap-6">
                  <PuntuacionGlobal resumen={resumen} />
                  <VeredictoDeLaIA
                    veredicto={veredicto.veredicto}
                    pidiendo={veredicto.pidiendo}
                    resumen={resumen}
                    onReintentar={veredicto.reintentar}
                  />
                </div>
                <DesgloseDeLaEvaluacion entrevista={entrevista} resumen={resumen} rubrica={rubrica} />
                <FortalezasYDebilidades intercambios={intercambios} />
              </>
            )}
            {pestana === 'plan' && (
              <PlanDeMejora
                entrevista={entrevista}
                intercambios={intercambios}
                resumen={resumen}
                niveles={catalogos?.niveles ?? []}
              />
            )}
            {pestana === 'transcripcion' && (
              <ol className="flex flex-col gap-3">
                {intercambios.map((intercambio) => (
                  <PreguntaDeLaTranscripcion key={intercambio.numero} intercambio={intercambio} rubrica={rubrica} />
                ))}
              </ol>
            )}
          </div>
        </>
      ) : (
        <ReporteSinNota entrevista={entrevista} intercambios={intercambios} rubrica={rubrica} />
      )}
    </div>
  )
}

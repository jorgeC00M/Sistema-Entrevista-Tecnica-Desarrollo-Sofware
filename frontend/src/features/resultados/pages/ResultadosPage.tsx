import { Link, useParams } from 'react-router-dom'

import Alerta from '@/components/ui/Alerta'
import Badge from '@/components/ui/Badge'
import { clasesDeBoton } from '@/components/ui/estilosDeBoton'
import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Spinner from '@/components/ui/Spinner'
import PanelCualitativo from '@/features/resultados/components/PanelCualitativo'
import ResumenFinal from '@/features/resultados/components/ResumenFinal'
import { useResultados } from '@/features/resultados/hooks/useResultados'
import { useCatalogos } from '@/hooks/useCatalogos'
import { formatearDuracion, TONO_POR_ESTADO } from '@/lib/estados'

export default function ResultadosPage() {
  const { id } = useParams<{ id: string }>()
  const { datos, cargando, error } = useResultados(id)
  // Solo para los descriptores de "¿Cómo se calcula?": si el catálogo falla,
  // el reporte se muestra igual, con los niveles y sin la explicación.
  const { catalogos } = useCatalogos()

  if (error) return <Alerta>{error}</Alerta>
  if (cargando || !datos) return <Spinner texto="Cargando resultados…" />

  const { entrevista, intercambios } = datos
  const duracion = formatearDuracion(entrevista.fecha_inicio, entrevista.fecha_fin)

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <EtiquetaMono tono="suelto">
            Sesión #{entrevista.id} · {entrevista.puesto_display}
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

      {datos.resumen && (
        <ResumenFinal entrevista={entrevista} resumen={datos.resumen} rubrica={catalogos?.rubrica ?? null} />
      )}

      <div className="space-y-4">
        {intercambios.map((intercambio) => (
          <PanelCualitativo
            key={intercambio.numero}
            intercambio={intercambio}
            rubrica={catalogos?.rubrica ?? null}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        {/* Mismo puesto y nivel ya elegidos: lo natural tras leer qué mejorar
            es volver a intentarlo en las mismas condiciones. Se pueden cambiar
            antes de empezar; la entrevista no arranca sola. */}
        <Link
          to={`/nueva-entrevista?${new URLSearchParams({ puesto: entrevista.puesto, nivel: entrevista.nivel })}`}
          className={clasesDeBoton({ variante: 'secundario', className: 'w-full sm:w-auto' })}
        >
          Practicar de nuevo este puesto
        </Link>
        <Link to="/historial" className={clasesDeBoton({ className: 'w-full sm:w-auto' })}>
          Ver historial
        </Link>
      </div>
    </div>
  )
}

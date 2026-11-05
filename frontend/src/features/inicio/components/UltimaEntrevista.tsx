import EnlaceDeAccion from '@/components/ui/EnlaceDeAccion'
import Tarjeta from '@/components/ui/Tarjeta'
import { fechaLegible } from '@/lib/fechas'
import { ESTILO_DE_BANDA } from '@/lib/puntajes'
import type { Entrevista, ResumenEntrevista } from '@/types/entrevista'

interface Props {
  entrevista: Entrevista
  resumen: ResumenEntrevista
}

/**
 * La última entrevista **finalizada**: la única con nota. Una que no se
 * completó no aparece aquí; la cubre «Tu siguiente paso» con «Volver a
 * intentarlo».
 */
export default function UltimaEntrevista({ entrevista, resumen }: Props) {
  const estilo = ESTILO_DE_BANDA[resumen.banda]
  const descripcion = [entrevista.tecnologia_display, entrevista.nivel_display].filter(Boolean).join(' · ')

  return (
    <Tarjeta como="section" className="flex flex-col gap-3 p-5">
      <h2 className="text-label-mono text-vidrio-muted uppercase">
        Tu última entrevista
      </h2>
      <div>
        <p className="font-medium text-vidrio-ink">{entrevista.puesto_display}</p>
        <p className="text-meta text-vidrio-muted">
          {descripcion}
          {entrevista.fecha_fin && ` · ${fechaLegible(entrevista.fecha_fin)}`}
        </p>
      </div>
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-mono-vidrio text-metric-counter text-vidrio-ink">
          {Math.round(resumen.promedio)}
          <span className="text-sm text-vidrio-muted"> / 100</span>
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 font-mono-vidrio text-label-mono uppercase ${estilo.fondoSuave} ${estilo.texto}`}
        >
          {estilo.etiqueta}
        </span>
      </p>
      <p className="text-sm text-vidrio-texto">Prioridad: {resumen.prioridad.area_display}</p>
      <div className="mt-auto">
        <EnlaceDeAccion
          to={`/entrevista/${entrevista.id}/resultados`}
          icono="ojo"
          aria-label={`Ver el reporte de ${entrevista.puesto_display}`}
        >
          Ver reporte
        </EnlaceDeAccion>
      </div>
    </Tarjeta>
  )
}

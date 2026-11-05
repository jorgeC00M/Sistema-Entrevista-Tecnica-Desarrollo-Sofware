import Tarjeta from '@/components/ui/Tarjeta'
import { ESTILO_DE_BANDA } from '@/lib/puntajes'
import type { ResumenEntrevista } from '@/types/entrevista'

interface Props {
  resumen: ResumenEntrevista
}

/**
 * La puntuación global: la media de las notas, con su banda en palabras y la
 * diferencia con la entrevista anterior del mismo puesto y nivel. Todo llega
 * calculado del servidor; aquí no se recalcula ningún umbral. Solo existe en
 * una entrevista finalizada: lo incompleto no tiene nota.
 */
export default function PuntuacionGlobal({ resumen }: Props) {
  const estilo = ESTILO_DE_BANDA[resumen.banda]
  const diferencia = resumen.comparacion?.diferencia

  return (
    <Tarjeta como="section" className="flex flex-col items-center gap-2 p-5 text-center">
      <h2 className="text-sm font-semibold text-vidrio-ink">Puntuación global</h2>
      <p className="font-mono-vidrio text-vidrio-ink">
        <span className="text-metric-counter">{Math.round(resumen.promedio)}</span>
        <span className="text-sm text-vidrio-muted"> / 100</span>
      </p>
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 font-mono-vidrio text-label-mono uppercase ${estilo.fondoSuave} ${estilo.texto}`}
      >
        Nivel: {estilo.etiqueta}
      </span>
      {diferencia !== undefined && (
        <p className="text-meta text-vidrio-texto">
          <span className="font-mono-vidrio text-vidrio-ink">{diferencia > 0 ? `+${diferencia}` : diferencia}</span>{' '}
          {diferencia === 0 ? 'puntos: igual que' : 'puntos respecto a'} tu entrevista anterior de este puesto y nivel.
        </p>
      )}
    </Tarjeta>
  )
}

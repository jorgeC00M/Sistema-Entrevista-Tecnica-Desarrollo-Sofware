import { fechaNumerica } from '@/lib/fechas'

interface Props {
  /** Posición del punto dentro del gráfico, en porcentaje del ancho y del alto. */
  izquierda: number
  arriba: number
  fecha: string
  puesto: string
  tecnologia: string | null
  nota: number
}

/**
 * El cuadro que aparece sobre un punto de "Evolución en el tiempo" al pasar el
 * puntero o al enfocarlo: Fecha, Puesto, Tecnología y Puntaje.
 *
 * Es HTML sobre el SVG y no un `<title>` nativo, que tarda en aparecer, no se
 * ve con teclado y no admite filas. Cerca de los bordes se ancla hacia dentro
 * para no salirse de la tarjeta. Mismo aspecto que `components/ui/Tooltip`.
 */
export default function DetalleDePunto({ izquierda, arriba, fecha, puesto, tecnologia, nota }: Props) {
  // Centrado sobre el punto; en el primer y último cuarto, hacia dentro.
  const horizontal = izquierda < 25 ? '-12%' : izquierda > 75 ? '-88%' : '-50%'
  // Arriba del punto, salvo que el punto esté tan alto que el cuadro no quepa.
  const vertical = arriba < 40 ? '14px' : 'calc(-100% - 14px)'

  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-max max-w-56 rounded-control bg-vidrio-ink px-3 py-2 text-xs text-white shadow-flotante"
      style={{ left: `${izquierda}%`, top: `${arriba}%`, transform: `translate(${horizontal}, ${vertical})` }}
    >
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <dt className="text-vidrio-sidebar-muted">Fecha</dt>
        <dd className="font-mono-vidrio">{fechaNumerica(fecha)}</dd>
        <dt className="text-vidrio-sidebar-muted">Puesto</dt>
        <dd>{puesto}</dd>
        <dt className="text-vidrio-sidebar-muted">Tecnología</dt>
        <dd>{tecnologia ?? '—'}</dd>
        <dt className="text-vidrio-sidebar-muted">Puntaje</dt>
        <dd className="font-mono-vidrio font-semibold">{Math.round(nota)}/100</dd>
      </dl>
    </div>
  )
}

import Icono from '@/components/ui/Icono'
import { formatoReloj, tramoDelReloj, type TramoDelReloj } from '@/lib/tiempo'

interface Props {
  /** Segundos que quedan, ya corregidos con la hora del servidor. */
  segundos: number
}

const CLASES: Record<TramoDelReloj, string> = {
  normal: 'bg-vidrio-ink text-white',
  aviso5: 'bg-progreso-fondo text-progreso-texto',
  aviso1: 'bg-error-fondo text-error-texto',
  vencido: 'bg-error-fondo text-error-texto',
}

const ANUNCIO: Record<TramoDelReloj, string> = {
  normal: '',
  aviso5: 'Quedan 5 minutos',
  aviso1: 'Queda 1 minuto',
  vencido: 'Se acabó el tiempo',
}

/**
 * La cuenta regresiva de la entrevista: siempre visible y discreta, como el
 * reloj de una sala de examen. Cambia de aspecto al quedar 5 minutos y al
 * quedar 1, y lo anuncia una sola vez por tramo: la región `aria-live` solo
 * cambia de texto al cambiar de tramo, no con cada segundo.
 *
 * El número en sí no se anuncia (sería un anuncio por segundo); su nombre
 * accesible dice el tiempo que queda al enfocarlo o recorrerlo.
 */
export default function RelojDeEntrevista({ segundos }: Props) {
  const tramo = tramoDelReloj(segundos)
  const texto = formatoReloj(segundos)

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono-vidrio text-metric-counter transition-colors duration-150 ${CLASES[tramo]}`}
    >
      <Icono nombre="reloj" className="h-4 w-4 opacity-70" />
      <span role="timer" aria-label={`Tiempo restante: ${texto}`}>
        {texto}
      </span>
      <span className="sr-only" aria-live="polite">
        {ANUNCIO[tramo]}
      </span>
    </div>
  )
}

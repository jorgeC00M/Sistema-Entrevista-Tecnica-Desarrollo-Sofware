import EnlaceDeAccion from '@/components/ui/EnlaceDeAccion'
import Icono from '@/components/ui/Icono'
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import { minutosRestantes } from '@/lib/tiempo'

interface Props {
  entrevista: EntrevistaEnCurso
}

/**
 * Aviso de «Simular entrevista» cuando hay una entrevista en curso: solo puede
 * haber una, y su tiempo corre aunque el usuario esté aquí. No bloquea la
 * pantalla —se puede preparar la siguiente—; el modal de inicio es el que
 * pregunta qué hacer con ella.
 *
 * Informa, no es un error: `role="status"` y el ámbar de «en progreso», no
 * `Alerta`, que es solo para fallos.
 */
export default function AvisoDeEntrevistaEnCurso({ entrevista }: Props) {
  const minutos = minutosRestantes(entrevista.segundosRestantes)
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-control bg-progreso-fondo px-4 py-3 text-sm text-progreso-texto"
    >
      <p className="flex items-center gap-2">
        <Icono nombre="reloj" className="h-4 w-4 shrink-0" />
        <span>
          Tienes una entrevista en curso: <strong className="font-semibold">{entrevista.puestoDisplay}</strong> ·
          quedan {minutos} min
        </span>
      </p>
      <EnlaceDeAccion
        to={`/entrevista/${entrevista.id}`}
        icono="play"
        aria-label={`Continuar la entrevista de ${entrevista.puestoDisplay}`}
      >
        Continuarla
      </EnlaceDeAccion>
    </div>
  )
}

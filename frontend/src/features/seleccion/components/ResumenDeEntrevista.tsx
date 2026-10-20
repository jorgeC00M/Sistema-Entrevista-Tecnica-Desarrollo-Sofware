import type { Ref } from 'react'

import Boton from '@/components/ui/Boton'

/** Lo elegido, ya completo y con nombres para mostrar ("React + Node.js"). */
interface EleccionCompleta {
  puesto: string
  tecnologia: string
  nivel: string
}

interface Props {
  /** `null` mientras falte algún campo. */
  eleccion: EleccionCompleta | null
  /** Qué falta, mientras `eleccion` es `null`: "Elige el nivel". */
  falta: string
  /** Nombres de las áreas que cubre el puesto: lo que deja a la vista el objetivo 2 del perfil. */
  areas: string[]
  totalPreguntas: number
  onIniciar: () => void
  /** Para llevar el foco a "Iniciar entrevista" (tras repetir). */
  refBoton?: Ref<HTMLButtonElement>
  /** La selección vino de una convocatoria: sus requisitos orientarán las preguntas. */
  desdeConvocatoria?: boolean
}

/**
 * El cierre del formulario, dentro del mismo panel: lo elegido (o lo que
 * falta) y "Iniciar entrevista" abajo a la derecha, que abre el modal de
 * inicio. El botón solo se habilita con la elección completa; qué cuenta como
 * completa lo decide `seleccion.ts`.
 */
export default function ResumenDeEntrevista({
  eleccion,
  falta,
  areas,
  totalPreguntas,
  onIniciar,
  refBoton,
  desdeConvocatoria = false,
}: Props) {
  return (
    // En escritorio, una fila: lo elegido a la izquierda, el botón a la derecha.
    // Por debajo, el botón baja a su propia fila, alineado a la derecha.
    <div className="flex flex-col gap-3 border-t border-vidrio-linea pt-5 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="text-sm" aria-live="polite">
          {eleccion ? (
            <>
              <p className="font-medium text-vidrio-ink">
                {eleccion.puesto} · {eleccion.tecnologia} · {eleccion.nivel}
                <span className="font-normal text-vidrio-muted"> · {totalPreguntas} preguntas</span>
              </p>
              {areas.length > 0 && <p className="mt-0.5 text-meta text-vidrio-muted">Cubre: {areas.join(', ')}</p>}
            </>
          ) : (
            <p className="text-vidrio-muted">{falta}</p>
          )}
        </div>
        {desdeConvocatoria && (
          <span className="inline-flex self-start rounded-full bg-vidrio-acento-suave px-2 py-0.5 text-meta text-vidrio-acento">
            Desde convocatoria
          </span>
        )}
      </div>

      <Boton
        ref={refBoton}
        tamano="sm"
        disabled={!eleccion}
        onClick={onIniciar}
        className="self-end lg:shrink-0"
      >
        Iniciar entrevista
      </Boton>
    </div>
  )
}

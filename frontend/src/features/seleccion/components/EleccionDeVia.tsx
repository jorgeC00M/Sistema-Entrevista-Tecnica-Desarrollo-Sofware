import { useId } from 'react'

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/trazosDeIconos'

export type Via = 'texto' | 'archivo'

const OPCIONES: { valor: Via; titulo: string; ayuda: string; icono: NombreDeIcono }[] = [
  { valor: 'texto', titulo: 'Pegar texto', ayuda: 'Copia el aviso de la web', icono: 'respuesta' },
  { valor: 'archivo', titulo: 'Subir archivo', ayuda: 'PDF o DOCX', icono: 'documento' },
]

/**
 * Un `<label>` que envuelve un radio nativo oculto (`sr-only`): la tarjeta pinta
 * su estado con `has-[:checked]`, el foco con `has-[:focus-visible]` y el
 * bloqueo con `has-[:disabled]`.
 */
const CLASES_DE_OPCION =
  'flex cursor-pointer items-start gap-3 rounded-control border border-vidrio-borde bg-white px-4 py-3.5 transition-colors duration-150 hover:border-vidrio-acento has-[:checked]:border-vidrio-acento has-[:checked]:bg-vidrio-acento-suave has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vidrio-acento'

interface Props {
  via: Via
  onCambiar: (via: Via) => void
  deshabilitado?: boolean
}

/**
 * Las dos formas de dar la convocatoria, como dos tarjetas lado a lado.
 *
 * Son radios nativos con forma de tarjeta: el navegador da
 * gratis "1 de 2, seleccionado", las flechas y un solo Tab para el grupo.
 */
export default function EleccionDeVia({ via, onCambiar, deshabilitado = false }: Props) {
  const nombre = useId()

  return (
    <fieldset disabled={deshabilitado} className="min-w-0">
      <legend className="mb-2 text-sm font-medium text-vidrio-ink">Elige una forma de darnos la convocatoria</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPCIONES.map((opcion) => (
          <label key={opcion.valor} className={CLASES_DE_OPCION}>
            <input
              type="radio"
              name={nombre}
              value={opcion.valor}
              checked={via === opcion.valor}
              onChange={() => onCambiar(opcion.valor)}
              className="sr-only"
            />
            <Icono nombre={opcion.icono} className="mt-0.5 h-5 w-5 shrink-0 text-vidrio-acento" />
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-vidrio-ink">{opcion.titulo}</span>
              <span className="text-meta text-vidrio-muted">{opcion.ayuda}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

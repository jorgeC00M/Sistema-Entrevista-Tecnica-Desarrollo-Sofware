import { useId } from 'react'
import type { Ref } from 'react'

import BotonIcono from '@/components/ui/BotonIcono'
import Icono from '@/components/ui/Icono'

interface Props {
  valor: string
  onCambiar: (valor: string) => void
  /** Lo que lee el lector de pantalla como nombre del campo. */
  etiqueta: string
  placeholder?: string
  /** React 19: la ref llega como prop. Recibe el foco tras «Limpiar búsqueda». */
  ref?: Ref<HTMLInputElement>
}

/**
 * Campo de búsqueda: lupa a la izquierda, texto, y una X para borrarlo cuando
 * tiene algo escrito.
 *
 * La etiqueta es `sr-only`: la lupa y el placeholder ya dicen qué es a quien
 * ve la pantalla. El borrado nativo de `type="search"` se oculta para no tener
 * dos X; la nuestra es un `BotonIcono` con nombre accesible. Vive en
 * `components/ui/` porque lleva un botón.
 */
export default function CampoBusqueda({ valor, onCambiar, etiqueta, placeholder, ref }: Props) {
  const id = useId()

  return (
    <div className="campo relative flex h-11 items-center">
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      <span aria-hidden="true" className="pointer-events-none absolute left-3.5 text-vidrio-muted">
        <Icono nombre="buscar" className="h-4 w-4" />
      </span>
      <input
        ref={ref}
        id={id}
        type="search"
        value={valor}
        placeholder={placeholder}
        onChange={(evento) => onCambiar(evento.target.value)}
        className="h-full w-full min-w-0 bg-transparent pr-11 pl-10 text-sm text-vidrio-ink outline-none placeholder:text-vidrio-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {valor && (
        <BotonIcono
          icono="cerrar"
          tamano="sm"
          aria-label="Borrar búsqueda"
          onClick={() => onCambiar('')}
          className="absolute right-1.5"
        />
      )}
    </div>
  )
}

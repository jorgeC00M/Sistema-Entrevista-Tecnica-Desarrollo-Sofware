import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'

export interface Funcion {
  icono: NombreDeIcono
  /** Color del icono, como clase de texto. */
  colorIcono: string
  titulo: string
  texto: string
}

/**
 * Lo que ofrece una sección, como lista y no como tarjetas.
 *
 * Reemplaza a las tarjetas "icono en un cuadrado + título + texto" que
 * estructuraban tres secciones seguidas: la tarjeta de mismo tamaño era el
 * contenedor por defecto, no una decisión. Aquí el icono va en línea, a tamaño
 * de texto, y lo que separa un elemento de otro es un renglón fino.
 */
export default function ListaDeFunciones({ funciones }: { funciones: Funcion[] }) {
  return (
    <ul className="divide-y divide-vidrio-linea border-y border-vidrio-linea">
      {funciones.map(({ icono, colorIcono, titulo, texto }) => (
        <li key={titulo} className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 py-5">
          <Icono nombre={icono} className={`mt-1 h-5 w-5 ${colorIcono}`} aria-hidden />
          <div>
            <h3 className="text-tarjeta text-vidrio-ink">{titulo}</h3>
            <p className="mt-1 max-w-[62ch] text-cuerpo text-vidrio-texto">{texto}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

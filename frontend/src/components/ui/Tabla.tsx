import type { ReactNode, Ref } from 'react'

import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'

export interface ColumnaDeTabla<T> {
  clave: string
  titulo: string
  celda: (fila: T) => ReactNode
  /** `fin` para números y acciones, que se leen mejor contra el borde derecho. */
  alinear?: 'inicio' | 'fin'
}

interface Props<T> {
  /** Lo que el lector de pantalla anuncia como título de la tabla. */
  titulo: string
  columnas: ColumnaDeTabla<T>[]
  filas: T[]
  claveDeFila: (fila: T) => string | number
  /** Cómo se ve una fila como tarjeta, por debajo de 640 px. */
  tarjeta: (fila: T) => ReactNode
  /** Recibe el foco al cambiar de página, para que el teclado no quede atrás. */
  refInicio?: Ref<HTMLDivElement>
}

/**
 * Tabla dentro de la tarjeta de vidrio, con encabezados reales (`th scope`).
 *
 * Por debajo de 640 px una tabla de siete columnas obligaría a desplazarse de
 * lado, así que cada fila se pinta como tarjeta apilada. Las dos vistas se
 * eligen con CSS (`hidden sm:table` / `sm:hidden`) y no con `useMediaQuery`:
 * no hay salto al montar, y `display: none` saca la vista oculta del árbol de
 * accesibilidad, así que nada se lee dos veces.
 */
export default function Tabla<T>({ titulo, columnas, filas, claveDeFila, tarjeta, refInicio }: Props<T>) {
  const alineacion = (columna: ColumnaDeTabla<T>) => (columna.alinear === 'fin' ? 'text-right' : 'text-left')

  return (
    <Tarjeta>
      <div ref={refInicio} tabIndex={-1} className="rounded-vidrio outline-none">
        <table className="hidden w-full border-collapse sm:table">
          <caption className="sr-only">{titulo}</caption>
          <thead>
            <tr className="border-b border-vidrio-linea">
              {columnas.map((columna) => (
                <th key={columna.clave} scope="col" className={`px-4 py-3 font-normal ${alineacion(columna)}`}>
                  <EtiquetaMono tono="suelto">{columna.titulo}</EtiquetaMono>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila) => (
              <tr
                key={claveDeFila(fila)}
                className="border-b border-vidrio-linea transition last:border-b-0 hover:bg-vidrio-field"
              >
                {columnas.map((columna) => (
                  <td key={columna.clave} className={`px-4 py-3 align-middle text-sm ${alineacion(columna)}`}>
                    {columna.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <ul aria-label={titulo} className="divide-y divide-vidrio-linea sm:hidden">
          {filas.map((fila) => (
            <li key={claveDeFila(fila)} className="px-4 py-4">
              {tarjeta(fila)}
            </li>
          ))}
        </ul>
      </div>
    </Tarjeta>
  )
}

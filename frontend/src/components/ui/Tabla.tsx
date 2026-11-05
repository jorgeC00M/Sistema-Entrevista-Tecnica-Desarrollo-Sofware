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
  /** Cómo se ve una fila como tarjeta, cuando el panel mide menos de 896 px. */
  tarjeta: (fila: T) => ReactNode
  /** Recibe el foco al cambiar de página, para que el teclado no quede atrás. */
  refInicio?: Ref<HTMLDivElement>
}

/**
 * Tabla dentro de la tarjeta de vidrio, con encabezados reales (`th scope`).
 *
 * Decide por el ancho **del panel**, no de la ventana (una consulta de
 * contenedor, `@container` + `@4xl:`): la barra lateral, abierta o plegada,
 * cambia cuánto queda para la tabla, y con siete columnas por debajo de 896 px
 * la última se salía del panel. Más angosto, cada fila se pinta como tarjeta
 * apilada. Las dos vistas se eligen con CSS y no con `useMediaQuery`: no hay
 * salto al montar, y `display: none` saca la vista oculta del árbol de
 * accesibilidad, así que nada se lee dos veces. `overflow-x-auto` es la red de
 * seguridad: si una fila aun así no entra, se desplaza dentro del panel en vez
 * de ensancharlo.
 */
export default function Tabla<T>({ titulo, columnas, filas, claveDeFila, tarjeta, refInicio }: Props<T>) {
  const alineacion = (columna: ColumnaDeTabla<T>) => (columna.alinear === 'fin' ? 'text-right' : 'text-left')

  return (
    <Tarjeta>
      <div ref={refInicio} tabIndex={-1} className="@container rounded-vidrio outline-none">
        <div className="hidden overflow-x-auto @4xl:block">
          <table className="w-full border-collapse">
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
        </div>

        <ul aria-label={titulo} className="divide-y divide-vidrio-linea @4xl:hidden">
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

/**
 * Lógica pura del historial: qué entrevistas muestra la tabla. Sin React, para
 * probarla con Vitest; la página solo la pinta. La evolución se mudó al Inicio
 * (`features/inicio/evolucion.ts`).
 */
import { normalizarParaBuscar } from '@/lib/texto'
import type { Entrevista } from '@/types/entrevista'

/** `'todos'` o el `codigo` de un nivel del catálogo. */
export type FiltroDeNivel = 'todos' | string

/**
 * El nivel que llega de `?nivel=`: solo un código del catálogo; cualquier otra
 * cosa equivale a todos. Los códigos se reciben porque los niveles viven en la
 * base de datos, no en el código.
 */
export function nivelDesdeURL(valor: string | null, codigos: readonly string[]): FiltroDeNivel {
  return valor !== null && codigos.includes(valor) ? valor : 'todos'
}

/**
 * Las entrevistas que coinciden con el texto (en puesto, tecnología o nivel)
 * y con el nivel. El texto se compara sin mayúsculas ni tildes; vacío, no
 * filtra. Conserva el orden de la lista. No hay filtro de estado: el estado se
 * lee en su columna de la tabla.
 */
export function filtrarEntrevistas(
  entrevistas: Entrevista[],
  texto: string,
  nivel: FiltroDeNivel = 'todos',
): Entrevista[] {
  const buscado = normalizarParaBuscar(texto)
  return entrevistas.filter((entrevista) => {
    if (nivel !== 'todos' && entrevista.nivel !== nivel) return false
    if (!buscado) return true
    const buscable = normalizarParaBuscar(
      [entrevista.puesto_display, entrevista.tecnologia_display ?? '', entrevista.nivel_display].join(' '),
    )
    return buscable.includes(buscado)
  })
}

import { NIVEL_MAXIMO_POR_DEFECTO, ORDEN_DE_CRITERIOS } from '@/features/resultados/rubricaPorDefecto'
import type { Rubrica } from '@/types/catalogos'
import type { CodigoDeCriterio, Niveles } from '@/types/evaluacion'

/**
 * La fórmula de la nota, escrita como se explica en la defensa. Con pesos
 * iguales es una suma simple —«100 · (3 + 2 + 3) / 12»—; si algún día los
 * pesos difieren, se escriben explícitos para que la cuenta siga siendo
 * reproducible a mano.
 */

interface Escala {
  criterios: { codigo: CodigoDeCriterio; peso: number }[]
  nivelMaximo: number
}

/** Sin catálogo: los tres criterios con peso 1, que es la rúbrica vigente. */
function escalaDe(rubrica: Rubrica | null): Escala {
  return rubrica
    ? { criterios: rubrica.criterios, nivelMaximo: rubrica.nivel_maximo }
    : { criterios: ORDEN_DE_CRITERIOS.map((codigo) => ({ codigo, peso: 1 })), nivelMaximo: NIVEL_MAXIMO_POR_DEFECTO }
}

const SUBINDICES = ['₁', '₂', '₃', '₄', '₅', '₆']

function armar(escala: Escala, termino: (codigo: CodigoDeCriterio, indice: number) => string): string {
  const sumaDePesos = escala.criterios.reduce((total, c) => total + c.peso, 0)
  const pesosIguales = escala.criterios.every((c) => c.peso === 1)
  const terminos = escala.criterios
    .map((c, i) => (pesosIguales ? termino(c.codigo, i) : `${c.peso}·${termino(c.codigo, i)}`))
    .join(' + ')
  const denominador = pesosIguales
    ? `${escala.nivelMaximo * sumaDePesos}`
    : `(${escala.nivelMaximo} · ${sumaDePesos})`
  return `100 · (${terminos}) / ${denominador}`
}

/** «100 · (n₁ + n₂ + n₃) / 12»: la nota de cualquier respuesta. */
export function formulaGeneral(rubrica: Rubrica | null): string {
  return armar(escalaDe(rubrica), (_, i) => `n${SUBINDICES[i] ?? i + 1}`)
}

/** «100 · (3 + 2 + 3) / 12 = 67»: la cuenta de una respuesta concreta. */
export function operacion(niveles: Niveles, puntuacion: number, rubrica: Rubrica | null): string {
  return `${armar(escalaDe(rubrica), (codigo) => `${niveles[codigo]}`)} = ${puntuacion}`
}

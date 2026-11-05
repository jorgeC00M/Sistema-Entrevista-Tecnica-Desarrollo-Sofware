import { describe, expect, it } from 'vitest'

import type { Rubrica } from '@/types/catalogos'

import { formulaGeneral, operacion } from './formula'

function rubrica(pesos: [number, number, number]): Rubrica {
  return {
    nivel_maximo: 4,
    criterios: (['correccion', 'completitud', 'claridad'] as const).map((codigo, i) => ({
      codigo,
      nombre: codigo,
      peso: pesos[i],
      descriptores: [],
    })),
  }
}

const NIVELES = { correccion: 3, completitud: 2, claridad: 3 }

describe('operacion', () => {
  it('con pesos iguales es una suma simple', () => {
    expect(operacion(NIVELES, 67, rubrica([1, 1, 1]))).toBe('100 · (3 + 2 + 3) / 12 = 67')
  })
  it('con pesos distintos los escribe explícitos', () => {
    expect(operacion(NIVELES, 65, rubrica([2, 1, 1]))).toBe('100 · (2·3 + 1·2 + 1·3) / (4 · 4) = 65')
  })
  it('sin catálogo usa la rúbrica vigente', () => {
    expect(operacion(NIVELES, 67, null)).toBe('100 · (3 + 2 + 3) / 12 = 67')
  })
})

describe('formulaGeneral', () => {
  it('nombra los niveles con subíndices', () => {
    expect(formulaGeneral(rubrica([1, 1, 1]))).toBe('100 · (n₁ + n₂ + n₃) / 12')
  })
})

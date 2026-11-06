import { describe, expect, it } from 'vitest'

import { fechaLarga, fechaLegible, fechaNumerica } from '@/lib/fechas'

// Mediodía UTC: cae en el mismo día en cualquier zona horaria del continente.
const FECHA = '2026-10-28T12:00:00Z'

describe('fechas', () => {
  it('numérica, para comparar en tabla y gráfico', () => {
    expect(fechaNumerica(FECHA)).toBe('28/10/2026')
  })

  it('legible y larga llevan el día, el mes en palabras y el año', () => {
    for (const texto of [fechaLegible(FECHA), fechaLarga(FECHA)]) {
      expect(texto).toMatch(/28/)
      expect(texto).toMatch(/oct/i)
      expect(texto).toMatch(/2026/)
    }
    expect(fechaLarga(FECHA)).toMatch(/octubre/i)
  })
})

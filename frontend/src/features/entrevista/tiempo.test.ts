import { describe, expect, it } from 'vitest'

import {
  desfaseDelReloj,
  formatoReloj,
  minutosRestantes,
  segundosRestantes,
  tramoDelReloj,
} from '@/features/entrevista/tiempo'

const SERVIDOR = '2026-11-04T10:00:00Z'
const LIMITE = '2026-11-04T10:30:00Z'
const MS_SERVIDOR = Date.parse(SERVIDOR)

describe('segundosRestantes', () => {
  it('con los relojes de acuerdo, cuenta desde la hora del servidor', () => {
    const desfase = desfaseDelReloj(SERVIDOR, MS_SERVIDOR)
    expect(segundosRestantes(LIMITE, desfase, MS_SERVIDOR)).toBe(30 * 60)
  })

  it('un dispositivo adelantado 10 minutos no pierde esos minutos', () => {
    const adelantado = MS_SERVIDOR + 10 * 60_000
    const desfase = desfaseDelReloj(SERVIDOR, adelantado)
    expect(segundosRestantes(LIMITE, desfase, adelantado)).toBe(30 * 60)
    // Y sigue contando con el paso del tiempo del propio dispositivo.
    expect(segundosRestantes(LIMITE, desfase, adelantado + 61_000)).toBe(30 * 60 - 61)
  })

  it('nunca es negativo', () => {
    expect(segundosRestantes(LIMITE, 0, MS_SERVIDOR + 45 * 60_000)).toBe(0)
  })

  it('redondea hacia arriba: con medio segundo todavía no venció', () => {
    expect(segundosRestantes(LIMITE, 0, Date.parse(LIMITE) - 500)).toBe(1)
  })
})

describe('tramoDelReloj', () => {
  it.each([
    [301, 'normal'],
    [300, 'aviso5'],
    [61, 'aviso5'],
    [60, 'aviso1'],
    [1, 'aviso1'],
    [0, 'vencido'],
  ] as const)('%i s → %s', (segundos, tramo) => {
    expect(tramoDelReloj(segundos)).toBe(tramo)
  })
})

describe('formato', () => {
  it('mm:ss con ceros', () => {
    expect(formatoReloj(30 * 60)).toBe('30:00')
    expect(formatoReloj(65)).toBe('01:05')
    expect(formatoReloj(0)).toBe('00:00')
  })

  it('los minutos del sidebar van hacia arriba', () => {
    expect(minutosRestantes(30)).toBe(1)
    expect(minutosRestantes(18 * 60)).toBe(18)
    expect(minutosRestantes(18 * 60 + 1)).toBe(19)
  })
})

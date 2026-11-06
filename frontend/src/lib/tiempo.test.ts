import { describe, expect, it } from 'vitest'

import {
  anclaDelReloj,
  etiquetaDeContinuar,
  formatoReloj,
  minutosRestantes,
  segundosRestantes,
  tramoDelReloj,
} from '@/lib/tiempo'

const SERVIDOR = '2026-11-04T10:00:00Z'
const LIMITE = '2026-11-04T10:30:00Z'
// Un `performance.now()` cualquiera: no guarda relación con la hora del día.
const LLEGADA = 12_345

describe('segundosRestantes', () => {
  it('al llegar, quedan límite menos hora del servidor', () => {
    const ancla = anclaDelReloj(LIMITE, SERVIDOR, LLEGADA)
    expect(segundosRestantes(ancla, LLEGADA)).toBe(30 * 60)
  })

  it('descuenta lo que pasó desde la llegada, no desde la lectura', () => {
    // Un dato de la caché que llegó hace 25 s ya perdió esos 25 s.
    const ancla = anclaDelReloj(LIMITE, SERVIDOR, LLEGADA)
    expect(segundosRestantes(ancla, LLEGADA + 25_000)).toBe(30 * 60 - 25)
  })

  it('no usa la hora del dispositivo: solo horas del servidor y un reloj monotónico', () => {
    // Con el dispositivo adelantado o atrasado, el ancla es la misma.
    const ancla = anclaDelReloj(LIMITE, '2026-11-04T10:20:00Z', 0)
    expect(segundosRestantes(ancla, 61_000)).toBe(10 * 60 - 61)
  })

  it('nunca es negativo', () => {
    const ancla = anclaDelReloj(LIMITE, SERVIDOR, LLEGADA)
    expect(segundosRestantes(ancla, LLEGADA + 45 * 60_000)).toBe(0)
  })

  it('redondea hacia arriba: con medio segundo todavía no venció', () => {
    const ancla = anclaDelReloj(LIMITE, '2026-11-04T10:29:59.500Z', 0)
    expect(segundosRestantes(ancla, 0)).toBe(1)
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

  it('el botón del sidebar dice solo los minutos', () => {
    expect(etiquetaDeContinuar(18 * 60)).toBe('Continuar · 18 min')
    expect(etiquetaDeContinuar(20)).toBe('Continuar · 1 min')
  })

  it('los minutos del sidebar van hacia arriba', () => {
    expect(minutosRestantes(30)).toBe(1)
    expect(minutosRestantes(18 * 60)).toBe(18)
    expect(minutosRestantes(18 * 60 + 1)).toBe(19)
  })
})

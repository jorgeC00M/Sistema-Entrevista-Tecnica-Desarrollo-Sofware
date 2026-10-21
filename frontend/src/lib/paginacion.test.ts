import { describe, expect, it } from 'vitest'

import { paginasVisibles, recortar } from './paginacion'

describe('paginasVisibles', () => {
  it.each([
    [1, 1, [1]],
    [2, 2, [1, 2]],
    [2, 3, [1, 2, 3]],
    [1, 12, [1, 2, 3]],
    [6, 12, [5, 6, 7]],
    [11, 12, [10, 11, 12]],
    [12, 12, [10, 11, 12]],
  ])('en la página %i de %i muestra %j', (actual, total, esperado) => {
    expect(paginasVisibles(actual, total)).toEqual(esperado)
  })

  it('nunca muestra más de tres números', () => {
    for (let actual = 1; actual <= 40; actual++) {
      expect(paginasVisibles(actual, 40).length).toBe(3)
    }
  })

  it('sin páginas no muestra ninguna', () => {
    expect(paginasVisibles(1, 0)).toEqual([])
  })
})

describe('recortar', () => {
  it.each([
    [99, 2, 2],
    [0, 2, 1],
    [-3, 5, 1],
    [Number.NaN, 2, 1],
    [2.7, 5, 2],
    [3, 5, 3],
    [4, 1, 1],
  ])('la página %s de %i queda en %i', (pagina, total, esperado) => {
    expect(recortar(pagina, total)).toBe(esperado)
  })
})

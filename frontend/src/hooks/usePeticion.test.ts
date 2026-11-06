import { describe, expect, it, vi } from 'vitest'

import { estaVigente, invalidarCache, recortarVencidas, suscribirPeticion } from '@/hooks/usePeticion'

describe('estaVigente', () => {
  it('sirve mientras no pasa la vigencia de quien lee', () => {
    expect(estaVigente({ momento: 1000 }, 1000 + 29_999, 30_000)).toBe(true)
    expect(estaVigente({ momento: 1000 }, 1000 + 30_000, 30_000)).toBe(false)
  })
})

describe('recortarVencidas', () => {
  it('quita solo lo vencido', () => {
    const entradas = new Map([
      ['vieja', { vence: 100 }],
      ['justa', { vence: 200 }],
      ['nueva', { vence: 300 }],
    ])
    recortarVencidas(entradas, 200)
    expect([...entradas.keys()]).toEqual(['nueva'])
  })
})

describe('suscribirPeticion', () => {
  it('dos interesados en la misma clave hacen una sola petición', async () => {
    invalidarCache('prueba-compartida')
    const pedir = vi.fn(async () => 'dato')

    const a = suscribirPeticion('prueba-compartida', pedir, 30_000)
    const b = suscribirPeticion('prueba-compartida', pedir, 30_000)

    expect(pedir).toHaveBeenCalledTimes(1)
    expect((await a.promesa).valor).toBe('dato')
    expect((await b.promesa).valor).toBe('dato')
  })

  it('no se aborta mientras quede alguien esperando; sí cuando se van todos', () => {
    invalidarCache('prueba-abort')
    let senal: AbortSignal | undefined
    const pedir = (signal: AbortSignal) => {
      senal = signal
      return new Promise<string>(() => {})
    }

    const a = suscribirPeticion('prueba-abort', pedir, 30_000)
    const b = suscribirPeticion('prueba-abort', pedir, 30_000)
    a.soltar()
    expect(senal?.aborted).toBe(false)
    b.soltar()
    expect(senal?.aborted).toBe(true)
    // Soltar dos veces no descuenta de más.
    b.soltar()
  })

  it('tras invalidar, quien vuelve a pedir empieza otra petición', async () => {
    invalidarCache('prueba-invalidar')
    const pedir = vi.fn(async () => 'dato')

    const vieja = suscribirPeticion('prueba-invalidar', pedir, 30_000)
    invalidarCache('prueba-invalidar')
    const nueva = suscribirPeticion('prueba-invalidar', pedir, 30_000)

    expect(pedir).toHaveBeenCalledTimes(2)
    await Promise.all([vieja.promesa, nueva.promesa])
  })
})

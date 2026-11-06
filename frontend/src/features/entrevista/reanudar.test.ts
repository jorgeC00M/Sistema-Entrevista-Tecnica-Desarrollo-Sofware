import { describe, expect, it } from 'vitest'

import { ESPERA_MAXIMA_MS, queHacerConLaPendiente } from '@/features/entrevista/reanudar'

const RESPONDIDA = '2026-11-05T10:00:00Z'
const despues = (ms: number) => new Date(Date.parse(RESPONDIDA) + ms).toISOString()

describe('queHacerConLaPendiente', () => {
  it('sin respuesta, se responde como siempre', () => {
    expect(
      queHacerConLaPendiente({ respuesta: '', respondido_en: null, evaluacion_fallida: false }, RESPONDIDA),
    ).toBe('responder')
  })

  it('con respuesta reciente, se espera sin reenviar', () => {
    const pendiente = { respuesta: 'Mi respuesta', respondido_en: RESPONDIDA, evaluacion_fallida: false }
    expect(queHacerConLaPendiente(pendiente, despues(20_000))).toBe('esperar')
  })

  it('marcada como fallida, se ofrece reintentar al instante', () => {
    const pendiente = { respuesta: 'Mi respuesta', respondido_en: RESPONDIDA, evaluacion_fallida: true }
    expect(queHacerConLaPendiente(pendiente, despues(1_000))).toBe('fallo')
  })

  it('sin evaluación ni marca pasado el plazo, la petición murió: fallo', () => {
    const pendiente = { respuesta: 'Mi respuesta', respondido_en: RESPONDIDA, evaluacion_fallida: false }
    expect(queHacerConLaPendiente(pendiente, despues(ESPERA_MAXIMA_MS + 1))).toBe('fallo')
  })

  it('el borde exacto del plazo ya es fallo; un instante antes, todavía se espera', () => {
    const pendiente = { respuesta: 'Mi respuesta', respondido_en: RESPONDIDA, evaluacion_fallida: false }
    expect(queHacerConLaPendiente(pendiente, despues(ESPERA_MAXIMA_MS))).toBe('fallo')
    expect(queHacerConLaPendiente(pendiente, despues(ESPERA_MAXIMA_MS - 1))).toBe('esperar')
  })
})

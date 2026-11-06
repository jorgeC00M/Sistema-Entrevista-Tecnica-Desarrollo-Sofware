import { describe, expect, it } from 'vitest'

import { reconstruirChat } from '@/features/entrevista/chat'

const respondida = (numero: number) => ({ numero, pregunta: `P${numero}`, respuesta: `R${numero}` })

describe('reconstruirChat', () => {
  it('los respondidos en orden y la pendiente al final, sin respuesta', () => {
    const chat = reconstruirChat(
      [respondida(1), respondida(2), { numero: 3, pregunta: 'P3', respuesta: '' }],
      { numero: 3, texto: 'P3', respuesta: '' },
    )

    expect(chat.map((m) => `${m.autor}:${m.texto}`)).toEqual([
      'sistema:P1',
      'usuario:R1',
      'sistema:P2',
      'usuario:R2',
      'sistema:P3',
    ])
  })

  it('una pendiente con respuesta guardada aparece una sola vez, con su respuesta', () => {
    const chat = reconstruirChat(
      [respondida(1), { numero: 2, pregunta: 'P2', respuesta: 'R2 guardada' }],
      { numero: 2, texto: 'P2', respuesta: 'R2 guardada' },
    )

    expect(chat.filter((m) => m.texto === 'P2')).toHaveLength(1)
    expect(chat.at(-1)).toEqual({ autor: 'usuario', texto: 'R2 guardada' })
  })

  it('sin pendiente (todo respondido) quedan solo los turnos', () => {
    expect(reconstruirChat([respondida(1)], null)).toHaveLength(2)
  })
})

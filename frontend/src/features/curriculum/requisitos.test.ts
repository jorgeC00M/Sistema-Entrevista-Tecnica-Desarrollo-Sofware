import { describe, expect, it } from 'vitest'

import { requisitosPorEstado } from '@/features/curriculum/requisitos'
import type { EstadoDeRequisito, GrupoDeRequisitos } from '@/types/curriculum'

function grupo(...requisitos: [string, EstadoDeRequisito][]): GrupoDeRequisitos {
  const lista = requisitos.map(([termino, estado]) => ({ termino, estado }))
  const cubiertos = lista.filter((r) => r.estado !== 'ausente').length
  return { requisitos: lista, cubiertos, cobertura: `${cubiertos}/${lista.length}` }
}

const terminos = (lista: { requisito: { termino: string } }[]) => lista.map(({ requisito }) => requisito.termino)

describe('requisitosPorEstado', () => {
  it('reparte por estado con los obligatorios primero', () => {
    const { coinciden, noDetectados } = requisitosPorEstado({
      separada: true,
      obligatorios: grupo(['Django', 'demostrado'], ['Docker', 'ausente']),
      deseables: grupo(['Git', 'declarado'], ['Redis', 'ausente']),
    })

    expect(terminos(coinciden)).toEqual(['Django', 'Git'])
    expect(terminos(noDetectados)).toEqual(['Docker', 'Redis'])
    expect(noDetectados.map(({ tipo }) => tipo)).toEqual(['obligatorio', 'deseable'])
  })

  it('declarado y presente cuentan como coincidencia', () => {
    const { coinciden, noDetectados } = requisitosPorEstado({
      separada: true,
      obligatorios: grupo(['Git', 'declarado'], ['SQL', 'presente']),
      deseables: grupo(),
    })

    expect(terminos(coinciden)).toEqual(['Git', 'SQL'])
    expect(noDetectados).toEqual([])
  })

  it('sin separar el aviso no inventa el tipo', () => {
    const { coinciden, noDetectados } = requisitosPorEstado({
      separada: false,
      obligatorios: grupo(['Django', 'demostrado'], ['Docker', 'ausente']),
      deseables: grupo(),
    })

    expect([...coinciden, ...noDetectados].map(({ tipo }) => tipo)).toEqual([null, null])
  })
})

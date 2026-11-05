import { describe, expect, it } from 'vitest'

import { normalizarParaBuscar } from '@/lib/texto'
import { entrevista } from '@/test/entrevistaDePrueba'
import type { Entrevista } from '@/types/entrevista'

import { filtrarEntrevistas, nivelDesdeURL } from './historial'

const LISTA = [
  entrevista(1, 'Backend', 'Django', 'Junior'),
  entrevista(2, 'Frontend', 'React', 'Senior', { estado: 'abandonada', convocatoria: true }),
  entrevista(3, 'Móvil', 'Flutter', 'Senior', { estado: 'en_progreso' }),
  entrevista(4, 'Backend', 'Spring Boot', 'Senior', { convocatoria: true }),
]

const ids = (lista: Entrevista[]) => lista.map((e) => e.id)

describe('normalizarParaBuscar', () => {
  it('quita tildes, mayúsculas y espacios de los extremos', () => {
    expect(normalizarParaBuscar('  Desarrollador MÓVIL ')).toBe('desarrollador movil')
  })
})

describe('filtrarEntrevistas', () => {
  it('sin texto ni filtros no filtra', () => {
    expect(ids(filtrarEntrevistas(LISTA, '   '))).toEqual([1, 2, 3, 4])
  })

  it('busca por tecnología', () => {
    expect(ids(filtrarEntrevistas(LISTA, 'django'))).toEqual([1])
  })

  it('no distingue mayúsculas ni tildes', () => {
    expect(ids(filtrarEntrevistas(LISTA, 'SENIOR'))).toEqual([2, 3, 4])
    expect(ids(filtrarEntrevistas(LISTA, 'movil'))).toEqual([3])
  })

  it('filtra por nivel', () => {
    expect(ids(filtrarEntrevistas(LISTA, '', 'senior'))).toEqual([2, 3, 4])
    expect(ids(filtrarEntrevistas(LISTA, '', 'junior'))).toEqual([1])
  })

  it('combina texto y nivel', () => {
    expect(ids(filtrarEntrevistas(LISTA, 'backend', 'senior'))).toEqual([4])
    expect(ids(filtrarEntrevistas(LISTA, 'react', 'junior'))).toEqual([])
  })

  it('no filtra por estado: en curso y abandonadas siguen en la lista', () => {
    expect(ids(filtrarEntrevistas(LISTA, 'senior'))).toEqual([2, 3, 4])
  })

  it('una entrevista sin tecnología no rompe la búsqueda', () => {
    const sinTecnologia = [entrevista(9, 'Backend', null, 'Junior')]
    expect(ids(filtrarEntrevistas(sinTecnologia, 'backend'))).toEqual([9])
  })
})

describe('nivelDesdeURL', () => {
  const CODIGOS = ['junior', 'semi_senior', 'senior']

  it.each([
    ['junior', 'junior'],
    ['semi_senior', 'semi_senior'],
    ['experto', 'todos'],
    [null, 'todos'],
  ])('nivel «%s» es %s', (valor, esperado) => {
    expect(nivelDesdeURL(valor, CODIGOS)).toBe(esperado)
  })
})

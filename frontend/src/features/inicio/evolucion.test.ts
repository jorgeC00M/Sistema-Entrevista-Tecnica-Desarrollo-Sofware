import { describe, expect, it } from 'vitest'

import { entrevista } from '@/test/entrevistaDePrueba'

import { evolucionPorNivel, marcasDelEje, resumenDeSerie } from './evolucion'

const NIVELES = [
  { codigo: 'junior', nombre: 'Junior' },
  { codigo: 'semi_senior', nombre: 'Semi-Senior' },
  { codigo: 'senior', nombre: 'Senior' },
]
const PUESTOS = ['frontend', 'backend', 'full_stack', 'movil', 'escritorio', 'qa', 'videojuegos']

describe('evolucionPorNivel', () => {
  it('siempre devuelve los tres niveles en orden, aunque estén vacíos', () => {
    const evolucion = evolucionPorNivel([entrevista(1, 'Backend', 'Django', 'Junior')], NIVELES, PUESTOS)

    expect(evolucion.map((n) => n.etiqueta)).toEqual(['Junior', 'Semi-Senior', 'Senior'])
    expect(evolucion.map((n) => n.series.length)).toEqual([1, 0, 0])
  })

  it('agrupa por puesto dentro del nivel, en el orden del catálogo', () => {
    const [junior] = evolucionPorNivel(
      [entrevista(1, 'Backend', 'Django', 'Junior'), entrevista(2, 'Frontend', 'React', 'Junior')],
      NIVELES,
      PUESTOS,
    )

    expect(junior.series.map((s) => s.puesto)).toEqual(['frontend', 'backend'])
  })

  it('solo usa las finalizadas con nota', () => {
    const [junior] = evolucionPorNivel(
      [
        entrevista(1, 'Backend', 'Django', 'Junior'),
        entrevista(2, 'Backend', 'Django', 'Junior', { estado: 'abandonada', nota: null, fin: null }),
        entrevista(3, 'Backend', 'Django', 'Junior', { estado: 'en_progreso', nota: null, fin: null }),
      ],
      NIVELES,
      PUESTOS,
    )

    expect(junior.series[0].puntos.map((p) => p.entrevistaId)).toEqual([1])
  })

  it('numera 1..n por serie en orden de finalización y muestra la variación', () => {
    // Llegan de la más reciente a la más antigua, como las entrega la API.
    const [junior] = evolucionPorNivel(
      [
        entrevista(2, 'Backend', 'Django', 'Junior', { nota: 83, fin: '2026-10-20T10:00:00Z' }),
        entrevista(1, 'Backend', 'Django', 'Junior', { nota: 42, fin: '2026-10-10T10:00:00Z' }),
      ],
      NIVELES,
      PUESTOS,
    )

    const puntos = junior.series[0].puntos
    expect(puntos.map((p) => [p.numero, p.entrevistaId, p.nota])).toEqual([
      [1, 1, 42],
      [2, 2, 83],
    ])
    expect(resumenDeSerie(junior.series[0])).toBe('Backend: de 42 a 83 en 2 entrevistas')
  })

  it('marca el salto de más de 90 días, no el de 90', () => {
    const [junior] = evolucionPorNivel(
      [
        entrevista(1, 'Backend', 'Django', 'Junior', { fin: '2026-01-01T10:00:00Z' }),
        entrevista(2, 'Backend', 'Django', 'Junior', { fin: '2026-04-01T10:00:00Z' }),
        entrevista(3, 'Backend', 'Django', 'Junior', { fin: '2026-07-01T10:00:00Z' }),
      ],
      NIVELES,
      PUESTOS,
    )

    const puntos = junior.series[0].puntos
    expect(puntos.map((p) => p.diasDesdeAnterior)).toEqual([null, 90, 91])
    expect(puntos.map((p) => p.saltoAntes)).toEqual([false, false, true])
  })

  it('no distingue el origen y trae la tecnología de cada punto', () => {
    const [junior] = evolucionPorNivel(
      [
        entrevista(1, 'Backend', 'Django', 'Junior', { convocatoria: true, fin: '2026-10-01T10:00:00Z' }),
        entrevista(2, 'Backend', null, 'Junior', { fin: '2026-10-02T10:00:00Z' }),
      ],
      NIVELES,
      PUESTOS,
    )

    // Personalizada o desde convocatoria: la misma serie, numerada en orden.
    const puntos = junior.series[0].puntos
    expect(puntos.map((p) => [p.numero, p.tecnologia])).toEqual([
      [1, 'Django'],
      [2, null],
    ])
  })
})

describe('marcasDelEje', () => {
  it('rotula todas hasta 8', () => {
    expect(marcasDelEje(5)).toEqual([1, 2, 3, 4, 5])
    expect(marcasDelEje(8)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('con más de 8, la primera, las múltiplos de 5 y la última', () => {
    expect(marcasDelEje(12)).toEqual([1, 5, 10, 12])
    expect(marcasDelEje(15)).toEqual([1, 5, 10, 15])
  })

  it('sin entrevistas, ninguna', () => {
    expect(marcasDelEje(0)).toEqual([])
  })
})

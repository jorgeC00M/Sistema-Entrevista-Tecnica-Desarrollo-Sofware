import { describe, expect, it } from 'vitest'

import { normalizarParaBuscar } from '@/lib/texto'
import type { Entrevista, EstadoEntrevista } from '@/types/entrevista'

import {
  evolucionPorNivel,
  filtrarEntrevistas,
  marcasDelEje,
  nivelDesdeURL,
  resumenDeSerie,
} from './historial'

interface Opciones {
  estado?: EstadoEntrevista
  convocatoria?: boolean
  nota?: number | null
  fin?: string | null
}

function entrevista(
  id: number,
  puesto: string,
  tecnologia: string | null,
  nivel: string,
  { estado = 'finalizada', convocatoria = false, nota = 75, fin = '2026-10-21T10:00:00Z' }: Opciones = {},
): Entrevista {
  return {
    id,
    puesto: normalizarParaBuscar(puesto).replace(' ', '_'),
    puesto_display: puesto,
    nivel: normalizarParaBuscar(nivel).replace('-', '_'),
    nivel_display: nivel,
    tecnologia: tecnologia ? tecnologia.toLowerCase() : null,
    segunda_tecnologia: null,
    tecnologia_display: tecnologia,
    estado,
    estado_display: estado,
    fecha_inicio: fin ?? '2026-10-21T09:00:00Z',
    fecha_fin: fin,
    puntuacion_promedio: nota,
    fecha_limite: '2026-01-01T00:30:00Z',
    ahora: '2026-01-01T00:00:00Z',
    preguntas_calificadas: 5,
    preguntas_previstas: 5,
    desde_convocatoria: convocatoria,
  }
}

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

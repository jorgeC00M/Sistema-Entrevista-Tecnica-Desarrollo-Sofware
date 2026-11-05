import { describe, expect, it } from 'vitest'

import { entrevista } from '@/test/entrevistaDePrueba'
import type { Nivel } from '@/types/catalogos'
import type { CurriculumEnLista, RevisionIA } from '@/types/curriculum'
import type { BandaDeRubrica } from '@/types/evaluacion'
import type { Entrevista, ResumenEntrevista } from '@/types/entrevista'

import {
  type DatosDelSiguientePaso,
  cifrasDeResumen,
  siguientePaso,
  tiempoDePractica,
  ultimaFinalizada,
  ultimaTerminada,
} from './inicio'

const NIVELES: Nivel[] = [
  { codigo: 'junior', nombre: 'Junior', descripcion: 'Inicial' },
  { codigo: 'semi_senior', nombre: 'Semi-Senior', descripcion: 'Intermedio' },
  { codigo: 'senior', nombre: 'Senior', descripcion: 'Avanzado' },
]

/** Una entrevista con inicio y fin concretos, para medir su duración. */
function conDuracion(base: Entrevista, inicio: string, fin: string | null): Entrevista {
  return { ...base, fecha_inicio: inicio, fecha_fin: fin }
}

function cv(id: number, conConvocatoria: boolean): CurriculumEnLista {
  return {
    id,
    nombre_archivo: `cv-${id}.pdf`,
    fecha: '2026-10-20T10:00:00Z',
    parseabilidad: '6/8',
    veredicto: 'legible',
    con_convocatoria: conConvocatoria,
  }
}

function resumen(banda: BandaDeRubrica, area = 'Bases de Datos'): ResumenEntrevista {
  return {
    promedio: 67,
    banda,
    banda_display: banda,
    criterios: null,
    criterios_sobre: 0,
    criterio_mas_debil: null,
    prioridad: { numero: 3, area: 'bases_de_datos', area_display: area, puntuacion: 42, sugerencia: 's' },
    comparacion: null,
  }
}

function datos(cambios: Partial<DatosDelSiguientePaso>): DatosDelSiguientePaso {
  return {
    enCurso: null,
    entrevistas: [],
    hayCv: false,
    revisionDelUltimoCv: null,
    resumenDeLaUltima: null,
    niveles: NIVELES,
    ...cambios,
  }
}

describe('cifrasDeResumen', () => {
  it('cuenta las sin terminar aparte y el tiempo solo de las finalizadas', () => {
    const lista = [
      conDuracion(entrevista(1, 'Backend', 'Django', 'Junior'), '2026-10-20T10:00:00Z', '2026-10-20T10:25:00Z'),
      conDuracion(entrevista(2, 'Backend', 'Django', 'Junior'), '2026-10-21T10:00:00Z', '2026-10-21T10:15:00Z'),
      conDuracion(
        entrevista(3, 'Frontend', 'React', 'Junior', { estado: 'tiempo_agotado', nota: null }),
        '2026-10-22T10:00:00Z',
        '2026-10-22T10:30:00Z',
      ),
      entrevista(4, 'QA', 'Cypress', 'Junior', { estado: 'abandonada', nota: null }),
      entrevista(5, 'Móvil', 'Flutter', 'Junior', { estado: 'en_progreso', nota: null, fin: null }),
    ]

    const cifras = cifrasDeResumen(lista, [cv(1, false), cv(2, false), cv(3, true)])

    expect(cifras.finalizadas).toBe(2)
    expect(cifras.sinTerminar).toBe(2)
    // 25 + 15 min: la de tiempo agotado no suma sus 30 min.
    expect(cifras.segundosDePractica).toBe(40 * 60)
    // 5 por cada terminada (el armador pone 5); la en curso no cuenta.
    expect(cifras.preguntas).toBe(20)
    expect(cifras).toMatchObject({ analisis: 3, generales: 2, conOferta: 1 })
  })

  it('usuario nuevo: todo en cero', () => {
    expect(cifrasDeResumen([], [])).toEqual({
      finalizadas: 0,
      sinTerminar: 0,
      preguntas: 0,
      segundosDePractica: 0,
      analisis: 0,
      generales: 0,
      conOferta: 0,
    })
  })

  it('el tiempo se lee en minutos y horas', () => {
    expect(tiempoDePractica(0)).toBe('0 min')
    expect(tiempoDePractica(45 * 60)).toBe('45 min')
    expect(tiempoDePractica(100 * 60)).toBe('1 h 40 min')
    expect(tiempoDePractica(120 * 60)).toBe('2 h')
  })
})

describe('última terminada y última finalizada', () => {
  it('la última por fecha de fin, con empates por id; sin fin cuenta el inicio', () => {
    const vieja = entrevista(1, 'Backend', 'Django', 'Junior', { fin: '2026-10-20T10:00:00Z' })
    const empate = entrevista(2, 'Frontend', 'React', 'Junior', { fin: '2026-10-21T10:00:00Z' })
    const empateMayor = entrevista(3, 'QA', 'Cypress', 'Junior', { fin: '2026-10-21T10:00:00Z' })
    const sinFin = { ...entrevista(4, 'Móvil', 'Flutter', 'Junior', { estado: 'abandonada', nota: null }), fecha_fin: null, fecha_inicio: '2026-10-22T10:00:00Z' }

    expect(ultimaTerminada([vieja, empate, empateMayor, sinFin])?.id).toBe(4)
    expect(ultimaFinalizada([vieja, empate, empateMayor, sinFin])?.id).toBe(3)
  })
})

describe('siguientePaso', () => {
  const finalizada = entrevista(1, 'Backend', 'Django', 'Junior')

  it('1. con una en curso, continuarla con sus minutos', () => {
    const paso = siguientePaso(
      datos({ enCurso: { id: 9, puestoDisplay: 'Backend', segundosRestantes: 18 * 60 }, entrevistas: [finalizada] }),
    )
    expect(paso).toMatchObject({
      tipo: 'continuar',
      frase: 'Tienes una entrevista de Backend en curso · quedan 18 min',
      ruta: '/entrevista/9',
    })
  })

  it('2. sin CV ni entrevistas, empezar por el CV', () => {
    expect(siguientePaso(datos({}))).toMatchObject({ tipo: 'analizarCv', ruta: '/mi-cv/analisis' })
  })

  it('3. con CV y sin entrevistas, la primera con el puesto sugerido', () => {
    const revision = { puesto_sugerido: 'backend' } as RevisionIA
    expect(siguientePaso(datos({ hayCv: true, revisionDelUltimoCv: revision }))).toMatchObject({
      tipo: 'primera',
      ruta: '/simular-entrevista?puesto=backend',
    })
  })

  it('4. si la última terminada no se completó, intentarla de nuevo', () => {
    const agotada = entrevista(2, 'Frontend', 'React', 'Senior', {
      estado: 'tiempo_agotado',
      nota: null,
      fin: '2026-10-22T10:00:00Z',
    })
    const paso = siguientePaso(datos({ entrevistas: [finalizada, agotada], resumenDeLaUltima: resumen('solido') }))
    expect(paso).toMatchObject({
      tipo: 'reintentar',
      frase: 'Tu última entrevista no se completó: inténtala de nuevo',
      ruta: '/simular-entrevista?puesto=frontend&nivel=senior',
    })
  })

  it('5. con «Sólido» y un nivel más, subir', () => {
    const paso = siguientePaso(datos({ entrevistas: [finalizada], resumenDeLaUltima: resumen('solido') }))
    expect(paso).toMatchObject({
      tipo: 'subir',
      frase: 'Sube a Semi-Senior en Backend',
      ruta: '/simular-entrevista?puesto=backend&nivel=semi_senior',
    })
  })

  it('6. si no, repasar el área más baja en el mismo puesto y nivel', () => {
    const paso = siguientePaso(datos({ entrevistas: [finalizada], resumenDeLaUltima: resumen('en_desarrollo') }))
    expect(paso).toMatchObject({
      tipo: 'repasar',
      frase: 'Repasa Bases de Datos, tu punto más bajo en Backend Junior',
      ruta: '/simular-entrevista?puesto=backend&nivel=junior',
    })
  })

  it('«Sólido» en el último nivel no sube: repasa', () => {
    const senior = entrevista(1, 'Backend', 'Django', 'Senior')
    expect(siguientePaso(datos({ entrevistas: [senior], resumenDeLaUltima: resumen('solido') })).tipo).toBe('repasar')
  })

  it('sin el reporte de la última, practicar el mismo puesto y nivel', () => {
    expect(siguientePaso(datos({ entrevistas: [finalizada] }))).toMatchObject({
      tipo: 'repasar',
      frase: 'Vuelve a practicar Backend Junior',
      ruta: '/simular-entrevista?puesto=backend&nivel=junior',
    })
  })
})

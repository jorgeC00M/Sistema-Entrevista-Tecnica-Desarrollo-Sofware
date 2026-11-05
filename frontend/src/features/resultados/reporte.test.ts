import { describe, expect, it } from 'vitest'

import type { Nivel } from '@/types/catalogos'
import type { Entrevista, Intercambio, ResumenEntrevista } from '@/types/entrevista'

import {
  consejoDeComunicacion,
  fortalezasYDebilidades,
  practicaRecomendada,
  primeraFrase,
  temasARepasar,
  veredictoPorReglas,
} from './reporte'

function intercambio(numero: number, puntuacion: number | null): Intercambio {
  return {
    numero,
    area: 'bases_de_datos',
    area_display: `Tema ${numero}`,
    pregunta: `Pregunta ${numero}`,
    respuesta: puntuacion === null ? '' : `Respuesta ${numero}`,
    tiempo_respuesta: null,
    evaluacion:
      puntuacion === null
        ? null
        : {
            puntuacion,
            banda: 'aceptable',
            niveles: null,
            version_rubrica: 2,
            fortalezas: `Fortaleza ${numero}. Otra cosa.`,
            debilidades: `Debilidad ${numero}. Otra cosa.`,
            sugerencias: `Sugerencia ${numero}`,
            puntos_clave: [`Punto ${numero}`],
          },
  }
}

const NIVELES: Nivel[] = [
  { codigo: 'junior', nombre: 'Junior' },
  { codigo: 'semi_senior', nombre: 'Semi-Senior' },
  { codigo: 'senior', nombre: 'Senior' },
] as Nivel[]

function entrevista(nivel: string): Entrevista {
  return { puesto: 'backend', puesto_display: 'Desarrollador Backend', nivel, nivel_display: nivel } as Entrevista
}

describe('primeraFrase', () => {
  it('corta en el primer punto seguido de espacio', () => {
    expect(primeraFrase('Bien explicado. Faltó un ejemplo.')).toBe('Bien explicado.')
  })
  it('sin punto devuelve el texto entero', () => {
    expect(primeraFrase('  Usa Node.js con criterio  ')).toBe('Usa Node.js con criterio')
  })
})

describe('fortalezasYDebilidades', () => {
  it('toma las 2 mejores y las 2 peores; los empates por número menor', () => {
    const lista = [intercambio(1, 75), intercambio(2, 50), intercambio(3, 92), intercambio(4, 50), intercambio(5, 92)]
    expect(fortalezasYDebilidades(lista)).toEqual({
      fortalezas: ['Fortaleza 3.', 'Fortaleza 5.'],
      debilidades: ['Debilidad 2.', 'Debilidad 4.'],
    })
  })
  it('una evaluación sin nota no entra: solo las de una finalizada', () => {
    const sinNota = { ...intercambio(2, 92), evaluacion: { fortalezas: 'F.', debilidades: 'D.', sugerencias: 'S.' } }
    expect(fortalezasYDebilidades([intercambio(1, 67), sinNota])).toEqual({
      fortalezas: ['Fortaleza 1.'],
      debilidades: ['Debilidad 1.'],
    })
  })
})

describe('temasARepasar', () => {
  it('son las 2 respuestas más bajas, con lo que debían cubrir', () => {
    const temas = temasARepasar([intercambio(1, 75), intercambio(2, 42), intercambio(3, 58)])
    expect(temas.map((t) => [t.numero, t.puntos])).toEqual([
      [2, ['Punto 2']],
      [3, ['Punto 3']],
    ])
  })
})

describe('consejoDeComunicacion', () => {
  it('con claridad propone contexto, acción y resultado', () => {
    expect(consejoDeComunicacion('claridad')).toMatch(/contexto.*resultado/)
  })
  it('sin criterio (evaluaciones antiguas) da el de claridad', () => {
    expect(consejoDeComunicacion(null)).toBe(consejoDeComunicacion('claridad'))
  })
})

describe('practicaRecomendada', () => {
  it('con «Sólido» en Junior sugiere el nivel siguiente', () => {
    expect(practicaRecomendada(entrevista('junior'), 'solido', NIVELES)).toMatchObject({
      nivel: 'semi_senior',
      subeDeNivel: true,
    })
  })
  it('con «Sólido» en Senior se queda en Senior', () => {
    expect(practicaRecomendada(entrevista('senior'), 'solido', NIVELES)).toMatchObject({
      nivel: 'senior',
      subeDeNivel: false,
    })
  })
  it('con otra banda repite el mismo nivel', () => {
    expect(practicaRecomendada(entrevista('junior'), 'aceptable', NIVELES).nivel).toBe('junior')
  })
  it('sin catálogo repite el mismo nivel', () => {
    expect(practicaRecomendada(entrevista('junior'), 'solido', []).subeDeNivel).toBe(false)
  })
})

describe('veredictoPorReglas', () => {
  it('nombra la banda, el criterio más bajo y el tema prioritario', () => {
    const resumen = {
      banda_display: 'Aceptable',
      criterio_mas_debil: { codigo: 'completitud', nombre: 'Completitud' },
      prioridad: { area_display: 'Bases de Datos' },
    } as ResumenEntrevista
    expect(veredictoPorReglas(resumen)).toBe(
      'Tu desempeño fue aceptable. Tu criterio más bajo fue profundidad (completitud). Prioriza repasar Bases de Datos.',
    )
  })
})

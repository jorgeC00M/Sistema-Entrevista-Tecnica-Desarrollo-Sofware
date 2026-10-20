import { describe, expect, it } from 'vitest'

import {
  CODIGO_SIN_CAPA_DE_TEXTO,
  SEVERIDADES,
  debilidadesPorGravedad,
  correccionesMedidas,
  esIlegible,
  sugerenciasDeIA,
} from '@/features/curriculum/hallazgos'
import type { Hallazgo, Severidad } from '@/types/curriculum'

function hallazgo(codigo: string, severidad: Severidad): Hallazgo {
  return { codigo, severidad, titulo: codigo, detalle: '', favorable: false }
}

describe('debilidadesPorGravedad', () => {
  it('pone primero las críticas y al final las informativas', () => {
    const lista = [hallazgo('a', 'media'), hallazgo('b', 'critica'), hallazgo('c', 'info'), hallazgo('d', 'alta')]

    expect(debilidadesPorGravedad(lista).map((h) => h.codigo)).toEqual(['b', 'd', 'a', 'c'])
  })

  it('conserva el orden del backend entre las de igual gravedad', () => {
    const lista = [hallazgo('primera', 'alta'), hallazgo('critica', 'critica'), hallazgo('segunda', 'alta')]

    expect(debilidadesPorGravedad(lista).map((h) => h.codigo)).toEqual(['critica', 'primera', 'segunda'])
  })

  it('no modifica la lista recibida', () => {
    const lista = [hallazgo('a', 'media'), hallazgo('b', 'critica')]

    debilidadesPorGravedad(lista)

    expect(lista.map((h) => h.codigo)).toEqual(['a', 'b'])
  })

  it('devuelve una lista vacía si no hay debilidades', () => {
    expect(debilidadesPorGravedad([])).toEqual([])
  })
})

describe('esIlegible', () => {
  it('reconoce el CV sin capa de texto por el código que emite el backend', () => {
    expect(CODIGO_SIN_CAPA_DE_TEXTO).toBe('sin_capa_de_texto')
    expect(esIlegible({ debilidades: [hallazgo(CODIGO_SIN_CAPA_DE_TEXTO, 'critica')] })).toBe(true)
  })

  it('no confunde un CV legible con problemas graves', () => {
    expect(esIlegible({ debilidades: [hallazgo('dos_columnas', 'critica'), hallazgo('sin_correo', 'alta')] })).toBe(
      false,
    )
  })
})

describe('SEVERIDADES', () => {
  it('nombra cada gravedad por su efecto sobre el ATS', () => {
    expect(SEVERIDADES.critica.etiqueta).toBe('Impide la lectura')
    expect(SEVERIDADES.alta.etiqueta).toBe('Resta visibilidad')
    expect(SEVERIDADES.media.etiqueta).toBe('Detalle')
    expect(SEVERIDADES.info.etiqueta).toBe('')
  })
})

describe('correccionesMedidas y sugerenciasDeIA', () => {
  const debilidades = [hallazgo('a', 'critica'), hallazgo('b', 'alta')]
  const vinetas = { total: 5, logros: 2, proporcion: '2/5', sin_resultado: ['x', 'y', 'z'] }
  const revision_ia = {
    estado: 'ok' as const,
    motivo: '',
    vinetas: [],
    requisitos: [],
    preguntas: [],
    puesto_sugerido: null,
    correcciones: [{ original: 'a', sugerido: 'b', tipo: 'ortografia' as const }],
  }

  it('cuenta lo medido sin la IA y la IA aparte, sin sumarlas', () => {
    expect(correccionesMedidas({ debilidades, vinetas })).toBe(5)
    expect(sugerenciasDeIA({ revision_ia })).toBe(1)
  })

  it('sin viñetas ni revisión', () => {
    expect(correccionesMedidas({ debilidades: [hallazgo('a', 'media')], vinetas: null })).toBe(1)
    expect(sugerenciasDeIA({ revision_ia: null })).toBe(0)
  })
})

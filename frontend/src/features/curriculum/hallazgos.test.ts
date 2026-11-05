import { describe, expect, it } from 'vitest'

import {
  CAMPOS_CLAVE,
  CAMPOS_QUE_BUSCA_EL_ATS,
  CODIGO_SIN_CAPA_DE_TEXTO,
  SEVERIDADES,
  accionDe,
  debilidadesPorGravedad,
  correccionesPrioritarias,
  esIlegible,
  estadoDelCampo,
  tipoDeRevision,
  puedeAnalizar,
  rutaDelAnalisis,
  VEREDICTOS,
  veredictoDeLegibilidad,
} from '@/features/curriculum/hallazgos'
import type { CampoDelEspejo, Hallazgo, Severidad } from '@/types/curriculum'

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

describe('veredictoDeLegibilidad', () => {
  // Los mismos casos que `EstadoDelCvTest` en el backend.
  function campos(sin: string[] = [], incompletos: string[] = []): CampoDelEspejo[] {
    return CAMPOS_QUE_BUSCA_EL_ATS.map((nombre) => ({
      nombre,
      detectado: !sin.includes(nombre),
      valor: '',
      nota: '',
      incompleto: incompletos.includes(nombre),
    }))
  }

  it('sin un dato clave son pérdidas importantes', () => {
    expect(veredictoDeLegibilidad({ campos: campos(['Correo']) })).toBe('perdidas_importantes')
  })

  it('sin un dato que no es clave es legible con pérdidas', () => {
    expect(veredictoDeLegibilidad({ campos: campos(['Ubicación']) })).toBe('legible_con_perdidas')
  })

  it('un dato incompleto es legible con pérdidas', () => {
    expect(veredictoDeLegibilidad({ campos: campos([], ['Experiencia']) })).toBe('legible_con_perdidas')
  })

  it('todo completo es legible, también sin `incompleto` (reglas anteriores)', () => {
    expect(veredictoDeLegibilidad({ campos: campos() })).toBe('legible')
    expect(
      veredictoDeLegibilidad({ campos: campos().map(({ nombre, detectado, valor, nota }) => ({ nombre, detectado, valor, nota })) }),
    ).toBe('legible')
  })
})

describe('estadoDelCampo', () => {
  it('distingue extraído, incompleto y no extraído', () => {
    expect(estadoDelCampo({ detectado: true })).toBe('extraido')
    expect(estadoDelCampo({ detectado: true, incompleto: true })).toBe('incompleto')
    expect(estadoDelCampo({ detectado: false, incompleto: true })).toBe('no_extraido')
  })
})

describe('CAMPOS_CLAVE', () => {
  it('son el contacto, la experiencia y las habilidades, como en el backend', () => {
    expect(CAMPOS_CLAVE).toEqual(['Nombre', 'Correo', 'Teléfono', 'Experiencia', 'Habilidades'])
  })
})

describe('correccionesPrioritarias', () => {
  it('da las tres más graves, en orden de gravedad', () => {
    const prioritarias = correccionesPrioritarias([
      hallazgo('formato', 'media'),
      hallazgo('dos_columnas', 'alta'),
      hallazgo('texto_en_encabezado', 'critica'),
      hallazgo('fechas', 'media'),
    ])

    expect(prioritarias.map((h) => h.codigo)).toEqual(['texto_en_encabezado', 'dos_columnas', 'formato'])
  })
})

describe('accionDe', () => {
  it('usa la acción como título', () => {
    expect(accionDe({ titulo: 'Tu CV está maquetado a dos columnas', accion: 'Pásalo a una sola columna' })).toBe(
      'Pásalo a una sola columna',
    )
  })

  it('sin acción, en un análisis anterior, usa el diagnóstico', () => {
    expect(accionDe({ titulo: 'Tu CV está maquetado a dos columnas' })).toBe('Tu CV está maquetado a dos columnas')
    expect(accionDe({ titulo: 'Tu CV tiene 3 páginas', accion: '' })).toBe('Tu CV tiene 3 páginas')
  })
})

describe('tipoDeRevision', () => {
  it('nombra igual cada tipo de análisis', () => {
    expect(tipoDeRevision(false)).toBe('Análisis general')
    expect(tipoDeRevision(true)).toBe('Análisis dirigido')
  })
})

describe('rutaDelAnalisis', () => {
  it('lleva cada tipo a su entrada', () => {
    expect(rutaDelAnalisis(false)).toBe('/mi-cv/analisis')
    expect(rutaDelAnalisis(true)).toBe('/mi-cv/oferta')
  })

  it('y cada resultado a la ruta de su tipo', () => {
    expect(rutaDelAnalisis(false, 7)).toBe('/mi-cv/analisis/7')
    expect(rutaDelAnalisis(true, 7)).toBe('/mi-cv/oferta/7')
  })
})

describe('puedeAnalizar', () => {
  const cv = new File(['%PDF'], 'cv.pdf')
  const aviso = new File(['%PDF'], 'aviso.pdf')

  it('sin CV no se puede, ni en el dirigido sin aviso', () => {
    expect(puedeAnalizar('general', null, '', null)).toBe(false)
    expect(puedeAnalizar('dirigido', null, 'Backend Django', aviso)).toBe(false)
    expect(puedeAnalizar('dirigido', cv, '   ', null)).toBe(false)
  })

  it('en el general basta el CV, aunque haya un aviso cargado', () => {
    expect(puedeAnalizar('general', cv, '', null)).toBe(true)
    expect(puedeAnalizar('general', cv, 'Backend Django', aviso)).toBe(true)
  })

  it('en el dirigido vale el texto o el archivo del aviso', () => {
    expect(puedeAnalizar('dirigido', cv, 'Backend Django', null)).toBe(true)
    expect(puedeAnalizar('dirigido', cv, '', aviso)).toBe(true)
  })
})

describe('CAMPOS_QUE_BUSCA_EL_ATS', () => {
  it('son los 8 campos de la ficha del backend, en su orden', () => {
    expect(CAMPOS_QUE_BUSCA_EL_ATS).toEqual([
      'Nombre',
      'Correo',
      'Teléfono',
      'Ubicación',
      'Experiencia',
      'Educación',
      'Habilidades',
      'Antigüedad',
    ])
  })
})

describe('VEREDICTOS', () => {
  it('nombra los tres niveles con etiqueta, título, regla e icono', () => {
    expect(Object.keys(VEREDICTOS)).toEqual(['perdidas_importantes', 'legible_con_perdidas', 'legible'])
    for (const aspecto of Object.values(VEREDICTOS)) {
      expect(aspecto.etiqueta).not.toBe('')
      expect(aspecto.titulo).not.toBe('')
      expect(aspecto.regla).not.toBe('')
      expect(aspecto.icono).not.toBe('')
    }
  })
})

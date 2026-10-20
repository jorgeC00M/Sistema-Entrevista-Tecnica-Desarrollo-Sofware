import { describe, expect, it } from 'vitest'

import type { Capa, PuestoConTecnologias } from '@/types/catalogos'

import {
  type AccionDeSeleccion,
  type CatalogoDeSeleccion,
  type Seleccion,
  SELECCION_VACIA,
  agruparPorGrupo,
  campoFaltante,
  capasDe,
  estaCompleta,
  nombreDeTecnologias,
  reducirSeleccion,
} from './seleccion'

/** Recorte del catálogo real (apps/catalogos/datos.py): en un test sí se escribe a mano. */
function puesto(codigo: string, tecnologias: [string, string, Capa?, string?][]): PuestoConTecnologias {
  return {
    codigo,
    nombre: codigo,
    descripcion: '',
    icono: '',
    areas: [],
    tecnologias: tecnologias.map(([c, nombre, capa = '', grupo = '']) => ({ codigo: c, nombre, capa, grupo })),
  }
}

const CATALOGO: CatalogoDeSeleccion = {
  puestos: [
    puesto('backend', [
      ['backend_django', 'Django'],
      ['backend_spring', 'Spring Boot'],
    ]),
    puesto('full_stack', [
      ['fs_react', 'React', 'frontend'],
      ['fs_vue', 'Vue', 'frontend'],
      ['fs_express', 'Express', 'backend'],
      ['fs_laravel', 'Laravel', 'backend'],
    ]),
  ],
  niveles: [
    { codigo: 'junior', nombre: 'Junior', descripcion: 'Inicial' },
    { codigo: 'senior', nombre: 'Senior', descripcion: 'Avanzado' },
  ],
}

const aplicar = (seleccion: Seleccion, ...acciones: AccionDeSeleccion[]) =>
  acciones.reduce((estado, accion) => reducirSeleccion(estado, accion, CATALOGO), seleccion)

const fullStackCompleto = aplicar(
  SELECCION_VACIA,
  { tipo: 'elegirPuesto', codigo: 'full_stack' },
  { tipo: 'elegirTecnologia', capa: 'frontend', codigo: 'fs_react' },
  { tipo: 'elegirTecnologia', capa: 'backend', codigo: 'fs_express' },
  { tipo: 'elegirNivel', codigo: 'junior' },
)

describe('campoFaltante', () => {
  it('vacío pide el puesto', () => {
    expect(campoFaltante(SELECCION_VACIA, CATALOGO)).toBe('puesto')
  })

  it('con puesto pide el nivel, que está en su misma fila', () => {
    expect(campoFaltante(aplicar(SELECCION_VACIA, { tipo: 'elegirPuesto', codigo: 'backend' }), CATALOGO)).toBe('nivel')
  })

  it('con puesto y nivel pide la tecnología', () => {
    const estado = aplicar(
      SELECCION_VACIA,
      { tipo: 'elegirPuesto', codigo: 'backend' },
      { tipo: 'elegirNivel', codigo: 'junior' },
    )

    expect(campoFaltante(estado, CATALOGO)).toBe('tecnologia')
  })

  it('Full Stack con solo frontend sigue pidiendo la tecnología', () => {
    const estado = aplicar(
      SELECCION_VACIA,
      { tipo: 'elegirPuesto', codigo: 'full_stack' },
      { tipo: 'elegirTecnologia', capa: 'frontend', codigo: 'fs_react' },
      { tipo: 'elegirNivel', codigo: 'junior' },
    )

    expect(campoFaltante(estado, CATALOGO)).toBe('tecnologia')
    expect(estaCompleta(estado, CATALOGO)).toBe(false)
  })

  it('con todo elegido no falta nada', () => {
    expect(campoFaltante(fullStackCompleto, CATALOGO)).toBeNull()
    expect(estaCompleta(fullStackCompleto, CATALOGO)).toBe(true)
  })
})

describe('elegir', () => {
  it('ignora códigos que no existen', () => {
    expect(aplicar(SELECCION_VACIA, { tipo: 'elegirPuesto', codigo: 'cocina' })).toEqual(SELECCION_VACIA)
  })

  it('cambiar de puesto descarta la tecnología y conserva el nivel', () => {
    const estado = aplicar(fullStackCompleto, { tipo: 'elegirPuesto', codigo: 'backend' })

    expect(estado).toEqual({ puesto: 'backend', tecnologias: {}, nivel: 'junior' })
  })

  it('volver a elegir el mismo puesto conserva la tecnología', () => {
    expect(aplicar(fullStackCompleto, { tipo: 'elegirPuesto', codigo: 'full_stack' })).toEqual(fullStackCompleto)
  })

  it('"Selecciona…" vacía solo esa capa', () => {
    const estado = aplicar(fullStackCompleto, { tipo: 'elegirTecnologia', capa: 'backend', codigo: '' })

    expect(estado.tecnologias).toEqual({ frontend: 'fs_react' })
  })
})

describe('tecnologías por capa', () => {
  it('un puesto sin capas pide una sola', () => {
    expect(capasDe(CATALOGO.puestos[0])).toEqual([''])
  })

  it('Full Stack pide frontend y backend', () => {
    expect(capasDe(CATALOGO.puestos[1])).toEqual(['frontend', 'backend'])
  })

  it('rechaza una tecnología en la capa equivocada', () => {
    const estado = aplicar(
      SELECCION_VACIA,
      { tipo: 'elegirPuesto', codigo: 'full_stack' },
      { tipo: 'elegirTecnologia', capa: 'frontend', codigo: 'fs_express' },
    )

    expect(estado.tecnologias).toEqual({})
  })

  it('nombra las dos capas en orden: "React + Express"', () => {
    expect(nombreDeTecnologias(fullStackCompleto, CATALOGO.puestos[1])).toBe('React + Express')
  })
})

describe('aplicar (repetir, convocatoria, URL)', () => {
  it('rellena todo', () => {
    const estado = aplicar(SELECCION_VACIA, {
      tipo: 'aplicar',
      puesto: 'full_stack',
      tecnologias: ['fs_vue', 'fs_laravel'],
      nivel: 'senior',
    })

    expect(estado).toEqual({ puesto: 'full_stack', tecnologias: { frontend: 'fs_vue', backend: 'fs_laravel' }, nivel: 'senior' })
    expect(campoFaltante(estado, CATALOGO)).toBeNull()
  })

  it('una tecnología inactiva o ajena se ignora y su campo queda vacío', () => {
    const estado = aplicar(SELECCION_VACIA, {
      tipo: 'aplicar',
      puesto: 'full_stack',
      tecnologias: ['full_stack_react_node', null],
      nivel: 'junior',
    })

    expect(estado.tecnologias).toEqual({})
    expect(campoFaltante(estado, CATALOGO)).toBe('tecnologia')
  })

  it('reemplaza la tecnología actual aunque el puesto sea el mismo', () => {
    const estado = aplicar(fullStackCompleto, { tipo: 'aplicar', puesto: 'full_stack', tecnologias: [], nivel: 'junior' })

    expect(estado.tecnologias).toEqual({})
  })

  it('solo el nivel (?nivel=) conserva el puesto', () => {
    const estado = aplicar(
      SELECCION_VACIA,
      { tipo: 'elegirPuesto', codigo: 'backend' },
      { tipo: 'aplicar', nivel: 'senior' },
    )

    expect(estado).toEqual({ puesto: 'backend', tecnologias: {}, nivel: 'senior' })
  })
})

describe('agruparPorGrupo', () => {
  const backend = puesto('backend', [
    ['django', 'Django', '', 'Python'],
    ['fastapi', 'FastAPI', '', 'Python'],
    ['express', 'Express', '', 'Node.js'],
    ['go', 'Go', '', 'Go'],
  ])

  it('agrupa en bloques consecutivos y en el orden del catálogo', () => {
    const bloques = agruparPorGrupo(backend.tecnologias).map(([grupo, ts]) => [grupo, ts.map((t) => t.nombre)])

    expect(bloques).toEqual([
      ['Python', ['Django', 'FastAPI']],
      ['Node.js', ['Express']],
      ['Go', ['Go']],
    ])
  })

  it('sin grupos devuelve un solo bloque con rótulo vacío', () => {
    expect(agruparPorGrupo(CATALOGO.puestos[0].tecnologias)).toEqual([['', CATALOGO.puestos[0].tecnologias]])
  })

  it('sin tecnologías no devuelve bloques', () => {
    expect(agruparPorGrupo([])).toEqual([])
  })
})

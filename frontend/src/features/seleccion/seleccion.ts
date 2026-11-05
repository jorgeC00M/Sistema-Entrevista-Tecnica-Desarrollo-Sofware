import type { Capa, Nivel, PuestoConTecnologias, TecnologiaDePuesto } from '@/types/catalogos'

/**
 * Estado del formulario "Simular entrevista", en funciones puras (sin React).
 *
 * Tres campos —puesto, tecnología, nivel— y las reglas que los atan: cambiar
 * de puesto vacía la tecnología (era del puesto anterior) y lo que llega de
 * fuera ("Repetir última", la convocatoria, `?puesto=`) se valida contra el
 * catálogo antes de entrar. Vive aquí para poder probarlo sin DOM; los
 * componentes solo pintan este estado.
 *
 * Qué tecnologías se piden lo decide el catálogo: si las del puesto tienen
 * capa (Full Stack), una por capa; si no, una sola. Nada aquí pregunta por
 * un puesto concreto.
 */

export type Campo = 'puesto' | 'tecnologia' | 'nivel'

/** Orden en que se eligen y se nombran las capas: "React + Node.js". */
const CAPAS_EN_ORDEN: readonly Capa[] = ['frontend', 'backend']

export interface Seleccion {
  puesto: string
  /** El código elegido por capa; en un puesto sin capas, bajo la capa vacía. */
  tecnologias: Partial<Record<Capa, string>>
  nivel: string
}

/** Lo que el estado necesita del catálogo para validarse. */
export interface CatalogoDeSeleccion {
  puestos: PuestoConTecnologias[]
  niveles: Nivel[]
}

export type AccionDeSeleccion =
  | { tipo: 'elegirPuesto'; codigo: string }
  /** `codigo: ''` vacía esa capa ("Selecciona…"). */
  | { tipo: 'elegirTecnologia'; capa: Capa; codigo: string }
  | { tipo: 'elegirNivel'; codigo: string }
  /** Rellena varios campos de una vez: "Repetir última", convocatoria, `?puesto=`. */
  | { tipo: 'aplicar'; puesto?: string | null; tecnologias?: (string | null)[]; nivel?: string | null }

export const SELECCION_VACIA: Seleccion = { puesto: '', tecnologias: {}, nivel: '' }

export function puestoDe(seleccion: Seleccion, catalogo: CatalogoDeSeleccion): PuestoConTecnologias | undefined {
  return catalogo.puestos.find((p) => p.codigo === seleccion.puesto)
}

export function nivelDe(seleccion: Seleccion, catalogo: CatalogoDeSeleccion): Nivel | undefined {
  return catalogo.niveles.find((n) => n.codigo === seleccion.nivel)
}

/** Las capas que pide el puesto, en orden; `['']` si se elige una sola tecnología. */
export function capasDe(puesto: PuestoConTecnologias): Capa[] {
  const presentes = new Set(puesto.tecnologias.map((t) => t.capa))
  const conCapa = CAPAS_EN_ORDEN.filter((capa) => presentes.has(capa))
  return conCapa.length > 0 ? conCapa : ['']
}

/**
 * Las tecnologías en bloques consecutivos por `grupo` ("Python": Django,
 * FastAPI, Flask), en el orden del catálogo. Sin grupos, un solo bloque con
 * rótulo vacío. Es lo que se pinta como `<optgroup>`.
 */
export function agruparPorGrupo(tecnologias: TecnologiaDePuesto[]): [string, TecnologiaDePuesto[]][] {
  const bloques: [string, TecnologiaDePuesto[]][] = []
  for (const tecnologia of tecnologias) {
    const ultimo = bloques.at(-1)
    if (ultimo && ultimo[0] === tecnologia.grupo) ultimo[1].push(tecnologia)
    else bloques.push([tecnologia.grupo, [tecnologia]])
  }
  return bloques
}

/** Las tecnologías elegidas que siguen siendo válidas para el puesto, en el orden de sus capas. */
export function tecnologiasElegidas(seleccion: Seleccion, puesto: PuestoConTecnologias): TecnologiaDePuesto[] {
  return capasDe(puesto).flatMap((capa) => {
    const elegida = puesto.tecnologias.find((t) => t.capa === capa && t.codigo === seleccion.tecnologias[capa])
    return elegida ? [elegida] : []
  })
}

/**
 * El primer campo sin completar, o `null` si ya se puede comenzar. El orden es
 * el del formulario (Puesto y Nivel en una fila, Tecnología debajo): así el
 * aviso de la barra y el foco recorren los campos como el usuario los ve.
 */
export function campoFaltante(seleccion: Seleccion, catalogo: CatalogoDeSeleccion): Campo | null {
  const puesto = puestoDe(seleccion, catalogo)
  if (!puesto) return 'puesto'
  if (!nivelDe(seleccion, catalogo)) return 'nivel'
  if (tecnologiasElegidas(seleccion, puesto).length < capasDe(puesto).length) return 'tecnologia'
  return null
}

/** "React" o, con dos capas, "React + Node.js": el mismo nombre que guarda el servidor. */
export function nombreDeTecnologias(seleccion: Seleccion, puesto: PuestoConTecnologias): string {
  return tecnologiasElegidas(seleccion, puesto)
    .map((t) => t.nombre)
    .join(' + ')
}

/** Solo las tecnologías del puesto, una por capa: lo demás se ignora. */
function tecnologiasValidas(
  puesto: PuestoConTecnologias,
  codigos: readonly (string | null)[],
): Partial<Record<Capa, string>> {
  const porCapa: Partial<Record<Capa, string>> = {}
  for (const codigo of codigos) {
    const tecnologia = puesto.tecnologias.find((t) => t.codigo === codigo)
    if (tecnologia && porCapa[tecnologia.capa] === undefined) porCapa[tecnologia.capa] = tecnologia.codigo
  }
  return porCapa
}

export function reducirSeleccion(
  seleccion: Seleccion,
  accion: AccionDeSeleccion,
  catalogo: CatalogoDeSeleccion,
): Seleccion {
  switch (accion.tipo) {
    case 'elegirPuesto': {
      if (!catalogo.puestos.some((p) => p.codigo === accion.codigo)) return seleccion
      // Las tecnologías son del puesto: cambiar de puesto las descarta. El nivel se conserva.
      const tecnologias = accion.codigo === seleccion.puesto ? seleccion.tecnologias : {}
      return { ...seleccion, puesto: accion.codigo, tecnologias }
    }
    case 'elegirTecnologia': {
      if (accion.codigo === '') {
        const { [accion.capa]: _vaciada, ...resto } = seleccion.tecnologias
        return { ...seleccion, tecnologias: resto }
      }
      const valida = puestoDe(seleccion, catalogo)?.tecnologias.some(
        (t) => t.codigo === accion.codigo && t.capa === accion.capa,
      )
      if (!valida) return seleccion
      return { ...seleccion, tecnologias: { ...seleccion.tecnologias, [accion.capa]: accion.codigo } }
    }
    case 'elegirNivel': {
      if (!catalogo.niveles.some((n) => n.codigo === accion.codigo)) return seleccion
      return { ...seleccion, nivel: accion.codigo }
    }
    case 'aplicar': {
      // Un puesto válido reemplaza puesto y tecnologías (las inactivas o ajenas
      // se descartan y su campo queda vacío); sin puesto válido se conservan los
      // actuales. El nivel, igual: se toma solo si existe.
      const puesto = catalogo.puestos.find((p) => p.codigo === accion.puesto)
      const nivel = catalogo.niveles.find((n) => n.codigo === accion.nivel)?.codigo ?? seleccion.nivel
      if (!puesto) return { ...seleccion, nivel }
      return { puesto: puesto.codigo, tecnologias: tecnologiasValidas(puesto, accion.tecnologias ?? []), nivel }
    }
  }
}

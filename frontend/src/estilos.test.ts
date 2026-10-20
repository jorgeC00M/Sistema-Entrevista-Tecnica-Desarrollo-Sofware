import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

/**
 * Guarda del sistema de estilos: falla si vuelve la deriva que se limpió.
 *
 * El estilo se controla desde `styles/` (tokens, utilidades, overlays) y los
 * componentes base de `components/ui/`. Esta prueba recorre los `.tsx` y
 * señala lo que se salta ese sistema. Una excepción solo es válida con motivo,
 * en `EXCEPCIONES`; agregar una sin motivo es tan visible como la deriva.
 */

type Regla = 'boton-suelto' | 'valor-a-mano' | 'paleta-cruda' | 'color-hex'

const REGLAS: Record<Regla, { patron: RegExp; ayuda: string }> = {
  'boton-suelto': {
    patron: /<button\b/,
    ayuda: 'usa Boton, BotonIcono o Chip (components/ui); un enlace-botón, clasesDeBoton()',
  },
  'valor-a-mano': {
    patron: /\b(?:shadow|rounded)-\[|\btext-\[\d|\b(?:bg|text|border|ring|fill|stroke)-\[(?:#|rgba?\()/,
    ayuda: 'usa un token de styles/tokens.css (shadow-*, rounded-*, text-*, colores vidrio-*)',
  },
  'paleta-cruda': {
    patron:
      /\b(?:bg|text|border|ring|from|via|to|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/,
    ayuda: 'usa los colores del sistema (vidrio-*, exito-*, progreso-*, error-*)',
  },
  'color-hex': {
    patron: /#[0-9a-fA-F]{6}\b/,
    ayuda: 'declara el color como token en styles/tokens.css',
  },
}

/** Ruta relativa a `src/` → reglas que se le perdonan y por qué. */
const EXCEPCIONES: Record<string, { reglas: Regla[]; motivo: string }> = {
  'components/ui/IconoGoogle.tsx': {
    reglas: ['color-hex'],
    motivo: 'colores de marca de Google, fijados por su guía de uso del logo',
  },
  'features/historial/components/GraficoProgreso.tsx': {
    reglas: ['color-hex'],
    motivo: 'colores de categoría del gráfico: deben distinguirse del acento y entre sí',
  },
  'features/curriculum/components/ZonaDeArchivo.tsx': {
    reglas: ['boton-suelto'],
    motivo: 'zona de arrastre: es un <button> a propósito (accesible con teclado y clic), no una acción con texto',
  },
  'features/landing/components/CarruselDeTarjetas.tsx': {
    reglas: ['boton-suelto'],
    motivo: 'puntos del carrusel (role="tab"): un indicador de progreso, no una acción ni un icono',
  },
  'features/curriculum/components/HistorialDeAnalisis.tsx': {
    reglas: ['boton-suelto'],
    motivo: 'fila de lista seleccionable a todo el ancho, con varias columnas de contenido',
  },
}

const RAIZ = fileURLToPath(new URL('.', import.meta.url))

function archivosTsx(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = join(carpeta, entrada.name)
    if (entrada.isDirectory()) return archivosTsx(ruta)
    return entrada.name.endsWith('.tsx') ? [ruta] : []
  })
}

/** Quita comentarios conservando los saltos de línea, para que los números de línea sigan valiendo. */
function sinComentarios(codigo: string): string {
  const vaciar = (bloque: string) => bloque.replace(/[^\n]/g, ' ')
  return codigo
    .replace(/\/\*[\s\S]*?\*\//g, vaciar)
    .split('\n')
    .map((linea) => (/^\s*\/\//.test(linea) ? '' : linea))
    .join('\n')
}

interface Violacion {
  donde: string
  regla: Regla
  texto: string
}

function violaciones(): Violacion[] {
  const encontradas: Violacion[] = []
  for (const archivo of archivosTsx(RAIZ)) {
    const ruta = relative(RAIZ, archivo).split(sep).join('/')
    const enUi = ruta.startsWith('components/ui/')
    const perdonadas = EXCEPCIONES[ruta]?.reglas ?? []
    const lineas = sinComentarios(readFileSync(archivo, 'utf-8')).split('\n')

    lineas.forEach((linea, i) => {
      for (const [regla, { patron }] of Object.entries(REGLAS) as [Regla, (typeof REGLAS)[Regla]][]) {
        // Los componentes base son, justamente, donde viven los <button>.
        if (regla === 'boton-suelto' && enUi) continue
        if (perdonadas.includes(regla)) continue
        if (patron.test(linea)) encontradas.push({ donde: `${ruta}:${i + 1}`, regla, texto: linea.trim() })
      }
    })
  }
  return encontradas
}

describe('sistema de estilos', () => {
  it('ningún componente se salta los tokens ni los componentes base', () => {
    const halladas = violaciones().map(
      ({ donde, regla, texto }) => `${donde} [${regla}] ${texto}\n    → ${REGLAS[regla].ayuda}`,
    )
    expect(halladas, `\n${halladas.join('\n')}\n`).toEqual([])
  })

  it('cada excepción declarada sigue siendo necesaria', () => {
    // Una excepción que ya no hace falta es un permiso abierto: se retira.
    const sobrantes = Object.entries(EXCEPCIONES).flatMap(([ruta, { reglas }]) => {
      const codigo = sinComentarios(readFileSync(join(RAIZ, ruta), 'utf-8'))
      return reglas.filter((regla) => !REGLAS[regla].patron.test(codigo)).map((regla) => `${ruta} [${regla}]`)
    })
    expect(sobrantes).toEqual([])
  })
})

/**
 * Los tamaños de texto del sistema (`--text-<nombre>` en `tokens.css`). Una
 * clase de una de sus familias que no exista no da error: Tailwind
 * simplemente no la genera y el texto hereda el tamaño. Así pasó con
 * `text-headline-lg`, que dejó el título del resultado del CV más chico que
 * los de debajo sin que nada avisara.
 */
function tamanosDeTexto(): Set<string> {
  const tokens = readFileSync(join(RAIZ, 'styles/tokens.css'), 'utf-8')
  return new Set([...tokens.matchAll(/--text-([a-z0-9-]+?)(?:--[a-z-]+)?:/g)].map(([, nombre]) => nombre))
}

function clasesDeTextoInexistentes(): string[] {
  const definidos = tamanosDeTexto()
  // La familia es el primer segmento (`headline` de `headline-md`): solo se
  // vigilan las propias del sistema, no los colores (`text-vidrio-*`), que
  // tienen su guarda arriba.
  const familias = [...new Set([...definidos].map((nombre) => nombre.split('-')[0]))]
  // Clase explícita y no `\w`: dentro de un template literal la barra se perdería.
  const borde = '[A-Za-z0-9_-]'
  const patron = new RegExp(`(?<!${borde})text-((?:${familias.join('|')})(?:-[a-z0-9]+)*)(?!${borde})`, 'g')

  return archivosTsx(RAIZ).flatMap((archivo) => {
    const ruta = relative(RAIZ, archivo).split(sep).join('/')
    return sinComentarios(readFileSync(archivo, 'utf-8'))
      .split('\n')
      .flatMap((linea, i) =>
        [...linea.matchAll(patron)]
          .filter(([, nombre]) => !definidos.has(nombre))
          .map(([clase]) => `${ruta}:${i + 1} ${clase} → no existe en styles/tokens.css`),
      )
  })
}

describe('tipografía', () => {
  it('toda clase de tamaño de texto del sistema está definida en tokens.css', () => {
    const halladas = clasesDeTextoInexistentes()
    expect(halladas, `\n${halladas.join('\n')}\n`).toEqual([])
  })
})

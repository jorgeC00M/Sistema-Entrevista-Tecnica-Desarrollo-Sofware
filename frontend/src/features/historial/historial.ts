/**
 * Lógica pura del historial: qué entrevistas muestran la tabla y los gráficos,
 * y cómo se reparten en la evolución. Sin React, para probarla con Vitest; la
 * página solo la pinta.
 */
import { normalizarParaBuscar } from '@/lib/texto'
import type { Entrevista, EstadoEntrevista } from '@/types/entrevista'

export type FiltroDeEstado = 'todos' | EstadoEntrevista

const ESTADOS: readonly EstadoEntrevista[] = ['finalizada', 'en_progreso', 'abandonada']

/** El estado que llega de `?estado=`; cualquier otra cosa equivale a todos. */
export function estadoDesdeURL(valor: string | null): FiltroDeEstado {
  return ESTADOS.find((estado) => estado === valor) ?? 'todos'
}

/** `'todos'` o el `codigo` de un nivel del catálogo. */
export type FiltroDeNivel = 'todos' | string

/**
 * El nivel que llega de `?nivel=`: solo un código del catálogo; cualquier otra
 * cosa equivale a todos. Los códigos se reciben porque los niveles viven en la
 * base de datos, no en el código.
 */
export function nivelDesdeURL(valor: string | null, codigos: readonly string[]): FiltroDeNivel {
  return valor !== null && codigos.includes(valor) ? valor : 'todos'
}

/**
 * Las entrevistas que coinciden con el texto (en puesto, tecnología o nivel),
 * el estado y el nivel. El texto se compara sin mayúsculas ni tildes; vacío, no
 * filtra. Conserva el orden de la lista.
 */
export function filtrarEntrevistas(
  entrevistas: Entrevista[],
  texto: string,
  estado: FiltroDeEstado,
  nivel: FiltroDeNivel = 'todos',
): Entrevista[] {
  const buscado = normalizarParaBuscar(texto)
  return entrevistas.filter((entrevista) => {
    if (estado !== 'todos' && entrevista.estado !== estado) return false
    if (nivel !== 'todos' && entrevista.nivel !== nivel) return false
    if (!buscado) return true
    const buscable = normalizarParaBuscar(
      [entrevista.puesto_display, entrevista.tecnologia_display ?? '', entrevista.nivel_display].join(' '),
    )
    return buscable.includes(buscado)
  })
}

/** Fecha de un punto del gráfico: dd/mm/aaaa, igual que en la tabla. */
export function fechaDelPunto(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Más de esto entre dos entrevistas de un mismo puesto se marca en el gráfico. */
export const DIAS_DE_SALTO = 90

const MS_POR_DIA = 24 * 60 * 60 * 1000

export interface PuntoDeEvolucion {
  entrevistaId: number
  /** 1..n dentro de su serie (puesto y nivel), en orden de finalización. */
  numero: number
  fecha: string
  nota: number
  /** «React» o «React + Node.js»; `null` en entrevistas anteriores al catálogo por puesto. */
  tecnologia: string | null
  /** Días desde la entrevista anterior de la serie; `null` en la primera. */
  diasDesdeAnterior: number | null
  saltoAntes: boolean
}

export interface SerieDePuesto {
  puesto: string
  etiqueta: string
  puntos: PuntoDeEvolucion[]
}

export interface EvolucionDeNivel {
  nivel: string
  etiqueta: string
  series: SerieDePuesto[]
}

/**
 * La evolución repartida en una tarjeta por nivel y, dentro, una serie por
 * puesto: solo es comparable lo que se rindió en las mismas condiciones, la
 * misma regla con la que el reporte compara contra la entrevista anterior.
 *
 * Usa solo las finalizadas con nota, en orden de `fecha_fin`. El eje es el
 * número de entrevista dentro de la serie, no el calendario: diez entrevistas
 * en una semana no se aplastan, y un salto de más de `DIAS_DE_SALTO` se marca.
 * Siempre devuelve todos los niveles pedidos, en su orden, aunque estén vacíos.
 * No distingue el origen (personalizada o desde convocatoria): la nota se
 * calcula igual, así que todas son el mismo progreso.
 */
export function evolucionPorNivel(
  entrevistas: Entrevista[],
  niveles: { codigo: string; nombre: string }[],
  ordenDePuestos: string[],
): EvolucionDeNivel[] {
  const finalizadas = entrevistas
    .filter(
      (e): e is Entrevista & { fecha_fin: string; puntuacion_promedio: number } =>
        e.estado === 'finalizada' && e.fecha_fin !== null && e.puntuacion_promedio !== null,
    )
    .sort((a, b) => a.fecha_fin.localeCompare(b.fecha_fin))

  const series = new Map<string, SerieDePuesto>()

  for (const entrevista of finalizadas) {
    const clave = `${entrevista.nivel}|${entrevista.puesto}`
    let serie = series.get(clave)
    if (!serie) {
      serie = { puesto: entrevista.puesto, etiqueta: entrevista.puesto_display, puntos: [] }
      series.set(clave, serie)
    }

    const anterior = serie.puntos.at(-1)
    const diasDesdeAnterior = anterior
      ? Math.round((Date.parse(entrevista.fecha_fin) - Date.parse(anterior.fecha)) / MS_POR_DIA)
      : null

    serie.puntos.push({
      entrevistaId: entrevista.id,
      numero: serie.puntos.length + 1,
      fecha: entrevista.fecha_fin,
      nota: entrevista.puntuacion_promedio,
      tecnologia: entrevista.tecnologia_display,
      diasDesdeAnterior,
      saltoAntes: diasDesdeAnterior !== null && diasDesdeAnterior > DIAS_DE_SALTO,
    })
  }

  const posicion = (puesto: string) => {
    const indice = ordenDePuestos.indexOf(puesto)
    return indice === -1 ? Number.MAX_SAFE_INTEGER : indice
  }

  return niveles.map((nivel) => ({
    nivel: nivel.codigo,
    etiqueta: nivel.nombre,
    series: [...series.entries()]
      .filter(([clave]) => clave.startsWith(`${nivel.codigo}|`))
      .map(([, serie]) => serie)
      .sort((a, b) => posicion(a.puesto) - posicion(b.puesto)),
  }))
}

/**
 * Qué posiciones del eje se rotulan. En una tarjeta angosta no caben veinte
 * números: con más de 8 se rotulan la primera, las múltiplos de 5 y la última.
 * Los puntos se dibujan todos igual.
 */
export function marcasDelEje(total: number): number[] {
  if (total <= 0) return []
  if (total <= 8) return Array.from({ length: total }, (_, i) => i + 1)
  const marcas = new Set([1, total])
  for (let n = 5; n < total; n += 5) marcas.add(n)
  return [...marcas].sort((a, b) => a - b)
}

/** «Backend: de 50 a 75 en 5 entrevistas», para el resumen que lee el lector de pantalla. */
export function resumenDeSerie(serie: SerieDePuesto): string {
  const primera = Math.round(serie.puntos[0].nota)
  const ultima = Math.round(serie.puntos[serie.puntos.length - 1].nota)
  const n = serie.puntos.length
  return n === 1
    ? `${serie.etiqueta}: una entrevista, ${primera}`
    : `${serie.etiqueta}: de ${primera} a ${ultima} en ${n} entrevistas`
}

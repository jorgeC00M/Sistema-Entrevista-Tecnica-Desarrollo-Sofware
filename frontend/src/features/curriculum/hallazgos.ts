import type { AnalisisATS, Hallazgo, Severidad } from '@/types/curriculum'

/** Menor peso, más grave: lo que deja el CV fuera de la búsqueda va primero. */
const PESO: Record<Severidad, number> = { critica: 0, alta: 1, media: 2, info: 3 }

/**
 * Cómo se rotula cada gravedad: por lo que le hace al ATS, no como veredicto
 * sobre el CV. El módulo se niega a dar un puntaje para ser defendible, y
 * "Crítico" en rojo sobre el primer CV de alguien era también un veredicto sin
 * contexto. Los colores de estado no cambian. `info` no lleva rótulo: un
 * hallazgo favorable no necesita gravedad.
 */
export const SEVERIDADES: Record<Severidad, { etiqueta: string; clases: string; icono: string }> = {
  critica: { etiqueta: 'Impide la lectura', clases: 'bg-error-fondo text-error-texto', icono: 'text-error-texto' },
  alta: { etiqueta: 'Resta visibilidad', clases: 'bg-progreso-fondo text-progreso-texto', icono: 'text-progreso-texto' },
  media: { etiqueta: 'Detalle', clases: 'bg-vidrio-field text-vidrio-muted', icono: 'text-vidrio-muted' },
  info: { etiqueta: '', clases: '', icono: 'text-vidrio-muted' },
}

/**
 * El código que emite el backend (`integrations/documentos/ats.py`) cuando el
 * documento no tiene capa de texto. Es el contrato que ya existe: no hace falta
 * un campo nuevo en la API.
 */
export const CODIGO_SIN_CAPA_DE_TEXTO = 'sin_capa_de_texto'

/**
 * Si el ATS no puede leer nada del CV (un PDF escaneado o exportado como
 * imagen). Entonces el resto del análisis está vacío por construcción, y
 * mostrarlo culparía a la causa equivocada: "tus habilidades están en barras",
 * "tu convocatoria no tiene requisitos". No basta con `campos_detectados === 0`:
 * un CV legible con encabezados raros también puede no llenar ningún campo.
 */
export function esIlegible(analisis: Pick<AnalisisATS, 'debilidades'>): boolean {
  return analisis.debilidades.some((h) => h.codigo === CODIGO_SIN_CAPA_DE_TEXTO)
}

/**
 * Las debilidades de la más grave a la menos grave, sin mutar la lista.
 *
 * El orden es estable: entre dos de la misma gravedad se respeta el del
 * backend, que es el orden de sus reglas y por eso es reproducible.
 */
export function debilidadesPorGravedad(hallazgos: readonly Hallazgo[]): Hallazgo[] {
  return [...hallazgos].sort((a, b) => PESO[a.severidad] - PESO[b.severidad])
}

/**
 * Las correcciones que salen de **medir** el documento: los hallazgos del ATS y
 * las viñetas sin resultado. No cambia cuando llega la IA.
 */
export function correccionesMedidas(analisis: Pick<AnalisisATS, 'debilidades' | 'vinetas'>): number {
  return analisis.debilidades.length + (analisis.vinetas?.sin_resultado.length ?? 0)
}

/**
 * Las que **sugiere la IA** (correcciones de redacción). Se cuentan aparte y
 * nunca se suman a las medidas: lo medido y lo sugerido no comparten una cifra,
 * y un número que crece solo al llegar la IA empezaría a parecer un puntaje.
 */
export function sugerenciasDeIA(analisis: Pick<AnalisisATS, 'revision_ia'>): number {
  return analisis.revision_ia?.correcciones.length ?? 0
}

/** El `id` de cada corrección en "Mejorar": el Resumen enlaza a él para llevar el foco ahí. */
export function idDeHallazgo(codigo: string): string {
  return `hallazgo-${codigo}`
}

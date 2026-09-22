import type { TonoDeBadge } from '@/components/ui/Badge'
import type { EstadoEntrevista } from '@/types/entrevista'

/** Único lugar donde el estado de una entrevista se traduce a color de Badge. */
export const TONO_POR_ESTADO: Record<EstadoEntrevista, TonoDeBadge> = {
  finalizada: 'exito',
  en_progreso: 'progreso',
  abandonada: 'neutro',
}

/** Segundos como duración compacta: `1h 05m` / `14m 28s`. */
export function formatearSegundosCompacto(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = segundos % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}m ${String(s).padStart(2, '0')}s`
}

/**
 * Duración entre dos fechas ISO, en el mismo formato compacto.
 * `null` cuando la entrevista todavía no tiene fecha de fin.
 */
export function formatearDuracion(inicioISO: string, finISO: string | null): string | null {
  if (!finISO) return null
  const segundos = Math.max(0, Math.round((Date.parse(finISO) - Date.parse(inicioISO)) / 1000))
  return formatearSegundosCompacto(segundos)
}

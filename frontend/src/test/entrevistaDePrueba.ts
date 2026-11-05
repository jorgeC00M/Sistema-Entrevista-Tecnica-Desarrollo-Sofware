/**
 * Una `Entrevista` de prueba para los tests de lógica pura (historial,
 * evolución, Inicio). Solo la importan archivos `.test.ts`.
 */
import { normalizarParaBuscar } from '@/lib/texto'
import type { Entrevista, EstadoEntrevista } from '@/types/entrevista'

export interface Opciones {
  estado?: EstadoEntrevista
  convocatoria?: boolean
  nota?: number | null
  fin?: string | null
}

export function entrevista(
  id: number,
  puesto: string,
  tecnologia: string | null,
  nivel: string,
  { estado = 'finalizada', convocatoria = false, nota = 75, fin = '2026-10-21T10:00:00Z' }: Opciones = {},
): Entrevista {
  return {
    id,
    puesto: normalizarParaBuscar(puesto).replace(' ', '_'),
    puesto_display: puesto,
    nivel: normalizarParaBuscar(nivel).replace('-', '_'),
    nivel_display: nivel,
    tecnologia: tecnologia ? tecnologia.toLowerCase() : null,
    segunda_tecnologia: null,
    tecnologia_display: tecnologia,
    estado,
    estado_display: estado,
    fecha_inicio: fin ?? '2026-10-21T09:00:00Z',
    fecha_fin: fin,
    puntuacion_promedio: nota,
    fecha_limite: '2026-01-01T00:30:00Z',
    ahora: '2026-01-01T00:00:00Z',
    preguntas_calificadas: 5,
    preguntas_previstas: 5,
    desde_convocatoria: convocatoria,
  }
}

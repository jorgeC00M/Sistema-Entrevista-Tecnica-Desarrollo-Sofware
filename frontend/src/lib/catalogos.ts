import type { Area } from '@/types/catalogos'

/**
 * Código de área → nombre visible.
 *
 * El catálogo publica las áreas de cada puesto como códigos y los nombres una
 * sola vez, en `areas`, para no repetir el mismo texto en el payload. La
 * pantalla de selección y la landing los traducen igual; vive aquí y no en una
 * de las dos porque las dos lo necesitan.
 */
export function nombresDeAreas(areas: Area[]): Map<string, string> {
  return new Map(areas.map((area) => [area.codigo, area.nombre]))
}

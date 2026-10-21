import type { CatalogoDePuestos, Catalogos, CatalogosPublicos } from '@/types/catalogos'

import { peticion } from './client'

// Áreas, niveles y duración de la entrevista. Es la única fuente: la pantalla
// de selección no mantiene su propia copia, para que dar de baja un área en el
// admin la retire también de la interfaz.
export function obtenerCatalogos(signal?: AbortSignal): Promise<Catalogos> {
  return peticion<Catalogos>('/api/catalogos/', { signal })
}

/**
 * El mismo catálogo para la landing, que se ve sin haber iniciado sesión.
 *
 * `autenticado: false` es necesario, no cosmético: sin él, un visitante con un
 * token caducado en localStorage dispararía el reintento con refresco de
 * `client.ts`, y al fallar ese refresco se le borraría la sesión mientras
 * simplemente leía la portada.
 */
export function obtenerCatalogosPublicos(signal?: AbortSignal): Promise<CatalogosPublicos> {
  return peticion<CatalogosPublicos>('/api/catalogos/publico/', {
    autenticado: false,
    signal,
  })
}

/**
 * Cuánto se reutiliza `obtenerPuestos` en la caché de `usePeticion` (clave
 * `catalogo-puestos`, compartida por Nueva entrevista y el historial). El
 * catálogo cambia muy poco: igual que la cabecera `Cache-Control` del servidor.
 */
export const VIGENCIA_DEL_CATALOGO_MS = 5 * 60_000

/**
 * Puestos con sus tecnologías (cada una con su capa), niveles, áreas y
 * duración: todo lo que necesita la pantalla de nueva entrevista.
 */
export function obtenerPuestos(signal?: AbortSignal): Promise<CatalogoDePuestos> {
  return peticion<CatalogoDePuestos>('/api/catalogos/puestos/', { signal })
}

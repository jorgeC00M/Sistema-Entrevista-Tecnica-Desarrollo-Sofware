import { obtenerCatalogos, obtenerCatalogosPublicos } from '@/api/catalogos'
import { usePeticion } from '@/hooks/usePeticion'
import type { Catalogos } from '@/types/catalogos'

interface EstadoCatalogos {
  catalogos: Catalogos | null
  cargando: boolean
  error: string
}

/**
 * Áreas, niveles y duración de la entrevista.
 *
 * `publico` elige entre el catálogo de la landing (sin sesión) y el de la
 * aplicación. Antes eran dos hooks en carpetas distintas con el mismo cuerpo
 * y distinto literal de error; el dato es el mismo (`CatalogosPublicos` es un
 * alias de `Catalogos`), así que lo único que cambia es qué endpoint se pide.
 *
 * No se cachea indefinidamente a propósito: dar de baja un área en el admin
 * debe retirarla de la interfaz. La vigencia corta de `usePeticion` evita
 * repetir la petición al navegar sin llegar a ocultar ese cambio.
 */
export function useCatalogos({ publico = false } = {}): EstadoCatalogos {
  const { datos, cargando, error } = usePeticion<Catalogos>(
    publico ? 'catalogos-publicos' : 'catalogos',
    (signal) => (publico ? obtenerCatalogosPublicos(signal) : obtenerCatalogos(signal)),
    { mensajeDeError: 'No se pudieron cargar las opciones.' },
  )

  return { catalogos: datos, cargando, error }
}

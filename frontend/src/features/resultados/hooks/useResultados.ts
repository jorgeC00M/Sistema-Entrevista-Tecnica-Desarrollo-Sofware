import { obtenerResultados } from '@/api/entrevistas'
import { usePeticion } from '@/hooks/usePeticion'
import type { RespuestaResultados } from '@/types/entrevista'

interface Estado {
  datos: RespuestaResultados | null
  cargando: boolean
  error: string
}

/** El fetching vivía dentro de `ResultadosPage`; aquí queda al mismo nivel
 * que el resto de features, que ya tenían su hook. */
export function useResultados(id: string | undefined): Estado {
  const { datos, cargando, error } = usePeticion<RespuestaResultados>(
    `resultados-${id}`,
    (signal) => obtenerResultados(id as string, signal),
    {
      activo: Boolean(id),
      mensajeDeError: 'No se pudieron cargar los resultados.',
    },
  )

  return { datos, cargando, error }
}

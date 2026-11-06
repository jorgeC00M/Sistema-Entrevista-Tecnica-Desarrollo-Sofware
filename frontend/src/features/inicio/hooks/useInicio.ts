import { obtenerCurriculum, obtenerHistorialDeCurriculums } from '@/api/curriculums'
import { obtenerHistorial } from '@/api/entrevistas'
import { type EntrevistaEnCurso, useEntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import {
  type CifrasDeResumen,
  type SiguientePaso,
  cifrasDeResumen,
  siguientePaso,
  ultimaFinalizada,
} from '@/features/inicio/inicio'
import { useResultados } from '@/features/resultados/hooks/useResultados'
import { useCatalogos } from '@/hooks/useCatalogos'
import { usePeticion } from '@/hooks/usePeticion'
import type { Catalogos } from '@/types/catalogos'
import type { Curriculum, CurriculumEnLista } from '@/types/curriculum'
import type { Entrevista, ResumenEntrevista } from '@/types/entrevista'

interface DatosDelInicio {
  entrevistas: Entrevista[]
  cifras: CifrasDeResumen
  siguiente: SiguientePaso
  enCurso: EntrevistaEnCurso | null
  /** La última finalizada y el resumen de su reporte; `null` si no hay (o el reporte falló). */
  ultima: { entrevista: Entrevista; resumen: ResumenEntrevista } | null
  /** El último análisis de CV, de la lista, y su detalle si se pudo traer. */
  cv: { fila: CurriculumEnLista; detalle: Curriculum | null } | null
  catalogos: Catalogos | null
}

interface Estado {
  cargando: boolean
  error: string
  datos: DatosDelInicio | null
}

/** El análisis más reciente de la lista, por fecha. */
function ultimoAnalisis(curriculums: CurriculumEnLista[]): CurriculumEnLista | null {
  return [...curriculums].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id)[0] ?? null
}

/**
 * Todo lo que el Inicio muestra, en un solo estado.
 *
 * Usa las mismas claves de caché que el resto de la app (`historial`,
 * `curriculums`, `resultados-<id>`, el catálogo): entrar al Inicio después de
 * otra pantalla no vuelve a pedir lo mismo, y como `usePeticion` avisa a las
 * instancias montadas, el Inicio se entera de empezar, terminar o abandonar una
 * entrevista. Solo dos pedidos dependen de otros: el reporte de la última
 * finalizada (su banda y prioridad) y el detalle del último CV (su revisión
 * guardada, nunca una llamada nueva a la IA).
 *
 * Un fallo de esos dos no rompe la pantalla: su tarjeta no se muestra y el
 * siguiente paso cae en su variante sin ese dato. Solo bloquean el historial y
 * la lista de CV, sin los que no hay nada que resumir.
 *
 * Es la única feature que importa de otras (`resultados`, `curriculum`) a
 * propósito: el Inicio resume esas pantallas, y reusar sus hooks y reglas evita
 * que el resumen y la pantalla de detalle digan cosas distintas.
 */
export function useInicio(): Estado {
  const historial = usePeticion<Entrevista[]>('historial', (signal) => obtenerHistorial(signal), {
    mensajeDeError: 'No se pudo cargar tu resumen.',
  })
  const curriculums = usePeticion<CurriculumEnLista[]>('curriculums', (signal) => obtenerHistorialDeCurriculums(signal), {
    mensajeDeError: 'No se pudo cargar tu resumen.',
  })
  const { catalogos } = useCatalogos()
  const enCurso = useEntrevistaEnCurso()

  const finalizada = historial.datos ? ultimaFinalizada(historial.datos) : null
  const reporte = useResultados(finalizada ? String(finalizada.id) : undefined)

  const fila = curriculums.datos ? ultimoAnalisis(curriculums.datos) : null
  const detalle = usePeticion<Curriculum>(`curriculum-${fila?.id ?? 'ninguno'}`, (signal) => obtenerCurriculum(fila!.id, signal), {
    activo: fila !== null,
  })

  const error = historial.error || curriculums.error
  const esperando =
    historial.cargando ||
    curriculums.cargando ||
    (finalizada !== null && reporte.cargando) ||
    (fila !== null && detalle.cargando)
  if (error) return { cargando: false, error, datos: null }
  if (esperando || !historial.datos || !curriculums.datos) return { cargando: true, error: '', datos: null }

  const resumen = reporte.datos?.resumen ?? null
  const revision = detalle.datos?.analisis?.revision_ia ?? null

  return {
    cargando: false,
    error: '',
    datos: {
      entrevistas: historial.datos,
      cifras: cifrasDeResumen(historial.datos, curriculums.datos),
      siguiente: siguientePaso({
        enCurso,
        entrevistas: historial.datos,
        hayCv: curriculums.datos.length > 0,
        revisionDelUltimoCv: revision,
        resumenDeLaUltima: resumen,
        niveles: catalogos?.niveles ?? [],
      }),
      enCurso,
      ultima: finalizada && resumen ? { entrevista: finalizada, resumen } : null,
      cv: fila ? { fila, detalle: detalle.datos } : null,
      catalogos,
    },
  }
}

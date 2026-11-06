/**
 * Lógica pura del Inicio: las cuatro cifras y qué «siguiente paso» toca. Sin
 * React, para probarla con Vitest; las tarjetas solo la pintan. Todo sale de
 * lo que la app ya carga (historial, análisis de CV, catálogo y el reporte de
 * la última finalizada), con reglas que se explican una por una.
 */
import type { EntrevistaEnCurso } from '@/components/layout/useEntrevistaEnCurso'
import { destinoDePractica } from '@/features/curriculum/practica'
import { minutosRestantes } from '@/lib/tiempo'
import { practicaRecomendada } from '@/features/resultados/reporte'
import type { Nivel } from '@/types/catalogos'
import type { CurriculumEnLista, RevisionIA } from '@/types/curriculum'
import type { Entrevista, ResumenEntrevista } from '@/types/entrevista'

export interface CifrasDeResumen {
  finalizadas: number
  /** Abandonadas y con el tiempo agotado: terminadas sin completarse. */
  sinTerminar: number
  /** Respuestas evaluadas de las entrevistas ya terminadas, en cualquier estado. */
  preguntas: number
  /** Solo de las finalizadas: una vencida termina en el límite y sumarla inventaría práctica. */
  segundosDePractica: number
  analisis: number
  generales: number
  conOferta: number
}

export function cifrasDeResumen(entrevistas: Entrevista[], curriculums: CurriculumEnLista[]): CifrasDeResumen {
  const terminadas = entrevistas.filter((e) => e.estado !== 'en_progreso')
  const finalizadas = terminadas.filter((e) => e.estado === 'finalizada')
  const conOferta = curriculums.filter((c) => c.con_convocatoria).length
  return {
    finalizadas: finalizadas.length,
    sinTerminar: terminadas.length - finalizadas.length,
    preguntas: terminadas.reduce((total, e) => total + e.preguntas_calificadas, 0),
    segundosDePractica: finalizadas.reduce(
      (total, e) =>
        e.fecha_fin ? total + Math.max(0, Math.round((Date.parse(e.fecha_fin) - Date.parse(e.fecha_inicio)) / 1000)) : total,
      0,
    ),
    analisis: curriculums.length,
    generales: curriculums.length - conOferta,
    conOferta,
  }
}

/** «45 min» o «1 h 40 min», para la cifra de tiempo. */
export function tiempoDePractica(segundos: number): string {
  const minutos = Math.round(segundos / 60)
  const horas = Math.floor(minutos / 60)
  if (horas === 0) return `${minutos} min`
  const resto = minutos % 60
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

/** La más reciente según cuándo terminó; los empates, por el id mayor. */
function masReciente(entrevistas: Entrevista[]): Entrevista | null {
  // Las abandonadas de antes de `tiempo-limite-de-entrevista` pueden no tener
  // `fecha_fin` (el cierre perezoso no la escribía): cuenta su inicio.
  const cuando = (e: Entrevista) => e.fecha_fin ?? e.fecha_inicio
  return (
    [...entrevistas].sort((a, b) => cuando(b).localeCompare(cuando(a)) || b.id - a.id)[0] ?? null
  )
}

/** La última terminada en cualquier estado de cierre. */
export function ultimaTerminada(entrevistas: Entrevista[]): Entrevista | null {
  return masReciente(entrevistas.filter((e) => e.estado !== 'en_progreso'))
}

/** La última finalizada: la única que tiene nota. */
export function ultimaFinalizada(entrevistas: Entrevista[]): Entrevista | null {
  return masReciente(entrevistas.filter((e) => e.estado === 'finalizada'))
}

const rutaDePractica = (puesto: string, nivel: string) =>
  `/simular-entrevista?${new URLSearchParams({ puesto, nivel })}`

interface PasoBase {
  frase: string
  accion: string
  ruta: string
}

export type SiguientePaso =
  | (PasoBase & { tipo: 'continuar'; segundos: number })
  | (PasoBase & { tipo: 'analizarCv' })
  | (PasoBase & { tipo: 'primera' })
  | (PasoBase & { tipo: 'reintentar' })
  | (PasoBase & { tipo: 'subir' })
  | (PasoBase & { tipo: 'repasar' })

export interface DatosDelSiguientePaso {
  enCurso: EntrevistaEnCurso | null
  entrevistas: Entrevista[]
  hayCv: boolean
  /** La revisión guardada del último CV: su puesto sugerido preselecciona la primera entrevista. */
  revisionDelUltimoCv: RevisionIA | null
  /** El resumen del reporte de la última finalizada; `null` si no hay o no se pudo traer. */
  resumenDeLaUltima: ResumenEntrevista | null
  niveles: Nivel[]
}

/**
 * Qué conviene hacer ahora: el primer caso que se cumple, en este orden.
 *
 * 1. Hay una en curso: retomarla antes de que venza.
 * 2. Sin CV ni entrevistas: empezar por el CV.
 * 3. Sin entrevistas: la primera, con el puesto que sugiere el CV.
 * 4. La última terminada no se completó: intentarla de nuevo.
 * 5. La última finalizada fue «Sólido» y hay un nivel más: subir.
 * 6. Si no: repasar el área más baja, en el mismo puesto y nivel.
 *
 * Todas las que llevan a «Simular entrevista» solo preseleccionan.
 */
export function siguientePaso({
  enCurso,
  entrevistas,
  hayCv,
  revisionDelUltimoCv,
  resumenDeLaUltima,
  niveles,
}: DatosDelSiguientePaso): SiguientePaso {
  if (enCurso) {
    return {
      tipo: 'continuar',
      frase: `Tienes una entrevista de ${enCurso.puestoDisplay} en curso · quedan ${minutosRestantes(enCurso.segundosRestantes)} min`,
      accion: 'Continuar',
      ruta: `/entrevista/${enCurso.id}`,
      segundos: enCurso.segundosRestantes,
    }
  }

  const terminadas = entrevistas.filter((e) => e.estado !== 'en_progreso')
  if (terminadas.length === 0) {
    return hayCv
      ? {
          tipo: 'primera',
          frase: 'Simula tu primera entrevista',
          accion: 'Simular entrevista',
          ruta: destinoDePractica(revisionDelUltimoCv),
        }
      : {
          tipo: 'analizarCv',
          frase: 'Empieza analizando tu CV',
          accion: 'Analizar CV',
          ruta: '/mi-cv/analisis',
        }
  }

  const ultima = ultimaTerminada(entrevistas)
  if (ultima && ultima.estado !== 'finalizada') {
    return {
      tipo: 'reintentar',
      frase: 'Tu última entrevista no se completó: inténtala de nuevo',
      accion: 'Volver a intentarlo',
      ruta: rutaDePractica(ultima.puesto, ultima.nivel),
    }
  }

  // Aquí la última terminada es una finalizada.
  const finalizada = ultima as Entrevista
  if (resumenDeLaUltima) {
    const practica = practicaRecomendada(finalizada, resumenDeLaUltima.banda, niveles)
    if (practica.subeDeNivel) {
      return {
        tipo: 'subir',
        frase: `Sube a ${practica.nivelNombre} en ${practica.puestoNombre}`,
        accion: 'Practicar',
        ruta: rutaDePractica(practica.puesto, practica.nivel),
      }
    }
    return {
      tipo: 'repasar',
      frase: `Repasa ${resumenDeLaUltima.prioridad.area_display}, tu punto más bajo en ${finalizada.puesto_display} ${finalizada.nivel_display}`,
      accion: 'Practicar',
      ruta: rutaDePractica(finalizada.puesto, finalizada.nivel),
    }
  }

  // Sin el reporte (falló al traerlo) no hay área que nombrar: el mismo puesto y nivel.
  return {
    tipo: 'repasar',
    frase: `Vuelve a practicar ${finalizada.puesto_display} ${finalizada.nivel_display}`,
    accion: 'Practicar',
    ruta: rutaDePractica(finalizada.puesto, finalizada.nivel),
  }
}

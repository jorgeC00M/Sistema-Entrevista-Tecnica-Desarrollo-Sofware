import type { ReactNode } from 'react'

import EspejoDelATS from '@/features/curriculum/components/EspejoDelATS'
import PracticarLaEntrevista from '@/features/curriculum/components/PracticarLaEntrevista'
import RequisitosNoDetectados from '@/features/curriculum/components/RequisitosNoDetectados'
import TecnologiasLegibles from '@/features/curriculum/components/TecnologiasLegibles'
import VeredictoDeLegibilidad from '@/features/curriculum/components/VeredictoDeLegibilidad'
import type { AnalisisATS, Curriculum } from '@/types/curriculum'

interface Props {
  curriculum: Pick<Curriculum, 'con_convocatoria'>
  analisis: AnalisisATS
  /** Lleva a la pestaña «Plan de Mejora». */
  onVerTodo: () => void
  /** Lleva a una corrección concreta dentro de «Plan de Mejora». */
  onIrA: (codigo: string) => void
  /** Sin convocatoria: vuelve a la entrada para comparar con un aviso. */
  onCompararConConvocatoria: () => void
  /** El estado de las sugerencias de IA, que llegan después del diagnóstico. */
  aviso: ReactNode
}

/**
 * Lo primero que se ve tras analizar («Resumen y Formato» en el general,
 * «Resumen» en el dirigido), en una sola columna a ancho completo.
 *
 * Abre el estado del CV con sus datos y sus errores —cada uno lleva a su
 * corrección en «Plan de Mejora»—; en el dirigido, el mismo banner pone al lado
 * de «Formato» los requisitos de la oferta que no se detectaron, sin cambiar el
 * estado, que mide solo lo que el ATS extrae. Después, el espejo —qué lee el ATS
 * de **tu** CV, campo por campo, solo aquí— y, sin convocatoria, a su derecha
 * (2/3 y 1/3 desde 1024 px), las tecnologías por las que te encontrarían; con
 * convocatoria ya se está comparando con una oferta, así que el espejo va solo.
 * Cierra la práctica de la entrevista.
 *
 * Todo sale de la medición y ningún dato es un puntaje.
 */
export default function ResumenDelAnalisis({
  curriculum,
  analisis,
  onVerTodo,
  onIrA,
  onCompararConConvocatoria,
  aviso,
}: Props) {
  return (
    <div className="flex flex-col gap-5">
      {aviso}

      <VeredictoDeLegibilidad
        analisis={analisis}
        onIrA={onIrA}
        onVerTodo={onVerTodo}
        requisitos={
          curriculum.con_convocatoria && analisis.brecha ? <RequisitosNoDetectados brecha={analisis.brecha} /> : undefined
        }
      />
      {curriculum.con_convocatoria ? (
        <EspejoDelATS analisis={analisis} />
      ) : (
        // La misma fila 2fr / 1fr que la entrada: el espejo es lo principal y
        // las tecnologías lo complementan. Cada tarjeta es hija directa de la
        // grilla, así se estira a la altura de la fila (alineadas arriba y abajo).
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <EspejoDelATS analisis={analisis} />
          <TecnologiasLegibles terminos={analisis.inventario} onComparar={onCompararConConvocatoria} />
        </div>
      )}

      {/* El cierre natural del análisis: el paso a practicar. */}
      <PracticarLaEntrevista revision={analisis.revision_ia} />
    </div>
  )
}

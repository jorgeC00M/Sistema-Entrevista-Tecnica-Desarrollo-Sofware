import { SEVERIDADES } from '@/features/curriculum/hallazgos'
import type { Hallazgo } from '@/types/curriculum'

/**
 * El efecto de un hallazgo sobre el ATS, como chip («Resta visibilidad»). Va
 * aparte del título y con un prefijo para el lector de pantalla: leído pegado al
 * título ("Tu CV está en dos columnas Impide la lectura") no se entendería.
 */
export default function ChipDeSeveridad({ hallazgo }: { hallazgo: Pick<Hallazgo, 'severidad'> }) {
  const severidad = SEVERIDADES[hallazgo.severidad]
  if (!severidad.etiqueta) return null
  return (
    <span className={`rounded-chip px-2 py-0.5 font-mono-vidrio text-label-mono uppercase ${severidad.clases}`}>
      <span className="sr-only">Efecto: </span>
      {severidad.etiqueta}
    </span>
  )
}

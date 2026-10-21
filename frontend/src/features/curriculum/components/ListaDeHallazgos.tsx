import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import { SEVERIDADES, idDeHallazgo } from '@/features/curriculum/hallazgos'
import type { Hallazgo } from '@/types/curriculum'

interface Props {
  titulo: string
  hallazgos: Hallazgo[]
  /** Qué decir cuando la lista está vacía, que no es lo mismo que un fallo. */
  vacio: string
}

/**
 * Las correcciones que encontró la medición, cada una con su efecto sobre el
 * ATS ("Impide la lectura", "Resta visibilidad", "Detalle") y lo que hay que
 * hacer. El color del icono es el de su gravedad: el color solo marca estado,
 * nunca decora. Las fortalezas no van aquí: el Resumen las muestra aparte.
 */
export default function ListaDeHallazgos({ titulo, hallazgos, vacio }: Props) {
  return (
    <Tarjeta className="p-5">
      <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">{titulo}</h2>

      {hallazgos.length === 0 ? (
        <p className="mt-3 text-sm text-vidrio-muted">{vacio}</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {hallazgos.map((hallazgo) => (
            // `tabIndex={-1}` y `scroll-mt`: el Resumen trae el foco a esta
            // corrección sin que quede bajo la cabecera y las pestañas fijas.
            <li
              key={hallazgo.codigo}
              id={idDeHallazgo(hallazgo.codigo)}
              tabIndex={-1}
              className="flex scroll-mt-32 items-start gap-3 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-vidrio-acento"
            >
              <span className={`mt-0.5 shrink-0 ${SEVERIDADES[hallazgo.severidad].icono}`}>
                <Icono nombre="mejora" className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-vidrio-ink">{hallazgo.titulo}</h3>
                  <ChipDeSeveridad hallazgo={hallazgo} />
                </div>
                {/* El detalle explica qué hacer, no solo qué está mal: es la
                    diferencia entre un diagnóstico y algo accionable. */}
                <p className="mt-1 text-sm leading-relaxed text-vidrio-texto">{hallazgo.detalle}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  )
}

/**
 * El efecto de un hallazgo sobre el ATS, como chip. Va aparte del título y con
 * un prefijo para el lector de pantalla: leído pegado al título ("Tu CV está en
 * dos columnas Impide la lectura") no se entendería.
 */
export function ChipDeSeveridad({ hallazgo }: { hallazgo: Hallazgo }) {
  const severidad = SEVERIDADES[hallazgo.severidad]
  if (!severidad.etiqueta) return null
  return (
    <span className={`rounded-chip px-2 py-0.5 font-mono-vidrio text-label-mono uppercase ${severidad.clases}`}>
      <span className="sr-only">Efecto: </span>
      {severidad.etiqueta}
    </span>
  )
}

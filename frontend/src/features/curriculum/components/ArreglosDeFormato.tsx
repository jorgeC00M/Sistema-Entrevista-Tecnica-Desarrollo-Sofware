import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import ChipDeSeveridad from '@/features/curriculum/components/ChipDeSeveridad'
import { accionDe, debilidadesPorGravedad, idDeHallazgo } from '@/features/curriculum/hallazgos'
import type { Hallazgo } from '@/types/curriculum'

interface Props {
  hallazgos: Hallazgo[]
}

/**
 * «Arreglar el formato»: las correcciones medidas como lista de pendientes, de
 * la más grave a la menos grave.
 *
 * Cada fila, desde 1024 px: en los dos tercios izquierdos, la acción, su efecto sobre el ATS y cómo hacerlo
 * (`detalle`); en el tercio derecho, AHORA —lo que se encontró, el diagnóstico medido— y,
 * si la regla lo tiene, DESPUÉS —su ejemplo de cómo debe quedar—. AHORA no copia
 * el CV: el archivo nunca se guarda. En tablet y celular las cajas bajan debajo del
 * texto. No hay casilla ni avance: la verificación real es volver a subir el CV.
 */
export default function ArreglosDeFormato({ hallazgos }: Props) {
  const arreglos = debilidadesPorGravedad(hallazgos)

  return (
    <Tarjeta como="section" className="p-5">
      <h3 className="font-serif text-headline-md font-semibold text-vidrio-ink">Arreglar el formato</h3>
      <p className="mt-1 text-sm text-vidrio-texto">
        Hazlo primero: si el sistema no lee un dato, tampoco lo puede comparar.
      </p>

      <ul className="mt-4 divide-y divide-vidrio-linea">
        {arreglos.length === 0 ? (
          <li className="flex items-center gap-3 py-3 text-sm text-exito-texto">
            <Icono nombre="fortaleza" className="h-5 w-5 shrink-0" />
            No hay arreglos de formato pendientes
          </li>
        ) : (
          arreglos.map((hallazgo) => {
            return (
              // `tabIndex={-1}` y `scroll-mt`: los errores de «Formato» del
              // Resumen traen el foco a esta fila sin que quede bajo la
              // cabecera y las pestañas fijas.
              <li
                key={hallazgo.codigo}
                id={idDeHallazgo(hallazgo.codigo)}
                tabIndex={-1}
                className="grid scroll-mt-32 gap-y-3 rounded-control py-4 outline-none focus-visible:ring-2 focus-visible:ring-vidrio-acento lg:grid-cols-[2fr_1fr] lg:gap-x-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-semibold text-vidrio-ink">{accionDe(hallazgo)}</h4>
                    <ChipDeSeveridad hallazgo={hallazgo} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-vidrio-texto">{hallazgo.detalle}</p>
                </div>
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="rounded-control border border-vidrio-borde bg-white px-3 py-2">
                    <p className="font-mono-vidrio text-label-mono text-vidrio-muted uppercase">Ahora</p>
                    <p className="mt-0.5 text-sm text-vidrio-texto">{hallazgo.titulo}</p>
                  </div>
                  {/* Medido, no sugerido: el ejemplo lo escribe la regla y pasa
                      sus propias verificaciones, así que no lleva rótulo de IA. */}
                  {hallazgo.ejemplo && (
                    <div className="rounded-control border border-exito-texto bg-exito-fondo px-3 py-2">
                      <p className="font-mono-vidrio text-label-mono text-exito-texto uppercase">Después</p>
                      <p className="mt-0.5 font-mono-vidrio text-meta whitespace-pre-line text-vidrio-ink">
                        {hallazgo.ejemplo}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            )
          })
        )}
      </ul>
    </Tarjeta>
  )
}

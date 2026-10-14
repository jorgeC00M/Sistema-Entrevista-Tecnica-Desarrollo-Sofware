import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'
import type { RevisionIA, TipoDeCorreccion } from '@/types/curriculum'

const ETIQUETA_DE_TIPO: Record<TipoDeCorreccion, string> = {
  ortografia: 'Ortografía',
  persona: 'Persona gramatical',
  tiempo_verbal: 'Tiempo verbal',
}

/**
 * Erratas y redacción, con el fragmento original y su corrección.
 *
 * Cada `original` aparece literalmente en el CV —el backend descarta las
 * correcciones que no se pueden localizar—, así que el usuario siempre puede
 * encontrar dónde está. No se renderiza si no hay ninguna: "0 correcciones" no
 * es un logro que haya que anunciar, y la IA no debe inventar errores.
 */
export default function RevisionDeRedaccion({ revision }: { revision: RevisionIA | null }) {
  const correcciones = revision?.correcciones ?? []
  if (correcciones.length === 0) return null

  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-headline-sm font-semibold text-vidrio-ink">Redacción y ortografía</h3>
        <EtiquetaMono tono="marca">Sugerencia de IA</EtiquetaMono>
      </div>
      <ul className="mt-3 divide-y divide-vidrio-linea">
        {correcciones.map(({ original, sugerido, tipo }) => (
          <li key={`${original}→${sugerido}`} className="py-2">
            <EtiquetaMono tono="suelto">{ETIQUETA_DE_TIPO[tipo]}</EtiquetaMono>
            <p className="mt-0.5 text-sm">
              <span className="text-error-texto line-through">{original}</span>
              <span className="mx-1.5 text-vidrio-tenue" aria-hidden>
                →
              </span>
              <span className="sr-only">se corrige como</span>
              <span className="text-vidrio-ink">{sugerido}</span>
            </p>
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}

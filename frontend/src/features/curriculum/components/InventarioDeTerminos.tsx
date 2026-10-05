import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Tarjeta from '@/components/ui/Tarjeta'

interface Props {
  terminos: string[]
}

/**
 * Las tecnologías que el ATS extrae del CV, cuando no hay convocatoria con que
 * compararlas.
 *
 * Ocupa el lugar de la brecha, y sale del mismo diccionario: con convocatoria se
 * comparan, sin ella se enumeran. Eso es lo que hace que la convocatoria se sienta
 * opcional de verdad y no como la diferencia entre útil e inútil.
 *
 * Y hace algo que el espejo solo no puede: si las habilidades están en barritas de
 * nivel, esta lista sale vacía. La advertencia `habilidades_en_graficos` pasa de
 * sospecha a prueba — el usuario ve la lista corta y entiende qué perdió.
 */
export default function InventarioDeTerminos({ terminos }: Props) {
  return (
    <Tarjeta className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Lo que un reclutador puede encontrar en tu CV
        </h2>
        <EtiquetaMono tono={terminos.length > 0 ? 'marca' : 'neutro'}>
          {terminos.length} {terminos.length === 1 ? 'término' : 'términos'}
        </EtiquetaMono>
      </div>

      {terminos.length === 0 ? (
        <p className="mt-2 text-sm text-error-texto">
          No se detectó ninguna tecnología como texto. Si tu CV las muestra en barras de nivel o
          iconos, el ATS no ve ninguna: escríbelas como una lista de texto.
        </p>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-vidrio-texto">
            Estas son las tecnologías que un ATS indexa de tu CV, y por las que podrías aparecer
            cuando un reclutador busque.
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {terminos.map((termino) => (
              <li
                key={termino}
                className="rounded-chip bg-vidrio-field px-2.5 py-1 font-mono-vidrio text-sm text-vidrio-texto"
              >
                {termino}
              </li>
            ))}
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

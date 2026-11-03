import Boton from '@/components/ui/Boton'
import Chip from '@/components/ui/Chip'
import Tarjeta from '@/components/ui/Tarjeta'

interface Props {
  terminos: string[]
  /** Vuelve a la entrada con el CV elegido y el foco en la convocatoria. */
  onComparar: () => void
}

/**
 * Sin convocatoria, la pregunta del Resumen es «¿por qué me encontrarían?»: las
 * tecnologías que el ATS indexa del CV, el inventario completo. Si las
 * habilidades están en barras de nivel, la lista sale vacía, y eso convierte la
 * advertencia `habilidades_en_graficos` de sospecha en prueba.
 *
 * Cierra con el paso a la otra ruta: saber qué te falta para un puesto concreto
 * solo se puede responder con su aviso, no con una lista genérica.
 */
export default function TecnologiasLegibles({ terminos, onComparar }: Props) {
  return (
    <Tarjeta className="p-5">
      <section aria-labelledby="titulo-te-encontrarian" className="flex h-full flex-col gap-3">
        <h3 id="titulo-te-encontrarian" className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Tecnologías por las que te encontrarían
        </h3>
        {terminos.length === 0 ? (
          <p className="text-sm text-error-texto">
            No encontramos tecnologías legibles en tu CV. Si están en barras de nivel, íconos o
            imágenes, el ATS no las ve: escríbelas como texto.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {terminos.map((termino) => (
              <li key={termino}>
                <Chip>
                  <span className="font-mono-vidrio">{termino}</span>
                </Chip>
              </li>
            ))}
          </ul>
        )}
        {/* Al fondo de la tarjeta, que se estira a la altura del espejo; en
            el tercio derecho (lg) vuelve a apilarse para no apretarse. */}
        <div className="mt-auto flex flex-col items-start gap-2 border-t border-vidrio-linea pt-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-start">
          <p className="text-sm text-vidrio-texto">
            ¿Vas a postular a un puesto? Mira qué palabras clave de su aviso tiene tu CV.
          </p>
          <Boton variante="secundario" tamano="sm" onClick={onComparar} className="shrink-0">
            Compara con una convocatoria
          </Boton>
        </div>
      </section>
    </Tarjeta>
  )
}

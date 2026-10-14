import type { Rubrica } from '@/types/catalogos'
import type { CodigoDeCriterio, Niveles } from '@/types/evaluacion'

const NIVEL_MAXIMO_POR_DEFECTO = 4
const CRITERIOS_POR_DEFECTO: { codigo: CodigoDeCriterio; nombre: string }[] = [
  { codigo: 'correccion', nombre: 'Corrección técnica' },
  { codigo: 'completitud', nombre: 'Completitud' },
  { codigo: 'claridad', nombre: 'Claridad' },
]

interface Props {
  niveles: Niveles
  puntuacion: number
  /** `null` mientras el catálogo carga: se muestran los niveles sin el cálculo. */
  rubrica: Rubrica | null
}

/**
 * La operación con los niveles de esta respuesta sustituidos.
 *
 * Con pesos iguales se escribe como suma simple —"100 · (3 + 2 + 3) / 12"—,
 * que es como se explica en la defensa; si algún día los pesos difieren, se
 * escriben explícitos para que la cuenta siga siendo reproducible a mano.
 */
function operacion(niveles: Niveles, puntuacion: number, rubrica: Rubrica): string {
  const { criterios, nivel_maximo } = rubrica
  const sumaDePesos = criterios.reduce((total, c) => total + c.peso, 0)
  const pesosIguales = criterios.every((c) => c.peso === 1)
  const terminos = criterios
    .map((c) => (pesosIguales ? `${niveles[c.codigo]}` : `${c.peso}·${niveles[c.codigo]}`))
    .join(' + ')
  const denominador = pesosIguales ? `${nivel_maximo * sumaDePesos}` : `(${nivel_maximo} · ${sumaDePesos})`
  return `100 · (${terminos}) / ${denominador} = ${puntuacion}`
}

/**
 * Cómo se obtuvo la nota de una respuesta: el nivel de cada criterio y la
 * fórmula. La IA solo eligió los niveles; la nota es esta cuenta.
 */
export default function DesgloseDeNota({ niveles, puntuacion, rubrica }: Props) {
  // Sin catálogo todavía, los nombres y el máximo salen de aquí para que la
  // fila de niveles no dependa de una segunda petición.
  const nivelMaximo = rubrica?.nivel_maximo ?? NIVEL_MAXIMO_POR_DEFECTO
  const criterios = rubrica?.criterios ?? CRITERIOS_POR_DEFECTO

  return (
    <div className="mb-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-vidrio-texto" aria-label="Nivel por criterio">
        {criterios.map((criterio) => (
          <li key={criterio.codigo}>
            {criterio.nombre}{' '}
            <span className="font-mono-vidrio text-vidrio-ink">
              {niveles[criterio.codigo]}/{nivelMaximo}
            </span>
          </li>
        ))}
      </ul>

      {rubrica && (
        <details className="group mt-2 text-sm">
          <summary className="cursor-pointer text-vidrio-acento hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vidrio-acento">
            ¿Cómo se calcula?
          </summary>
          <div className="mt-2 rounded-control bg-vidrio-field p-3 text-vidrio-texto">
            <dl className="space-y-1.5">
              {rubrica.criterios.map((criterio) => (
                <div key={criterio.codigo}>
                  <dt className="inline font-medium text-vidrio-ink">
                    {criterio.nombre}, nivel {niveles[criterio.codigo]}:
                  </dt>{' '}
                  <dd className="inline">{criterio.descriptores[niveles[criterio.codigo]]}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-mono-vidrio text-vidrio-ink">{operacion(niveles, puntuacion, rubrica)}</p>
            <p className="mt-1 text-meta text-vidrio-muted">
              La IA elige un nivel de 0 a {rubrica.nivel_maximo} por criterio; la nota es esta cuenta.
            </p>
          </div>
        </details>
      )}
    </div>
  )
}

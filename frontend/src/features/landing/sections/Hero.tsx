import AccionesDeRegistro from '@/features/landing/components/AccionesDeRegistro'
import VistaPreviaEntrevista from '@/features/landing/components/VistaPreviaEntrevista'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

interface Props {
  totalPreguntas: number | null
}

/**
 * Asimétrico: el titular a la izquierda y la vista previa del producto, grande,
 * a la derecha. La vista previa es lo único del primer pantallazo que muestra
 * qué hace Antesala, así que es la protagonista.
 *
 * Antes era todo centrado sobre un degradado que bajaba hasta el azul del
 * acento, con una cuadrícula enmascarada y un resplandor que "respiraba": la
 * firma más reconocible de una landing generada, y ninguno de los dos efectos
 * decía nada del producto. El fondo ahora es un azul pizarra casi plano, y el
 * botón vuelve a ser el único azul vivo de la pantalla.
 */
export default function Hero({ totalPreguntas }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  // Una línea de hechos en mono, en lugar de una fila de checks: cada dato es
  // algo que el sistema hace hoy, y la nota llega al terminar, no al instante.
  const hechos = [
    totalPreguntas !== null ? `${totalPreguntas} preguntas por entrevista` : 'Preguntas por puesto',
    'respuestas escritas',
    'nota al terminar',
  ]

  return (
    <section
      id="inicio"
      ref={ref}
      className="bg-(image:--gradiente-hero) pt-[clamp(112px,16vh,160px)] pb-[clamp(56px,9vh,104px)] text-white"
    >
      <Wrap className="grid items-center gap-x-12 gap-y-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div>
          <h1 className={`font-serif text-display text-balance ${clasesRevelado(visible)}`}>
            Prepárate para tu próxima entrevista técnica.
          </h1>

          <p
            className={`mt-6 max-w-[52ch] text-entrada text-pretty text-white/85 ${clasesRevelado(visible)} delay-100`}
          >
            Un entrevistador con inteligencia artificial te hace las preguntas del puesto al que
            postulas, evalúa lo que respondes y te dice qué mejorar. Y antes de postular, revisa
            qué lee un ATS de tu CV.
          </p>

          <div
            className={`mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 ${clasesRevelado(visible)} delay-200`}
          >
            <AccionesDeRegistro textoRegistro="Crear cuenta gratis" fondo="oscuro" />
          </div>

          <p
            className={`mt-8 font-mono-vidrio text-meta text-white/75 ${clasesRevelado(visible)} delay-200`}
          >
            {hechos.join(' · ')}
          </p>
        </div>

        <div className={`${clasesRevelado(visible)} delay-300`}>
          <VistaPreviaEntrevista />
        </div>
      </Wrap>
    </section>
  )
}

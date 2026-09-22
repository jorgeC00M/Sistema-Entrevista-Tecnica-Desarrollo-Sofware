import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

interface Props {
  totalPreguntas: number | null
}

export default function ComoFunciona({ totalPreguntas }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  const cuantas = totalPreguntas === null ? 'una serie de' : totalPreguntas
  const pasos: { icono: NombreDeIcono; titulo: string; texto: string }[] = [
    {
      icono: 'seleccion',
      titulo: 'Eliges área y nivel',
      texto:
        'Escoges sobre qué quieres que te pregunten y con qué grado de dificultad. La entrevista se arma a partir de esa elección.',
    },
    {
      icono: 'respuesta',
      titulo: `Respondes ${cuantas} preguntas`,
      texto:
        'El entrevistador plantea una pregunta a la vez y tú respondes por escrito, a tu ritmo. Puedes dejarla a medias y retomarla después.',
    },
    {
      icono: 'evaluacion',
      titulo: 'Recibes tu evaluación',
      texto:
        'Al terminar obtienes una calificación por cada respuesta y un resumen de la entrevista, con tu historial para comparar tu avance.',
    },
  ]

  return (
    <section id="como-funciona" ref={ref} className="scroll-mt-20 bg-tinta-50">
      <div className={`mx-auto max-w-5xl px-4 py-16 sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="text-center text-2xl font-bold text-tinta-950 sm:text-3xl">
          Cómo funciona
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-tinta-500">
          Tres pasos, sin instalar nada y sin coordinar horarios con nadie.
        </p>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {pasos.map((paso, indice) => (
            <li
              key={paso.titulo}
              className="rounded-superficie bg-white p-6 ring-1 ring-tinta-100"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-iris-50 text-iris-600">
                  <Icono nombre={paso.icono} />
                </span>
                <span className="text-sm font-medium text-tinta-500">Paso {indice + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-tinta-950">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-tinta-500">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

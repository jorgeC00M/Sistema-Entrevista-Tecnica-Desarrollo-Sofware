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
    <section id="como-funciona" ref={ref} className="scroll-mt-20">
      <div className={`mx-auto max-w-5xl px-4 py-16 sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="text-center font-serif text-2xl font-semibold text-vidrio-ink sm:text-3xl">
          Cómo funciona
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-vidrio-texto">
          Tres pasos, sin instalar nada y sin coordinar horarios con nadie.
        </p>

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {pasos.map((paso, indice) => (
            <li
              key={paso.titulo}
              className="rounded-vidrio border border-vidrio-borde bg-vidrio-card p-6 shadow-[0_8px_24px_-12px_rgba(28,47,94,0.18)] backdrop-blur-[18px]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
                  <Icono nombre={paso.icono} />
                </span>
                <span className="text-sm font-medium text-vidrio-muted">Paso {indice + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-vidrio-ink">{paso.titulo}</h3>
              <p className="mt-2 text-sm text-vidrio-texto">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

const ENTREGABLES: { icono: NombreDeIcono; titulo: string; texto: string; color: string }[] = [
  {
    icono: 'evaluacion',
    titulo: 'Una puntuación de 0 a 100',
    texto:
      'Cada respuesta se califica con la misma rúbrica: corrección técnica, completitud y claridad. La misma respuesta obtiene siempre la misma nota.',
    color: 'bg-vidrio-acento-suave text-vidrio-acento',
  },
  {
    icono: 'fortaleza',
    titulo: 'Tus fortalezas',
    texto: 'Qué demostraste saber y qué partes de tu respuesta funcionaron bien.',
    color: 'bg-exito-fondo text-exito-texto',
  },
  {
    icono: 'mejora',
    titulo: 'Tus debilidades',
    texto: 'Los vacíos concretos que se notaron, sin rodeos y sin generalidades.',
    color: 'bg-progreso-fondo text-progreso-texto',
  },
  {
    icono: 'sugerencia',
    titulo: 'Sugerencias de mejora',
    texto: 'Qué estudiar o cómo reformular la respuesta la próxima vez.',
    color: 'bg-vidrio-acento-suave text-vidrio-acento',
  },
]

export default function QueRecibes() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section id="que-recibes" ref={ref} className="scroll-mt-20">
      <div className={`mx-auto max-w-5xl px-4 py-16 sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="text-center font-serif text-2xl font-semibold text-vidrio-ink sm:text-3xl">
          Qué recibes al terminar
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-vidrio-texto">
          No es un banco de preguntas: es una evaluación de lo que respondiste.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {ENTREGABLES.map((e) => (
            <div
              key={e.titulo}
              className="flex gap-4 rounded-vidrio border border-vidrio-borde bg-vidrio-card p-6 shadow-[0_8px_24px_-12px_rgba(28,47,94,0.18)] backdrop-blur-[18px]"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${e.color}`}
              >
                <Icono nombre={e.icono} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-vidrio-ink">{e.titulo}</h3>
                <p className="mt-1 text-sm text-vidrio-texto">{e.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {/* El alcance del perfil obliga a decirlo, y decirlo aquí —donde se está
            leyendo qué se recibe— es más honesto que esconderlo en el pie. */}
        <p className="mx-auto mt-8 max-w-2xl rounded-vidrio bg-vidrio-field px-4 py-3 text-center text-sm text-vidrio-muted">
          La evaluación la genera un modelo de inteligencia artificial. Es una herramienta de
          práctica y no sustituye el criterio de un entrevistador humano.
        </p>
      </div>
    </section>
  )
}

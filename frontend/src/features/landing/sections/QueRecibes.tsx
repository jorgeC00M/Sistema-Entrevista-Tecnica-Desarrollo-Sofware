import Icono from '@/features/landing/components/Icono'
import type { NombreDeIcono } from '@/features/landing/components/Icono'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

const ENTREGABLES: { icono: NombreDeIcono; titulo: string; texto: string; color: string }[] = [
  {
    icono: 'evaluacion',
    titulo: 'Una puntuación de 0 a 100',
    texto:
      'Cada respuesta se califica con la misma rúbrica: corrección técnica, completitud y claridad. La misma respuesta obtiene siempre la misma nota.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icono: 'fortaleza',
    titulo: 'Tus fortalezas',
    texto: 'Qué demostraste saber y qué partes de tu respuesta funcionaron bien.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icono: 'mejora',
    titulo: 'Tus debilidades',
    texto: 'Los vacíos concretos que se notaron, sin rodeos y sin generalidades.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icono: 'sugerencia',
    titulo: 'Sugerencias de mejora',
    texto: 'Qué estudiar o cómo reformular la respuesta la próxima vez.',
    color: 'bg-sky-50 text-sky-600',
  },
]

export default function QueRecibes() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section id="que-recibes" ref={ref} className="scroll-mt-20 border-y border-slate-200 bg-white">
      <div className={`mx-auto max-w-5xl px-4 py-16 sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Qué recibes al terminar
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          No es un banco de preguntas: es una evaluación de lo que respondiste.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {ENTREGABLES.map((e) => (
            <div key={e.titulo} className="flex gap-4 rounded-xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${e.color}`}
              >
                <Icono nombre={e.icono} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">{e.titulo}</h3>
                <p className="mt-1 text-sm text-slate-600">{e.texto}</p>
              </div>
            </div>
          ))}
        </div>

        {/* El alcance del perfil obliga a decirlo, y decirlo aquí —donde se está
            leyendo qué se recibe— es más honesto que esconderlo en el pie. */}
        <p className="mx-auto mt-8 max-w-2xl rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 ring-1 ring-slate-200">
          La evaluación la genera un modelo de inteligencia artificial. Es una herramienta de
          práctica y no sustituye el criterio de un entrevistador humano.
        </p>
      </div>
    </section>
  )
}

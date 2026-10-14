import Tarjeta from '@/components/ui/Tarjeta'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

interface Props {
  totalPreguntas: number | null
}

/**
 * Los pasos van como lista, y al lado una sola pieza: el recorrido de una
 * entrevista tal como lo arma el sistema (dos preguntas de calentamiento, luego
 * preguntas que se ajustan, y la nota al final).
 *
 * Antes eran tres tarjetas iguales con un círculo numerado y una línea que se
 * llenaba: el "tres pasos" de plantilla. El número del paso se queda porque
 * aquí sí informa —el orden importa—, pero va en la lista, no como adorno.
 */
export default function ComoFunciona({ totalPreguntas }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  const cuantas = totalPreguntas ?? 5
  const pasos = [
    {
      titulo: 'Eliges puesto y nivel',
      texto:
        'Backend, frontend o full stack, con el grado de dificultad que quieras y, si prefieres, una tecnología. Cada pregunta toca una de las áreas de ese puesto.',
    },
    {
      titulo: `Respondes ${cuantas} preguntas`,
      texto:
        'Una a la vez, por escrito y a tu ritmo. Puedes dejar la entrevista a medias y retomarla después.',
    },
    {
      titulo: 'Recibes tu evaluación',
      texto:
        'Al terminar ves la calificación de cada respuesta y un resumen. Mientras respondes no hay nota, como en una entrevista real.',
    },
  ]

  // El recorrido real: PREGUNTAS_DE_CALENTAMIENTO = 2 en el backend; desde la
  // tercera, cada pregunta recibe los puntajes anteriores.
  const recorrido = [
    { tramo: 'Preguntas 1 y 2', detalle: 'Calentamiento: miden tu punto de partida.' },
    {
      tramo: cuantas > 3 ? `Preguntas 3 a ${cuantas}` : 'Pregunta 3',
      detalle: 'Se ajustan a cómo vas: la exigencia depende de tus respuestas anteriores.',
    },
    { tramo: 'Al terminar', detalle: 'Nota por respuesta, fortalezas, debilidades y sugerencias.' },
  ]

  return (
    <section id="como-funciona" ref={ref} className="scroll-mt-24 py-[clamp(80px,10vw,128px)]">
      <Wrap
        className={`grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] ${clasesRevelado(visible)}`}
      >
        <div>
          <EncabezadoSeccion
            titulo="Cómo funciona"
            descripcion="Tres pasos, sin instalar nada y sin coordinar horarios con nadie."
          />

          <ol className="divide-y divide-vidrio-linea border-y border-vidrio-linea">
            {pasos.map((paso, indice) => (
              <li key={paso.titulo} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 py-5">
                <span className="pt-0.5 font-mono-vidrio text-meta font-semibold text-vidrio-acento">
                  {indice + 1}
                </span>
                <div>
                  <h3 className="text-tarjeta text-vidrio-ink">{paso.titulo}</h3>
                  <p className="mt-1 max-w-[62ch] text-cuerpo text-vidrio-texto">{paso.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <Tarjeta className="p-6 sm:p-8 lg:mt-24">
          <h3 className="text-tarjeta text-vidrio-ink">El recorrido de una entrevista</h3>
          <ol className="mt-5 space-y-5 border-l border-vidrio-linea pl-5">
            {recorrido.map(({ tramo, detalle }, indice) => (
              <li key={tramo} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 -left-[25px] h-2 w-2 rounded-full ${
                    indice === recorrido.length - 1 ? 'bg-vidrio-acento' : 'bg-vidrio-tenue'
                  }`}
                />
                <p className="font-mono-vidrio text-meta text-vidrio-muted">{tramo}</p>
                <p className="mt-0.5 text-cuerpo text-vidrio-ink">{detalle}</p>
              </li>
            ))}
          </ol>
        </Tarjeta>
      </Wrap>
    </section>
  )
}

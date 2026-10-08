import { CLASES_TARJETA_ELEVADA } from '@/components/ui/Tarjeta'
import Icono from '@/components/ui/Icono'
import type { NombreDeIcono } from '@/components/ui/Icono'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import Wrap from '@/features/landing/components/Wrap'
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
      titulo: 'Eliges puesto y nivel',
      texto:
        'Backend, frontend o full stack, con el grado de dificultad que quieras y, si prefieres, una tecnología. Cada pregunta toca una de las áreas de ese puesto.',
    },
    {
      icono: 'respuesta',
      titulo: `Respondes ${cuantas} preguntas`,
      texto:
        'Una pregunta a la vez, por escrito y a tu ritmo. Desde la tercera, el entrevistador ajusta la exigencia según cómo vas. Puedes dejarla a medias y retomarla después.',
    },
    {
      icono: 'evaluacion',
      titulo: 'Recibes tu evaluación',
      texto:
        'Al terminar ves la calificación de cada respuesta y un resumen de la entrevista. Mientras respondes no hay nota, como en una entrevista real.',
    },
  ]

  return (
    <section id="como-funciona" ref={ref} className="scroll-mt-24 py-[clamp(64px,8vw,100px)]">
      <Wrap className={clasesRevelado(visible)}>
        <EncabezadoSeccion
          indice="01"
          titulo="Cómo funciona"
          descripcion="Tres pasos, sin instalar nada y sin coordinar horarios con nadie."
        />

        <div className="relative">
          {/* Línea conectora entre los 3 pasos, se llena al entrar en pantalla. */}
          <div
            aria-hidden="true"
            className="absolute top-[44px] right-[8%] left-[8%] hidden h-0.5 overflow-hidden rounded-full bg-vidrio-linea md:block"
          >
            <span
              className={`block h-full bg-vidrio-acento transition-[width] duration-[1600ms] ease-[cubic-bezier(.2,.7,.2,1)] ${
                visible ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {pasos.map((paso, indice) => (
              <li
                key={paso.titulo}
                className={`relative ${CLASES_TARJETA_ELEVADA}`}
              >
                <div
                  className="mb-[22px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-vidrio-acento text-sm font-semibold text-white"
                  style={{ boxShadow: '0 0 0 6px var(--color-vidrio-bg)' }}
                >
                  {indice + 1}
                </div>
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
                  <Icono nombre={paso.icono} />
                </span>
                <h3 className="text-base font-semibold text-vidrio-ink">{paso.titulo}</h3>
                <p className="mt-2 text-sm text-vidrio-texto">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </Wrap>
    </section>
  )
}

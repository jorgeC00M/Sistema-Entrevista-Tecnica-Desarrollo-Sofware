import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'

interface Props {
  totalPreguntas: number | null
}

export default function Hero({ totalPreguntas }: Props) {
  return (
    <section className="relative overflow-hidden">
      {/* Manchas decorativas: puramente ornamentales, para que el efecto de
          vidrio de las tarjetas más abajo tenga algo de color detrás sobre
          lo que recortarse. Sin imágenes nuevas, solo CSS. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[26rem] w-[26rem] -translate-x-[60%] rounded-full bg-vidrio-acento-suave blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-10 right-1/2 -z-10 h-[20rem] w-[20rem] translate-x-[70%] rounded-full bg-vidrio-acento-suave blur-3xl"
      />

      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <p className="mb-4 inline-block rounded-full bg-vidrio-acento-suave px-3 py-1 text-[0.72rem] font-medium tracking-wide text-vidrio-acento uppercase">
          Para egresados de Ingeniería de Sistemas · UMSS
        </p>

        <h1 className="font-serif text-[2.8rem] leading-[1.1] font-semibold tracking-[-0.01em] text-balance text-vidrio-ink sm:text-[3.5rem]">
          Practica la entrevista técnica antes de que sea la de verdad
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-vidrio-texto sm:text-lg">
          Un entrevistador con inteligencia artificial te hace preguntas del área que elijas,
          evalúa lo que respondes y te dice exactamente qué mejorar. Sin agendar con nadie y
          cuantas veces quieras.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/registro" className="w-full sm:w-auto">
            <Boton
              variante="vidrio"
              forma="pildora"
              className="h-[50px] w-full px-6 text-base sm:w-auto"
            >
              Crear cuenta gratis
            </Boton>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Boton
              variante="vidrio-secundario"
              forma="pildora"
              className="h-[50px] w-full px-6 text-base sm:w-auto"
            >
              Ya tengo cuenta
            </Boton>
          </Link>
        </div>

        {totalPreguntas !== null && (
          <p className="mt-6 text-sm text-vidrio-muted">
            {totalPreguntas} preguntas por entrevista · Respuestas escritas · Resultados al
            instante
          </p>
        )}
      </div>
    </section>
  )
}

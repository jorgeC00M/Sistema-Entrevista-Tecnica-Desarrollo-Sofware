import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'

interface Props {
  totalPreguntas: number | null
}

export default function Hero({ totalPreguntas }: Props) {
  return (
    <section className="border-b border-tinta-100 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <p className="mb-4 inline-block rounded-full bg-iris-50 px-3 py-1 text-xs font-medium text-iris-700">
          Para egresados de Ingeniería de Sistemas · UMSS
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-balance text-tinta-950 sm:text-5xl">
          Practica la entrevista técnica antes de que sea la de verdad
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-tinta-500 sm:text-lg">
          Un entrevistador con inteligencia artificial te hace preguntas del área que elijas,
          evalúa lo que respondes y te dice exactamente qué mejorar. Sin agendar con nadie y
          cuantas veces quieras.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/registro" className="w-full sm:w-auto">
            <Boton className="w-full px-6 py-3 text-base sm:w-auto">Crear cuenta gratis</Boton>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Boton variante="secundario" className="w-full px-6 py-3 text-base sm:w-auto">
              Ya tengo cuenta
            </Boton>
          </Link>
        </div>

        {totalPreguntas !== null && (
          <p className="mt-6 text-sm text-tinta-500">
            {totalPreguntas} preguntas por entrevista · Respuestas escritas · Resultados al
            instante
          </p>
        )}
      </div>
    </section>
  )
}

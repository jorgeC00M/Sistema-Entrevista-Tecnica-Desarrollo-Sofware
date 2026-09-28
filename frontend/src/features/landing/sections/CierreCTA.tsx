import { Link } from 'react-router-dom'

import Boton from '@/components/ui/Boton'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

export default function CierreCTA() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section ref={ref} className="bg-vidrio-acento">
      <div className={`mx-auto max-w-3xl px-4 py-16 text-center sm:py-20 ${clasesRevelado(visible)}`}>
        <h2 className="font-serif text-2xl font-semibold text-balance text-white sm:text-3xl">
          ¿Quieres iniciar con la entrevista?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-white/80">
          Crea tu cuenta y empieza la primera simulación ahora mismo. No necesitas tarjeta ni
          agendar con nadie.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/registro" className="w-full sm:w-auto">
            {/* Botón blanco sobre el acento: vidrio-secundario ya es blanco
                con anillo, que es exactamente el contraste que hace falta aquí. */}
            <Boton
              variante="vidrio-secundario"
              forma="pildora"
              className="h-[50px] w-full px-6 text-base sm:w-auto"
            >
              Crear cuenta
            </Boton>
          </Link>
          <Link
            to="/login"
            className="rounded-control px-4 py-3 text-base font-medium text-white underline-offset-4 transition hover:underline"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </section>
  )
}

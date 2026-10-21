import EtiquetaMono from '@/components/ui/EtiquetaMono'
import Icono from '@/components/ui/Icono'
import Tarjeta from '@/components/ui/Tarjeta'
import SugerenciaIA from '@/features/curriculum/components/SugerenciaIA'
import type { AnalisisDeVinetas } from '@/types/curriculum'

interface Props {
  vinetas: AnalisisDeVinetas
  /** Viñeta original → reescritura propuesta por la IA. Sin revisión, vacío. */
  sugerencias?: Record<string, string>
}

/**
 * Viñetas que describen un resultado frente a las que describen una tarea.
 *
 * **Va bajo su propio encabezado, separado de las secciones de ATS, y eso es un
 * requisito y no una preferencia estética.** A un ATS le da exactamente igual si
 * una viñeta trae métricas: su trabajo es indexar texto. Esto concierne a la
 * persona que lee el CV *después* de que la máquina lo encontró. Presentarlo
 * mezclado con los hallazgos de parseabilidad sería impreciso, y la precisión
 * sobre qué hace un ATS es lo que sostiene la credibilidad del módulo entero.
 */
export default function VinetasDeLogro({ vinetas, sugerencias = {} }: Props) {
  const todasSonLogros = vinetas.logros === vinetas.total

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2 border-t border-vidrio-linea pt-6">
        <h2 className="font-serif text-headline-md font-semibold text-vidrio-ink">
          Y cuando un humano lo lea
        </h2>
        <EtiquetaMono>No es un filtro ATS</EtiquetaMono>
      </div>

      <Tarjeta className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-headline-sm font-semibold text-vidrio-ink">
            Viñetas con un resultado medible
          </h3>
          <EtiquetaMono tono={todasSonLogros ? 'marca' : 'neutro'}>
            {vinetas.proporcion}
          </EtiquetaMono>
        </div>

        {todasSonLogros ? (
          <p className="mt-2 text-sm text-vidrio-texto">
            Todas tus viñetas cuantifican lo que conseguiste. Es lo que distingue un CV de una
            descripción de puesto.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-vidrio-texto">
              Estas describen la responsabilidad en lugar del resultado. Reescríbelas con una cifra:
              «Encargado del módulo de pagos» dice mucho menos que «Reduje la latencia de pagos 40%».
              Si aún no tienes experiencia laboral, vale igual para un proyecto o tu tesis: «Implementé
              el módulo de reportes de mi tesis; redujo de 2 horas a 10 minutos el cierre mensual».
            </p>
            <ul className="mt-3 space-y-2">
              {vinetas.sin_resultado.map((texto) => (
                <li key={texto} className="flex items-start gap-2.5">
                  <span className="mt-0.5 shrink-0 text-progreso-texto">
                    <Icono nombre="mejora" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm text-vidrio-texto italic">«{texto}»</span>
                    {sugerencias[texto] && <SugerenciaIA>{sugerencias[texto]}</SugerenciaIA>}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Tarjeta>
    </section>
  )
}

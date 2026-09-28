import { CLASES_TARJETA } from '@/components/ui/Tarjeta'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'
import { useProgresoAnimado } from '@/features/landing/hooks/useProgresoAnimado'

interface Props {
  preguntas: number
  areas: number
  niveles: number
}

const PUNTOS_MAXIMOS = 100

/**
 * Tarjeta de vidrio con 4 contadores que animan desde 0 al entrar en
 * pantalla. Preguntas/áreas/niveles vienen del catálogo público ya cargado
 * por `LandingPage.tsx` — solo "puntos" es una constante fija (la escala de
 * la rúbrica, no un dato del backend).
 */
export default function FranjaDatos({ preguntas, areas, niveles }: Props) {
  const { ref, visible } = useRevelarAlEntrar<HTMLDivElement>()

  const contadorPreguntas = useProgresoAnimado(preguntas, visible)
  const contadorAreas = useProgresoAnimado(areas, visible)
  const contadorNiveles = useProgresoAnimado(niveles, visible)
  const contadorPuntos = useProgresoAnimado(PUNTOS_MAXIMOS, visible)

  const stats = [
    { valor: contadorPreguntas, etiqueta: 'preguntas por entrevista' },
    { valor: contadorAreas, etiqueta: 'áreas técnicas' },
    { valor: contadorNiveles, etiqueta: 'niveles de dificultad' },
    { valor: contadorPuntos, etiqueta: 'puntos por respuesta' },
  ]

  return (
    <div className="pt-10">
      <Wrap>
        <div
          ref={ref}
          className={`grid grid-cols-2 gap-y-5 px-2.5 py-6 shadow-[0_18px_40px_-24px_rgba(28,47,94,0.3)] sm:grid-cols-4 ${CLASES_TARJETA} ${clasesRevelado(visible)}`}
        >
          {stats.map((s, i) => (
            <div
              key={s.etiqueta}
              className={`px-4 text-center ${i < stats.length - 1 ? 'sm:border-r sm:border-vidrio-linea' : ''}`}
            >
              <b className="block font-serif text-[2.2rem] leading-none font-semibold text-vidrio-ink">
                {s.valor}
              </b>
              <span className="text-[0.88rem] text-vidrio-texto">{s.etiqueta}</span>
            </div>
          ))}
        </div>
      </Wrap>
    </div>
  )
}

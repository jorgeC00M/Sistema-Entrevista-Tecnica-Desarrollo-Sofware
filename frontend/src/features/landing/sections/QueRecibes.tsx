import ChipPuntaje from '@/components/ui/ChipPuntaje'
import ListaRetroalimentacion from '@/components/ui/ListaRetroalimentacion'
import Tarjeta from '@/components/ui/Tarjeta'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import ListaDeFunciones from '@/features/landing/components/ListaDeFunciones'
import type { Funcion } from '@/features/landing/components/ListaDeFunciones'
import NotaAclaratoria from '@/features/landing/components/NotaAclaratoria'
import Wrap from '@/features/landing/components/Wrap'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

const FUNCIONES: Funcion[] = [
  {
    icono: 'evaluacion',
    colorIcono: 'text-vidrio-acento',
    titulo: 'Una nota de 0 a 100 por respuesta',
    texto:
      'Con la misma rúbrica para todas: corrección técnica, completitud y claridad. Cada respuesta se evalúa sola, sin depender del orden ni de lo que respondiste antes.',
  },
  {
    icono: 'mejora',
    colorIcono: 'text-progreso-texto',
    titulo: 'Fortalezas y debilidades concretas',
    texto: 'Qué demostraste saber y qué vacíos se notaron, sin rodeos y sin generalidades.',
  },
  {
    icono: 'sugerencia',
    colorIcono: 'text-vidrio-acento',
    titulo: 'Sugerencias de mejora',
    texto: 'Qué estudiar o cómo reformular la respuesta la próxima vez.',
  },
  {
    icono: 'historial',
    colorIcono: 'text-vidrio-ink',
    titulo: 'Tu progreso',
    texto:
      'El historial de tus entrevistas, tu evolución por nivel y puesto, y el reporte de cada una con su plan de mejora.',
  },
]

/**
 * Lo que se recibe, mostrado con un fragmento del resultado y no con un medidor.
 *
 * Antes la pieza central era un anillo animado con un "85 de 100" gigante: una
 * cifra inventada para la demo y un puntaje convertido en trofeo, contra la regla
 * "Quiet Score" de DESIGN.md. Ahora se ve lo que de verdad entrega la pantalla de
 * resultados —la pregunta, la nota en un chip y la retroalimentación—, con los
 * mismos componentes que usa la aplicación.
 */
export default function QueRecibes() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  return (
    <section
      id="que-recibes"
      ref={ref}
      className="scroll-mt-24 border-y border-vidrio-linea bg-white/40 py-[clamp(80px,10vw,128px)]"
    >
      <Wrap className={clasesRevelado(visible)}>
        <EncabezadoSeccion
          titulo="Qué recibes al terminar"
          descripcion="No es un banco de preguntas: es una evaluación de lo que respondiste."
        />

        <div className="grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <Tarjeta como="article" className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono-vidrio text-meta text-vidrio-muted">
                Ejemplo · Pregunta 3 · Bases de datos
              </p>
              <ChipPuntaje puntuacion={74} banda="aceptable" conEtiqueta />
            </div>

            <p className="mt-4 text-tarjeta text-vidrio-ink">
              ¿Cuándo usarías un índice compuesto y en qué orden pondrías sus columnas?
            </p>
            <p className="mt-3 rounded-control bg-vidrio-field p-3 text-cuerpo text-vidrio-texto">
              Cuando una consulta filtra por varias columnas a la vez. Pondría primero la que más
              filtra…
            </p>

            <dl className="mt-5 grid gap-3">
              <ListaRetroalimentacion
                variante="fortalezas"
                texto="Identificas bien el caso de uso de un índice compuesto."
              />
              <ListaRetroalimentacion
                variante="debilidades"
                texto="No mencionas la regla del prefijo izquierdo ni cuándo el índice deja de usarse."
              />
              <ListaRetroalimentacion
                variante="sugerencias"
                texto="Explica con un ejemplo qué consultas aprovechan el índice y cuáles no."
              />
            </dl>
          </Tarjeta>

          <ListaDeFunciones funciones={FUNCIONES} />
        </div>

        {/* El alcance del perfil obliga a decirlo, y decirlo aquí —donde se está
            leyendo qué se recibe— es más honesto que esconderlo en el pie. */}
        <NotaAclaratoria>
          La evaluación la genera un modelo de inteligencia artificial. Es una herramienta de
          práctica y no sustituye el criterio de un entrevistador humano.
        </NotaAclaratoria>
      </Wrap>
    </section>
  )
}

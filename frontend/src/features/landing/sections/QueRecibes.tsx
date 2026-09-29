import { CLASES_TARJETA_ELEVADA } from '@/components/ui/Tarjeta'
import Icono from '@/components/ui/Icono'
import EncabezadoSeccion from '@/features/landing/components/EncabezadoSeccion'
import Wrap from '@/features/landing/components/Wrap'
import { useProgresoAnimado } from '@/features/landing/hooks/useProgresoAnimado'
import { clasesRevelado, useRevelarAlEntrar } from '@/features/landing/hooks/useRevelarAlEntrar'

const RADIO_GAUGE = 82
const CIRCUNFERENCIA_GAUGE = 2 * Math.PI * RADIO_GAUGE

const RUBRICA = [
  { etiqueta: 'Corrección técnica', valor: 90 },
  { etiqueta: 'Completitud', valor: 78 },
  { etiqueta: 'Claridad', valor: 87 },
]

const TARJETAS = {
  fortalezas: {
    icono: 'fortaleza' as const,
    color: 'bg-exito-fondo text-exito-texto',
    titulo: 'Tus fortalezas',
    texto: 'Qué demostraste saber y qué partes de tu respuesta funcionaron bien.',
  },
  debilidades: {
    icono: 'mejora' as const,
    color: 'bg-progreso-fondo text-progreso-texto',
    titulo: 'Tus debilidades',
    texto: 'Los vacíos concretos que se notaron, sin rodeos y sin generalidades.',
  },
  sugerencias: {
    icono: 'sugerencia' as const,
    color: 'bg-vidrio-acento-suave text-vidrio-acento',
    titulo: 'Sugerencias de mejora',
    texto: 'Qué estudiar o cómo reformular la respuesta la próxima vez.',
  },
}

export default function QueRecibes() {
  const { ref, visible } = useRevelarAlEntrar<HTMLElement>()

  const gaugeValor = useProgresoAnimado(85, visible, 1800)
  const barraCorreccion = useProgresoAnimado(RUBRICA[0].valor, visible, 1400)
  const barraCompletitud = useProgresoAnimado(RUBRICA[1].valor, visible, 1400)
  const barraClaridad = useProgresoAnimado(RUBRICA[2].valor, visible, 1400)
  const barras = [barraCorreccion, barraCompletitud, barraClaridad]

  return (
    <section
      id="que-recibes"
      ref={ref}
      className="scroll-mt-24 border-y border-vidrio-borde bg-white/45 py-[clamp(64px,8vw,100px)]"
    >
      <Wrap className={clasesRevelado(visible)}>
        <EncabezadoSeccion
          indice="02"
          titulo="Qué recibes al terminar"
          descripcion="No es un banco de preguntas: es una evaluación de lo que respondiste."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
          {/* Tarjeta grande: puntuación ilustrativa con medidor y rúbrica. */}
          <article
            className={`flex flex-col bg-linear-to-br from-white/75 to-white/45 sm:col-span-2 lg:col-span-1 lg:row-span-2 ${CLASES_TARJETA_ELEVADA}`}
          >
            <span className="mb-[18px] flex h-11 w-11 items-center justify-center rounded-control bg-vidrio-acento-suave text-vidrio-acento">
              <Icono nombre="evaluacion" />
            </span>
            <h3 className="text-[1.15rem] font-semibold text-vidrio-ink">
              Una puntuación de 0 a 100
            </h3>
            <p className="mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">
              Cada respuesta se califica con la misma rúbrica: corrección técnica, completitud y
              claridad. La misma respuesta obtiene siempre la misma nota.
            </p>

            <div className="relative mx-auto my-[22px] h-[190px] w-[190px]">
              <svg width="190" height="190" className="-rotate-90">
                <circle
                  cx="95"
                  cy="95"
                  r={RADIO_GAUGE}
                  fill="none"
                  stroke="rgba(28,47,94,.1)"
                  strokeWidth="14"
                />
                <circle
                  cx="95"
                  cy="95"
                  r={RADIO_GAUGE}
                  fill="none"
                  stroke="var(--color-vidrio-acento)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUNFERENCIA_GAUGE}
                  strokeDashoffset={CIRCUNFERENCIA_GAUGE * (1 - gaugeValor / 100)}
                  style={{ transition: 'stroke-dashoffset 1.8s cubic-bezier(.2,.7,.2,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <b className="font-serif text-[3.2rem] leading-none font-semibold text-vidrio-ink">
                  {gaugeValor}
                </b>
                <small className="text-[0.85rem] text-vidrio-muted">de 100</small>
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2.5">
              {RUBRICA.map((item, i) => (
                <div
                  key={item.etiqueta}
                  className="grid grid-cols-[120px_1fr_34px] items-center gap-3 text-[0.86rem]"
                >
                  <span className="text-vidrio-texto">{item.etiqueta}</span>
                  <i className="not-italic h-2 overflow-hidden rounded-full bg-vidrio-linea">
                    <span
                      className="block h-full rounded-full bg-vidrio-acento transition-[width] duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)]"
                      style={{ width: `${barras[i]}%` }}
                    />
                  </i>
                  <em className="text-right font-semibold text-vidrio-ink not-italic">
                    {barras[i]}
                  </em>
                </div>
              ))}
            </div>
          </article>

          <article className={CLASES_TARJETA_ELEVADA}>
            <span
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-control ${TARJETAS.fortalezas.color}`}
            >
              <Icono nombre={TARJETAS.fortalezas.icono} />
            </span>
            <h3 className="text-[1.15rem] font-semibold text-vidrio-ink">
              {TARJETAS.fortalezas.titulo}
            </h3>
            <p className="mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">
              {TARJETAS.fortalezas.texto}
            </p>
          </article>

          <article className={CLASES_TARJETA_ELEVADA}>
            <span
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-control ${TARJETAS.debilidades.color}`}
            >
              <Icono nombre={TARJETAS.debilidades.icono} />
            </span>
            <h3 className="text-[1.15rem] font-semibold text-vidrio-ink">
              {TARJETAS.debilidades.titulo}
            </h3>
            <p className="mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">
              {TARJETAS.debilidades.texto}
            </p>
          </article>

          <article className={`sm:col-span-2 ${CLASES_TARJETA_ELEVADA}`}>
            <span
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-control ${TARJETAS.sugerencias.color}`}
            >
              <Icono nombre={TARJETAS.sugerencias.icono} />
            </span>
            <h3 className="text-[1.15rem] font-semibold text-vidrio-ink">
              {TARJETAS.sugerencias.titulo}
            </h3>
            <p className="mt-2 text-[0.96rem] leading-[1.6] text-vidrio-texto">
              {TARJETAS.sugerencias.texto}
            </p>
          </article>
        </div>

        {/* El alcance del perfil obliga a decirlo, y decirlo aquí —donde se está
            leyendo qué se recibe— es más honesto que esconderlo en el pie. */}
        <p className="mt-[22px] flex max-w-[760px] items-start gap-2.5 text-[0.86rem] text-vidrio-muted">
          <Icono nombre="info" className="mt-0.5 h-4 w-4 shrink-0" />
          La evaluación la genera un modelo de inteligencia artificial. Es una herramienta de
          práctica y no sustituye el criterio de un entrevistador humano.
        </p>
      </Wrap>
    </section>
  )
}
